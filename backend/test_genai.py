import os
import sys
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load env
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(base_dir, '.env.local'))

api_key = os.getenv("GEMINI_API_KEY")

with open("test_output.txt", "w") as f:
    f.write(f"API Key present: {bool(api_key)}\n")
    if api_key:
        f.write(f"API Key starts with: {api_key[:4]}...\n")

    if not api_key:
        f.write("FAIL: No API Key found\n")
        sys.exit(1)

    client = genai.Client(api_key=api_key)
    prompt = "List 3 hospitals in Delhi. Return JSON."
    
    f.write("Sending request to Gemini...\n")
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type='application/json'
            )
        )
        f.write("Response received:\n")
        f.write(response.text)
        f.write("\nSUCCESS\n")
    except Exception as e:
        f.write(f"FAIL: Error calling Gemini: {e}\n")
