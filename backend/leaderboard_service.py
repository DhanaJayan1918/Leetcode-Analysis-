import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client["leetcode_tracker"]

snapshots_collection = db["leetcode_snapshots"]
students_collection = db["students"]


def get_leaderboard(sort_field):

    pipeline = [

        {"$sort": {"snapshot_date": -1}},

        {
            "$group": {
                "_id": "$username",
                "total_solved": {"$first": "$total_solved"},
                "easy": {"$first": "$easy"},
                "medium": {"$first": "$medium"},
                "hard": {"$first": "$hard"},
                "contest_rating": {"$first": "$contest_rating"},
                "ranking": {"$first": "$ranking"}
            }
        },

        {
            "$lookup": {
                "from": "students",
                "localField": "_id",
                "foreignField": "leetcode_username",
                "as": "student"
            }
        },

        {
            "$addFields": {
                "username": "$_id",
                "name": {
                    "$cond": {
                        "if": {"$gt": [{"$size": "$student"}, 0]},
                        "then": {"$arrayElemAt": ["$student.name", 0]},
                        "else": "Unknown"
                    }
                }
            }
        },

        {
            "$project": {
                "_id": 0,
                "student": 0
            }
        },

        {"$sort": {sort_field: -1}}
    ]

    results = list(snapshots_collection.aggregate(pipeline))
    for entry in results:
        if "contest_rating" in entry:
            entry["contest_rating"] = round(entry["contest_rating"])
    return results