import os
import json
import random
import requests
from dotenv import load_dotenv
from google import genai
from google.genai import types
from groq import Groq
from duckduckgo_search import DDGS

# Load environment variables
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(base_dir, '.env.local'))

# If not found there, try loading from system env or local .env
if not os.getenv("GEMINI_API_KEY"):
    load_dotenv()

def refine_results_with_llm(state, search_items, provider):
    """
    Helper to parse raw search results into clean hospital objects using an LLM.
    """
    # Create context from search results
    context_lines = []
    for item in search_items:
        title = item.get('title', 'Unknown Title')
        snippet = item.get('snippet', item.get('body', ''))
        link = item.get('link', item.get('href', ''))
        context_lines.append(f"- Title: {title}\n  Snippet: {snippet}\n  URL: {link}")
    
    context = "\n".join(context_lines)
    
    prompt = f"""
    You are a data extraction bot.
    I have a list of search results for specific hospitals in "{state}", India.
    Your task is to identifying 5 DISTINCT, REAL HOSPITAL NAMES from this text.
    
    Rules:
    1. Ignore "Top 10" listicle titles, instead look for the actual hospital names mentioned in the Snippets.
    2. If the snippet lists multiple hospitals (e.g. "AIIMS, Apollo, Fortis"), extract them as separate entries.
    3. If you cannot find 5 names in the text, use your internal knowledge to fill the gap with major real hospitals in {state}.
    4. Return valid JSON only.
    
    Search Context:
    {context}
    
    Return strict JSON array:
    [
        {{
            "name": "Actual Hospital Name",
            "location": "City, {state}",
            "type": "Government or Private",
            "source_url": "url from context or google.com",
            "medicine_stock": {{
                "Paracetamol": "2500 units",
                "Antibiotics": "1000 units",
                "Insulin": "500 units",
                "Start-IV Fluids": "1000 units",
                "O2 Cylinders": "50 units"
            }},
            "last_updated": "Verified via {provider}"
        }}
    ]
    """
    
    try:
        if provider == "gemini":
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key: return []
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model='gemini-1.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type='application/json')
            )
            if response.text:
                clean = response.text.replace("```json", "").replace("```", "").strip()
                return json.loads(clean)
            
        elif provider == "groq":
             api_key = os.getenv("GROQ_API_KEY")
             if not api_key: return []
             client = Groq(api_key=api_key)
             completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
             content = completion.choices[0].message.content
             data = json.loads(content)
             # Handle diverse JSON responses
             if isinstance(data, dict):
                 # Check for common wrapper keys
                 for k in ['hospitals', 'data', 'items']:
                     if k in data and isinstance(data[k], list): return data[k]
                 # If just a dict, maybe wrap it?
                 return [data]
             if isinstance(data, list): return data
             
    except Exception as e:
        print(f"LLM Refine failed ({provider}): {e}")
    
    return []

def fetch_with_google_cse(state: str):
    """
    Uses Google Programmable Search Engine (CSE) JSON API.
    """
    api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
    cse_id = os.getenv("GOOGLE_SEARCH_ENGINE_ID")
    
    if not api_key or not cse_id:
        print("Google CSE Keys not found. Skipping CSE.")
        return None

    print(f"Fetching with Google CSE for {state}...")
    
    # Query designed to get entities
    query = f"top 5 best hospitals in {state} India names"
    url = "https://www.googleapis.com/customsearch/v1"
    params = {'key': api_key, 'cx': cse_id, 'q': query, 'num': 8}
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        items = data.get('items', [])
        
        # Raw results fallback
        raw_results = []
        for item in items:
            raw_results.append({
                "name": item.get('title', 'Hospital'),
                "location": state,
                "type": "General",
                "source_url": item.get('link'),
                "medicine_stock": {"Paracetamol": "Unknown"},
                "last_updated": "Raw Search Result"
            })

        # Try to refine with LLMs
        refined_data = []
        
        # 1. Gemini
        if os.getenv("GEMINI_API_KEY"):
            print("Refining with Gemini...")
            refined_data = refine_results_with_llm(state, items, "gemini")
            
        # 2. Groq (if Gemini failed/empty)
        if not refined_data and os.getenv("GROQ_API_KEY"):
            print("Refining with Groq...")
            refined_data = refine_results_with_llm(state, items, "groq")
            
        if refined_data:
            return refined_data
            
        print("LLM Refinement returned nothing. Using raw results.")
        return raw_results[:5] if raw_results else None

    except Exception as e:
        print(f"Google CSE failed: {e}")
        return None

def fetch_with_groq_ddg(state: str):
    """
    Fallback: DuckDuckGo Search + Groq Extraction
    """
    print("Fallback: Groq + DuckDuckGo...")
    try:
        query = f"list of major government and private hospitals in {state} India"
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=6))
            
        if not results: return None
        
        # Format for LLM
        search_items = [{"title": r['title'], "snippet": r['body'], "link": r['href']} for r in results]
        return refine_results_with_llm(state, search_items, "groq")
        
    except Exception as e:
        print(f"Groq+DDG failed: {e}")
        return None

def search_hospitals(state: str):
    # Strategy 1: Google CSE (High Quality Search + LLM Extraction)
    cse_data = fetch_with_google_cse(state)
    if cse_data:
        return cse_data

    # Strategy 2: Gemini with Native Grounding (If CSE keys missing)
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        try:
            client = genai.Client(api_key=api_key)
            prompt = f"""
            List 5 MAJOR, REAL Government and Private hospitals in the state of "{state}", India.
            Return JSON array with strict keys: name, location, type, source_url, medicine_stock, last_updated.
            """
            response = client.models.generate_content(
                model='gemini-1.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    tools=[types.Tool(
                        google_search_retrieval=types.GoogleSearchRetrieval(
                             dynamic_retrieval_config=types.DynamicRetrievalConfig(
                                mode=types.DynamicRetrievalConfigMode.MODE_DYNAMIC,
                                dynamic_threshold=0.3,
                            )
                        )
                    )],
                    response_mime_type='application/json'
                )
            )
            if response.text:
                clean = response.text.replace("```json", "").replace("```", "").strip()
                return json.loads(clean)
        except Exception as e:
            print(f"Gemini Grounding failed: {e}")

    # Strategy 3: Groq + DuckDuckGo (Backup Search)
    groq_data = fetch_with_groq_ddg(state)
    if groq_data:
        return groq_data

    # Strategy 4: Failed to fetch
    return []