import pandas as pd
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))

db = client["leetcode_tracker"]
students_collection = db["students"]

df = pd.read_csv("strict_verified_students_name_username.csv")

students = []

for _, row in df.iterrows():
    students.append({
        "name": row["Name"],
        "leetcode_username": row["Leetcode_Username"],
        "department": "AIDS",
        "batch": "2026"
    })

students_collection.delete_many({})

students_collection.insert_many(students)

print(f"Inserted {len(students)} students successfully.")