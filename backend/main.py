from dotenv import load_dotenv
import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.orm import sessionmaker, declarative_base

# Load env variables from root .env.local
env_path = Path(__file__).resolve().parent.parent / '.env.local'
load_dotenv(dotenv_path=env_path)

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "MedSupply Backend is running"}

@app.get("/api/location")
def get_location(request: Request):
    # Vercel automatically creates these headers
    city = request.headers.get("x-vercel-ip-city")
    region = request.headers.get("x-vercel-ip-country-region")
    country = request.headers.get("x-vercel-ip-country")
    lat = request.headers.get("x-vercel-ip-latitude")
    lon = request.headers.get("x-vercel-ip-longitude")
    
    return {
        "city": city,
        "region": region,
        "country": country,
        "latitude": lat,
        "longitude": lon,
        "success": bool(city and lat and lon)
    }


from scraper import search_hospitals
from insights import get_weather, get_health_trends

@app.get("/api/hospitals/{state}")
def get_hospitals(state: str):
    data = search_hospitals(state)
    return {"state": state, "hospitals": data}

@app.get("/api/insights")
async def get_insights(lat: float, lon: float, city: str, state: str):
    weather_data = await get_weather(lat, lon)
    health_data = get_health_trends(city, city, state) # simplistic district mapping
    
    return {
        "location": {
            "city": city,
            "state": state,
            "coordinates": {"lat": lat, "lon": lon}
        },
        "environment": weather_data,
        "health_intelligence": health_data
    }

