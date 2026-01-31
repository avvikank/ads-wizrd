import requests
import json

url = "http://localhost:8000/api/generate-hooks"
data = {
    "context": {
        "url": "https://bolt.new",
        "category": "AI Development Environment",
        "icp": "Developers and Founders",
        "product_idea": "Build full-stack web apps in seconds with AI"
    },
    "triggers": ["Curiosity", "Fear"]
}

try:
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
