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

valid_users = []
invalid_users = []

for username in df["Leetcode_Username"]:
    try:
        response = requests.post(
            LEETCODE_URL,
            json={"query": query, "variables": {"username": username}},
            timeout=10
        )

        data = response.json()
        exists = data.get("data", {}).get("matchedUser") is not None

        if exists:
            valid_users.append(username)
            print(f"{username} → VALID")
        else:
            invalid_users.append(username)
            print(f"{username} → NOT FOUND")

        time.sleep(1)

    except Exception as e:
        invalid_users.append(username)
        print(f"{username} → ERROR")

# Save results
pd.DataFrame(valid_users, columns=["Valid_Usernames"]).to_csv("valid_users.csv", index=False)
pd.DataFrame(invalid_users, columns=["Invalid_Usernames"]).to_csv("invalid_users.csv", index=False)

print("\nVerification Completed")
print(f"Valid: {len(valid_users)}")
print(f"Invalid: {len(invalid_users)}")