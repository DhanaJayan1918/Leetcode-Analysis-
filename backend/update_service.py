import time
from datetime import datetime, timedelta
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from leetcode_service import fetch_and_store

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client["leetcode_tracker"]

students_collection = db["students"]
snapshots_collection = db["leetcode_snapshots"]

UPDATE_COOLDOWN_HOURS = 24


def update_all_students():

    # Check the most recent snapshot across all students
    latest = snapshots_collection.find_one(
        {}, sort=[("snapshot_date", -1)], projection={"snapshot_date": 1}
    )

    if latest and latest.get("snapshot_date"):
        hours_since = (datetime.utcnow() - latest["snapshot_date"]).total_seconds() / 3600
        if hours_since < UPDATE_COOLDOWN_HOURS:
            print(f"Last update was {hours_since:.1f}h ago (< {UPDATE_COOLDOWN_HOURS}h). Skipping update.")
            return {"message": f"Skipped — last update was {hours_since:.1f}h ago"}

    print("Starting full update (last update > 24h ago or no snapshots found)...")

    students = list(students_collection.find({}))

    for student in students:
        username = student["leetcode_username"]

        print(f"Updating {username}...")

        fetch_and_store(username)

        time.sleep(2)

    return {"message": "All students updated successfully"}