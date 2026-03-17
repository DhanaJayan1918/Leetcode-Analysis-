import pandas as pd
import requests
import time

file_path = "cleaned_leetcode_students.csv"
df = pd.read_csv(file_path)

LEETCODE_URL = "https://leetcode.com/graphql"

query = """
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
  }
}
"""

for username in df["Leetcode_Username"].head(10):
    try:
        response = requests.post(
            LEETCODE_URL,
            json={"query": query, "variables": {"username": username}},
            timeout=10
        )

        data = response.json()
        exists = data.get("data", {}).get("matchedUser") is not None

        print(f"{username} → {'VALID' if exists else 'NOT FOUND'}")

        time.sleep(1)

    except Exception as e:
        print(f"{username} → ERROR: {e}")