import requests
import json

LEETCODE_URL = "https://leetcode.com/graphql"

query = """
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

response = requests.post(
    LEETCODE_URL,
    json={"query": query, "variables": {"username": "Dhanajayan1918"}},
    timeout=10
)

print(json.dumps(response.json(), indent=2))
