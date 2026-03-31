import requests
from datetime import datetime
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


def fetch_and_store(username: str):

    response = requests.post(
        LEETCODE_URL,
        json={"query": query, "variables": {"username": username}},
        timeout=10
    )

    data = response.json()["data"]

    if data["matchedUser"] is None:
        return None

    stats = data["matchedUser"]["submitStats"]["acSubmissionNum"]

    total = stats[0]["count"]
    easy = stats[1]["count"]
    medium = stats[2]["count"]
    hard = stats[3]["count"]

    contest = data["userContestRanking"]

    snapshot = {
        "username": username,
        "total_solved": total,
        "easy": easy,
        "medium": medium,
        "hard": hard,
        "ranking": data["matchedUser"]["profile"]["ranking"],
        "contest_rating": round(contest["rating"]) if contest else 0,
        "contest_global_rank": contest["globalRanking"] if contest else 0,
        "contest_count": contest["attendedContestsCount"] if contest else 0,
        "snapshot_date": datetime.utcnow()
    }

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
