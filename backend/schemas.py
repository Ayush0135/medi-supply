from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class MedicineBase(BaseModel):
    name: str
    category: str
    stock: int
    expiry: str
    critical_threshold: int

class MedicineCreate(MedicineBase):
    pass

class Medicine(MedicineBase):
    id: str
    class Config:
        orm_mode = True

class ReportBase(BaseModel):
    location: str
    symptoms: List[str]
    severity: int

class ReportCreate(ReportBase):
    pass

class Report(ReportBase):
    id: str
    timestamp: datetime
    class Config:
        orm_mode = True

class SupplierBase(BaseModel):
    name: str
    location: str
    capacity: Dict[str, int]

class Supplier(SupplierBase):
    id: str
    class Config:
        orm_mode = True

class AIAnalysisResult(BaseModel):
    riskLevel: str
    predictedDemand: int
    recommendation: str
    reasoning: str
    affectedRegion: str
    targetedMedicine: str
