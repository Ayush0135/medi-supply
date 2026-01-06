import os
import json
from dotenv import load_dotenv
from scraper import fetch_with_google_cse

# Load env variables
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(base_dir, '.env.local'))

def test_cse():
    print("Testing Google CSE Fetch...")
    state = "Delhi"
    data = fetch_with_google_cse(state)
    
    if data:
        print(f"SUCCESS: Fetched {len(data)} hospitals for {state}")
        print(json.dumps(data, indent=2))
    else:
        print("FAIL: No data returned.")

if __name__ == "__main__":
    test_cse()
