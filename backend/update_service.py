import time
import threading
from datetime import datetime, timedelta
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from leetcode_service import fetch_and_store, LeetCodeRateLimitError

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client["leetcode_tracker"]

students_collection = db["students"]
snapshots_collection = db["leetcode_snapshots"]
update_state_collection = db["leetcode_update_state"]
UPDATE_STATE_ID = "global"

UPDATE_COOLDOWN_HOURS = 24
REQUEST_DELAY_SECONDS = 2        # pause between students (same as original)
MAX_CONSECUTIVE_FAILURES = 5     # stop hammering LeetCode if it is clearly unhealthy

# Only one update may run at a time (startup/scheduler thread vs POST /update-all).
_update_lock = threading.Lock()

# Cached in memory, but persisted in MongoDB so Render restarts do not lose retries.
_pending_retry = set()
_defer_until = None


def _load_retry_state():
    """Restore pending usernames and any server-requested defer time."""
    global _pending_retry, _defer_until
    state = update_state_collection.find_one({"_id": UPDATE_STATE_ID}) or {}
    _pending_retry = set(state.get("pending_usernames", []))
    _defer_until = state.get("defer_until")


def _save_retry_state():
    update_state_collection.update_one(
        {"_id": UPDATE_STATE_ID},
        {"$set": {
            "pending_usernames": sorted(_pending_retry),
            "defer_until": _defer_until,
            "updated_at": datetime.utcnow(),
        }},
        upsert=True,
    )


def _has_recent_snapshot(username):
    """True if this student already has a snapshot inside the cooldown window."""
    cutoff = datetime.utcnow() - timedelta(hours=UPDATE_COOLDOWN_HOURS)
    return snapshots_collection.find_one(
        {"username": username, "snapshot_date": {"$gte": cutoff}},
        projection={"_id": 1}
    ) is not None


def update_all_students():

    if not _update_lock.acquire(blocking=False):
        print("An update is already running. Skipping.")
        return {"message": "Skipped — an update is already in progress"}

    try:
        return _run_update()
    finally:
        _update_lock.release()


def _run_update():
    global _pending_retry, _defer_until

    _load_retry_state()
    now = datetime.utcnow()
    if _defer_until and now < _defer_until:
        remaining = int((_defer_until - now).total_seconds())
        return {"message": f"Skipped — LeetCode Retry-After cooldown active ({remaining}s remaining)"}
    if _defer_until:
        _defer_until = None
        _save_retry_state()

    retry_only = False

    # Check the most recent snapshot across all students (original cooldown rule)
    latest = snapshots_collection.find_one(
        {}, sort=[("snapshot_date", -1)], projection={"snapshot_date": 1}
    )

    if latest and latest.get("snapshot_date"):
        hours_since = (datetime.utcnow() - latest["snapshot_date"]).total_seconds() / 3600
        if hours_since < UPDATE_COOLDOWN_HOURS:
            if not _pending_retry:
                print(f"Last update was {hours_since:.1f}h ago (< {UPDATE_COOLDOWN_HOURS}h). Skipping update.")
                return {"message": f"Skipped — last update was {hours_since:.1f}h ago"}
            # An earlier run was interrupted (e.g. rate limited). Finish only the
            # students it did not complete; each one is still limited to one
            # snapshot per cooldown window by _has_recent_snapshot below.
            retry_only = True
            print(f"Resuming interrupted update for {len(_pending_retry)} student(s)...")

    if not retry_only:
        print("Starting full update (last update > 24h ago or no snapshots found)...")

    students = list(students_collection.find({}))
    if retry_only:
        students = [s for s in students if s.get("leetcode_username") in _pending_retry]

    updated = []
    failed = []
    not_found = []
    pending = set()
    consecutive_failures = 0
    stop_reason = None
    made_request = False

    for index, student in enumerate(students):
        username = student.get("leetcode_username")
        if not username:
            continue

        # Never fetch the same student twice inside one cooldown window
        if _has_recent_snapshot(username):
            continue

        if made_request:
            time.sleep(REQUEST_DELAY_SECONDS)
        made_request = True

        print(f"Updating {username}...")

        try:
            snapshot = fetch_and_store(username)
        except LeetCodeRateLimitError as exc:
            print(f"Rate limited while updating {username}: {exc}. Stopping this run.")
            failed.append(username)
            pending.add(username)
            retry_after = getattr(exc, "retry_after_seconds", None)
            if retry_after is not None and retry_after > 0:
                _defer_until = datetime.utcnow() + timedelta(seconds=retry_after)
            stop_reason = "rate limited by LeetCode"
        except Exception as exc:
            print(f"Failed to update {username}: {exc.__class__.__name__}: {exc}")
            failed.append(username)
            pending.add(username)
            consecutive_failures += 1
            if consecutive_failures >= MAX_CONSECUTIVE_FAILURES:
                stop_reason = f"{consecutive_failures} consecutive failures"
        else:
            consecutive_failures = 0
            if snapshot is None:
                print(f"{username} not found on LeetCode. Skipping.")
                not_found.append(username)
            else:
                updated.append(username)

        if stop_reason:
            print(f"Stopping update early: {stop_reason}.")
            for rest in students[index + 1:]:
                rest_name = rest.get("leetcode_username")
                if rest_name:
                    pending.add(rest_name)
            break

    _pending_retry = pending
    if not pending:
        _defer_until = None
    _save_retry_state()

    if not failed and not stop_reason:
        return {"message": "All students updated successfully"}

    message = f"Update finished with issues: {len(updated)} updated, {len(failed)} failed"
    if stop_reason:
        message += f", stopped early ({stop_reason}); {len(pending)} will be retried"
    return {"message": message, "updated": len(updated), "failed": len(failed)}
