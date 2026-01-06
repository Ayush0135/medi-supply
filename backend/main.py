from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.orm import sessionmaker, declarative_base

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
    return {"message": "MedSupply AI Backend is running"}


from .scraper import search_hospitals
from .insights import get_weather, get_health_trends

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

