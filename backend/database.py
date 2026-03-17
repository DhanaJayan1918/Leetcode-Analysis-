import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client["leetcode_tracker"]

students_collection = db["students"]
snapshots_collection = db["leetcode_snapshots"]