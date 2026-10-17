import requests
import random
import time
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client["leetcode_tracker"]

students_collection = db["students"]
snapshots_collection = db["leetcode_snapshots"]

LEETCODE_URL = "https://leetcode.com/graphql"

query = """
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    submitStats {
      acSubmissionNum {
        difficulty
        count
      }
    }
    profile {
      ranking
    }
  }
  userContestRanking(username: $username) {
    rating
    globalRanking
    attendedContestsCount
  }
}
"""

recent_submissions_query = """
query recentAcSubmissions($username: String!, $limit: Int!) {
  recentAcSubmissionList(username: $username, limit: $limit) {
    title
    titleSlug
    timestamp
    lang
  }
}
"""

contest_history_query = """
query getContestHistory($username: String!) {
  userContestRankingHistory(username: $username) {
    attended
    rating
    ranking
    trendDirection
    problemsSolved
    totalProblems
    finishTimeInSeconds
    contest {
      title
      startTime
    }
  }
}
"""


# --- Request handling settings (used by fetch_and_store) -------------------
REQUEST_TIMEOUT_SECONDS = 10
MAX_ATTEMPTS = 4                # 1 initial try + 3 retries
BACKOFF_BASE_SECONDS = 2        # 2s, 4s, 8s ... (before jitter)
BACKOFF_MAX_SECONDS = 60
MAX_RETRY_AFTER_SECONDS = 120   # never block a worker longer than this on one wait
RETRYABLE_STATUS_CODES = {500, 502, 503, 504}


class LeetCodeFetchError(Exception):
    """A request/response problem; no snapshot should be stored."""


class LeetCodeRateLimitError(LeetCodeFetchError):
    """LeetCode keeps answering HTTP 429; callers should stop sending requests."""

    def __init__(self, message, retry_after_seconds=None):
        super().__init__(message)
        self.retry_after_seconds = retry_after_seconds


def _parse_retry_after(value):
    """Return seconds from a Retry-After header (delta-seconds or HTTP-date), else None."""
    if not value:
        return None
    value = str(value).strip()
    try:
        return max(0.0, float(value))
    except ValueError:
        pass
    try:
        when = parsedate_to_datetime(value)
        if when.tzinfo is None:
            when = when.replace(tzinfo=timezone.utc)
        return max(0.0, (when - datetime.now(timezone.utc)).total_seconds())
    except (TypeError, ValueError):
        return None


def _backoff_delay(attempt: int) -> float:
    """Exponential backoff with jitter: between 50% and 100% of the ceiling."""
    ceiling = min(BACKOFF_MAX_SECONDS, BACKOFF_BASE_SECONDS * (2 ** attempt))
    return ceiling / 2 + random.uniform(0, ceiling / 2)


def _post_graphql(payload: dict) -> dict:
    """
    POST to LeetCode with bounded retries. Returns the parsed JSON body of a
    200 response. Retries 429, 500/502/503/504, timeouts and connection errors
    with exponential backoff + jitter, honouring Retry-After. Raises
    LeetCodeRateLimitError / LeetCodeFetchError when giving up.
    """
    last_error = None

    for attempt in range(MAX_ATTEMPTS):
        retry_after = None

        try:
            response = requests.post(
                LEETCODE_URL, json=payload, timeout=REQUEST_TIMEOUT_SECONDS
            )
        except (requests.Timeout, requests.ConnectionError) as exc:
            last_error = LeetCodeFetchError(f"network error: {exc.__class__.__name__}")
        else:
            status = response.status_code

            if status == 200:
                try:
                    body = response.json()
                except ValueError:
                    raise LeetCodeFetchError("response was not valid JSON")
                if not isinstance(body, dict):
                    raise LeetCodeFetchError("unexpected response shape")
                return body

            if status == 429:
                retry_after = _parse_retry_after(response.headers.get("Retry-After"))
                if retry_after is not None and retry_after > MAX_RETRY_AFTER_SECONDS:
                    # Server asked for a long pause: do not wait in-process, stop instead.
                    raise LeetCodeRateLimitError(
                        f"HTTP 429, Retry-After {retry_after:.0f}s exceeds limit",
                        retry_after_seconds=retry_after,
                    )
                last_error = LeetCodeRateLimitError(
                "HTTP 429 (rate limited)", retry_after_seconds=retry_after
            )
            elif status in RETRYABLE_STATUS_CODES:
                last_error = LeetCodeFetchError(f"HTTP {status}")
            else:
                # 4xx other than 429 will not get better by retrying.
                raise LeetCodeFetchError(f"HTTP {status}")

        if attempt == MAX_ATTEMPTS - 1:
            break

        delay = _backoff_delay(attempt)
        if retry_after is not None:
            delay = max(delay, retry_after)
        time.sleep(delay)

    raise last_error


def fetch_and_store(username: str):
    """
    Fetch a profile and store one snapshot. Returns the snapshot, or None if the
    LeetCode user does not exist. Raises LeetCodeFetchError (or its subclass
    LeetCodeRateLimitError) on request failures or malformed responses; in that
    case nothing is written to the database.
    """

    body = _post_graphql({"query": query, "variables": {"username": username}})

    data = body.get("data")
    if not isinstance(data, dict) or "matchedUser" not in data:
        raise LeetCodeFetchError("response missing profile data")

    matched = data["matchedUser"]
    if matched is None:
        return None

    try:
        stats = matched["submitStats"]["acSubmissionNum"]
        by_difficulty = {item["difficulty"]: int(item["count"]) for item in stats}
        if {"All", "Easy", "Medium", "Hard"} <= by_difficulty.keys():
            total = by_difficulty["All"]
            easy = by_difficulty["Easy"]
            medium = by_difficulty["Medium"]
            hard = by_difficulty["Hard"]
        else:
            # Same positional layout the original code relied on
            total, easy, medium, hard = (int(stats[i]["count"]) for i in range(4))

        contest = data.get("userContestRanking")

        snapshot = {
            "username": username,
            "total_solved": total,
            "easy": easy,
            "medium": medium,
            "hard": hard,
            "ranking": matched["profile"]["ranking"],
            "contest_rating": round(contest["rating"]) if contest else 0,
            "contest_global_rank": contest["globalRanking"] if contest else 0,
            "contest_count": contest["attendedContestsCount"] if contest else 0,
            "snapshot_date": datetime.utcnow()
        }
    except (KeyError, IndexError, TypeError, ValueError) as exc:
        raise LeetCodeFetchError(f"malformed profile data ({exc.__class__.__name__})")

    snapshots_collection.insert_one(snapshot)

    return snapshot


def fetch_recent_submissions(username: str, limit: int = 15):
    try:
        response = requests.post(
            LEETCODE_URL,
            json={
                "query": recent_submissions_query,
                "variables": {"username": username, "limit": limit}
            },
            timeout=10
        )
        data = response.json().get("data", {})
        submissions = data.get("recentAcSubmissionList", [])

        results = []
        for sub in submissions:
            results.append({
                "title": sub["title"],
                "titleSlug": sub["titleSlug"],
                "timestamp": sub["timestamp"],
                "lang": sub["lang"],
            })
        return results
    except Exception:
        return []

def fetch_contest_history(username: str):
    try:
        response = requests.post(
            LEETCODE_URL,
            json={
                "query": contest_history_query,
                "variables": {"username": username}
            },
            timeout=10
        )
        data = response.json().get("data", {})
        history = data.get("userContestRankingHistory", [])
        
        # Filter out contests that the user did not attend
        attended = [contest for contest in history if contest.get("attended") is True]
        return attended
    except Exception:
        return []

