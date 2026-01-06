export enum UserRole {
  ADMIN = 'ADMIN',
  WAREHOUSE = 'WAREHOUSE',
  COMMUNITY = 'COMMUNITY',
  SUPPLIER = 'SUPPLIER'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  expiry: string;
  criticalThreshold: number;
}

export interface Supplier {
  id: string;
  name: string;
  location: string;
  capacity: Record<string, number>; // medicineId -> max quantity they can supply
}

export interface SymptomReport {
  id: string;
  location: string;
  symptoms: string[];
  severity: number; // 1-10
  timestamp: Date;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AIAnalysisResult {
  riskLevel: RiskLevel;
  predictedDemand: number;
  recommendation: string;
  reasoning: string;
  affectedRegion: string;
  targetedMedicine: string;
}

export interface RegionStats {
  id: string;
  name: string;
  risk: RiskLevel;
  activeCases: number;
}