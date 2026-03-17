from fastapi import FastAPI
from leaderboard_service import get_leaderboard
from update_service import update_all_students
from leetcode_service import fetch_recent_submissions
from database import students_collection, snapshots_collection
from fastapi.middleware.cors import CORSMiddleware
import threading


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_update():
    # Run update in a background thread so server starts immediately
    thread = threading.Thread(target=update_all_students, daemon=True)
    thread.start()

@app.get("/")
def home():
    return {"message": "LeetCode Analytics Backend Running"}

@app.get("/leaderboard/contest")
def contest_leaderboard():
    return get_leaderboard("contest_rating")

@app.get("/leaderboard/total")
def total_leaderboard():
    return get_leaderboard("total_solved")

@app.get("/leaderboard/hard")
def hard_leaderboard():
    return get_leaderboard("hard")

@app.post("/update-all")
def update_all():
    return update_all_students()

@app.get("/search")
def search_students(query: str):
    matched_students = list(
        students_collection.find(
            {
                "$or": [
                    {"name": {"$regex": query, "$options": "i"}},
                    {"leetcode_username": {"$regex": query, "$options": "i"}}
                ]
            },
            {"_id": 0, "name": 1, "leetcode_username": 1}
        ).limit(10)
    )

    results = []
    for s in matched_students:
        username = s["leetcode_username"]
        latest = snapshots_collection.find_one(
            {"username": username},
            projection={"_id": 0, "total_solved": 1},
            sort=[("snapshot_date", -1)]
        )
        results.append({
            "name": s["name"],
            "username": username,
            "total_solved": latest["total_solved"] if latest else 0
        })

    return {"data": results}

@app.get("/student/{username}")
def get_student_profile(username: str):

    latest_snapshot = snapshots_collection.find_one(
        {"username": username},
        projection={"_id": 0},
        sort=[("snapshot_date", -1)]
    )

    student = students_collection.find_one(
        {"leetcode_username": username},
        {"_id": 0}
    )

    return {
        "name": student["name"] if student else "Unknown",
        "username": username,
        "total_solved": latest_snapshot["total_solved"],
        "easy_solved": latest_snapshot["easy"],
        "medium_solved": latest_snapshot["medium"],
        "hard_solved": latest_snapshot["hard"],
        "hard": latest_snapshot["hard"],
        "contest_rating": round(latest_snapshot["contest_rating"]),
    }

@app.get("/student/{username}/recent")
def get_recent_submissions(username: str):
    submissions = fetch_recent_submissions(username, limit=15)
    return {"data": submissions}

@app.get("/student/{username}/weekly")
def get_weekly_analysis(username: str):
    from collections import defaultdict

    snapshots = list(
        snapshots_collection.find(
            {"username": username},
            {"_id": 0, "snapshot_date": 1, "total_solved": 1, "easy": 1, "medium": 1, "hard": 1}
        ).sort("snapshot_date", 1)
    )

    if not snapshots:
        return {"data": []}

    # Group snapshots by ISO week, keep the latest snapshot per week
    weekly = {}
    for snap in snapshots:
        d = snap["snapshot_date"]
        iso = d.isocalendar()
        week_key = f"{iso[0]}-W{iso[1]:02d}"
        weekly[week_key] = snap  # last one wins (sorted ascending)

    weeks = list(weekly.keys())
    result = []
    for i, week in enumerate(weeks):
        snap = weekly[week]
        total = snap.get("total_solved", 0)
        easy = snap.get("easy", 0)
        medium = snap.get("medium", 0)
        hard = snap.get("hard", 0)

        if i == 0:
            delta_total = 0
            delta_easy = 0
            delta_medium = 0
            delta_hard = 0
        else:
            prev = weekly[weeks[i - 1]]
            delta_total = total - prev.get("total_solved", 0)
            delta_easy = easy - prev.get("easy", 0)
            delta_medium = medium - prev.get("medium", 0)
            delta_hard = hard - prev.get("hard", 0)

        result.append({
            "week": week,
            "total_solved": total,
            "easy": easy,
            "medium": medium,
            "hard": hard,
            "delta_total": delta_total,
            "delta_easy": delta_easy,
            "delta_medium": delta_medium,
            "delta_hard": delta_hard,
        })

    return {"data": result}
