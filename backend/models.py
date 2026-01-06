from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Medicine(Base):
    __tablename__ = "medicines"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)
    stock = Column(Integer)
    expiry = Column(String) # Storing as string YYYY-MM-DD for simplicity
    critical_threshold = Column(Integer)

class SymptomReport(Base):
    __tablename__ = "reports"
    
    id = Column(String, primary_key=True, index=True)
    location = Column(String, index=True)
    symptoms = Column(JSON) # List of symptoms
    severity = Column(Integer)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    location = Column(String)
    capacity = Column(JSON) # Dictionary {medicine_id: quantity}

class Forecast(Base):
    __tablename__ = "forecasts"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    medicine_id = Column(String, ForeignKey("medicines.id"))
    predicted_demand = Column(Float)
    risk_level = Column(String)
    reasoning = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
