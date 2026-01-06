import { GoogleGenAI, Type } from "@google/genai";
import { Medicine, SymptomReport, AIAnalysisResult, RegionStats, Supplier } from '../types';

/*
 * NOTE: This file simulates the Python FastAPI backend and MongoDB database.
 * It uses Google Gemini 2.5 Flash to implement the AI Agent logic requested
 * in the prompt, running serverlessly on the client for this demo.
 */

// --- MOCK DATABASE ---

let medicines: Medicine[] = [
  { id: '1', name: 'Amoxicillin', category: 'Antibiotic', stock: 1200, expiry: '2025-10-01', criticalThreshold: 500 },
  { id: '2', name: 'Paracetamol', category: 'Analgesic', stock: 5000, expiry: '2026-01-15', criticalThreshold: 1000 },
  { id: '3', name: 'Tamiflu', category: 'Antiviral', stock: 200, expiry: '2024-12-01', criticalThreshold: 300 }, // Intentionally low for demo
  { id: '4', name: 'Ibuprofen', category: 'Analgesic', stock: 2500, expiry: '2025-05-20', criticalThreshold: 800 },
];

let reports: SymptomReport[] = [
  { id: 'r1', location: 'North Sector', symptoms: ['Fever', 'Cough'], severity: 7, timestamp: new Date() },
  { id: 'r2', location: 'North Sector', symptoms: ['Fever', 'Fatigue'], severity: 6, timestamp: new Date() },
  { id: 'r3', location: 'East Sector', symptoms: ['Headache'], severity: 3, timestamp: new Date() },
];

let suppliers: Supplier[] = [
  { id: 's1', name: 'PharmaCorp Global', location: 'South Sector', capacity: { '1': 5000, '2': 10000, '3': 500 } },
  { id: 's2', name: 'RapidMed Logistics', location: 'East Sector', capacity: { '3': 2000, '4': 5000 } }
];

// --- SERVICE LAYER ---

export const InventoryService = {
  getAll: async (): Promise<Medicine[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...medicines]), 300));
  },
  updateStock: async (id: string, newStock: number): Promise<void> => {
    medicines = medicines.map(m => m.id === id ? { ...m, stock: newStock } : m);
  },
  addMedicine: async (item: Omit<Medicine, 'id'>): Promise<Medicine> => {
    return new Promise((resolve) => {
      const newMedicine = { ...item, id: Math.random().toString(36).substr(2, 9) };
      medicines.push(newMedicine);
      setTimeout(() => resolve(newMedicine), 300);
    });
  }
};

export const SupplierService = {
  getSuppliers: async (): Promise<Supplier[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...suppliers]), 300));
  },
  updateCapacity: async (supplierId: string, medicineId: string, newCapacity: number): Promise<void> => {
    suppliers = suppliers.map(s => {
      if (s.id === supplierId) {
        return { ...s, capacity: { ...s.capacity, [medicineId]: newCapacity } };
      }
      return s;
    });
  }
};

export const CommunityService = {
  submitReport: async (report: Omit<SymptomReport, 'id' | 'timestamp'>): Promise<void> => {
    const newReport = {
      ...report,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    reports.push(newReport);
  },
  getRecentReports: async (): Promise<SymptomReport[]> => {
    return [...reports];
  }
};

// --- AI AGENT ---

export const AIService = {
  runAnalysis: async (): Promise<AIAnalysisResult> => {
    try {
      // 1. Prepare Data for the AI
      const inventoryContext = JSON.stringify(medicines.map(m => ({ name: m.name, stock: m.stock, threshold: m.criticalThreshold })));
      const reportsContext = JSON.stringify(reports.map(r => ({ location: r.location, symptoms: r.symptoms })));

      // 2. Initialize Gemini (if key exists)
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("No API Key");

      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-2.5-flash"; // Using 2.5 Flash for speed and JSON capabilities

      const prompt = `
        You are an AI Supply Chain Agent for a public health system.
        
        Analyze the following data:
        1. Medicine Inventory: ${inventoryContext}
        2. Community Symptom Reports: ${reportsContext}

        Task:
        - Detect potential outbreak risks based on symptom clusters.
        - Compare inventory levels against potential demand.
        - Identify if any specific medicine is at risk of shortage due to the symptoms reported.
        - Recommend immediate logistics actions.

        Output strictly in JSON.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
              predictedDemand: { type: Type.INTEGER, description: "Estimated units needed for the targeted medicine" },
              recommendation: { type: Type.STRING, description: "Actionable advice for the warehouse manager" },
              reasoning: { type: Type.STRING, description: "Explanation citing specific symptoms and stock levels" },
              affectedRegion: { type: Type.STRING, description: "The region most at risk" },
              targetedMedicine: { type: Type.STRING, description: "The specific medicine that needs attention" }
            },
            required: ["riskLevel", "predictedDemand", "recommendation", "reasoning", "affectedRegion", "targetedMedicine"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      return result as AIAnalysisResult;

    } catch (error) {
      console.warn("AI Agent falling back to local heuristic rules (Gemini API unavailable or error).");
      // Fallback: Deterministic Logic (The "Mock" Python Model)
      
      const criticalItems = medicines.filter(m => m.stock < m.criticalThreshold);
      const northFeverReports = reports.filter(r => r.location === 'North Sector' && r.symptoms.includes('Fever')).length;

      let result: AIAnalysisResult = {
        riskLevel: 'LOW',
        predictedDemand: 100,
        recommendation: 'Monitor situation. Stock levels are adequate for current seasonal trends.',
        reasoning: 'Community reports are baseline. No anomalous symptom clusters detected.',
        affectedRegion: 'Global',
        targetedMedicine: 'General'
      };

      if (criticalItems.find(m => m.name === 'Tamiflu') && northFeverReports > 1) {
        result = {
          riskLevel: 'HIGH',
          predictedDemand: 1200,
          recommendation: 'IMMEDIATE ACTION: Dispatch 1000 units of Tamiflu to North Sector. Request urgent resupply.',
          reasoning: 'Detected spike in influenza-like symptoms in North Sector. Correlated with critical shortage of Antivirals.',
          affectedRegion: 'North Sector',
          targetedMedicine: 'Tamiflu'
        };
      } else if (criticalItems.length > 0) {
        const item = criticalItems[0];
        result = {
          riskLevel: 'MEDIUM',
          predictedDemand: item.stock * 1.5,
          recommendation: `Schedule resupply for ${item.name}.`,
          reasoning: `${item.name} stock is below safety threshold of ${item.criticalThreshold}.`,
          affectedRegion: 'Central Warehouse',
          targetedMedicine: item.name
        };
      }

      // Simulate latency for realism
      await new Promise(resolve => setTimeout(resolve, 1000));
      return result;
    }
  },

  getRegionalRisk: async (): Promise<RegionStats[]> => {
    // Dynamic based on reports
    const counts: Record<string, number> = {};
    reports.forEach(r => {
      counts[r.location] = (counts[r.location] || 0) + 1;
    });

    const regions = ['North Sector', 'South Sector', 'East Sector', 'West Sector'];
    
    return regions.map(name => {
      const count = counts[name] || 0;
      let risk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      if (count > 5) risk = 'HIGH';
      else if (count > 2) risk = 'MEDIUM';
      
      return {
        id: name.toLowerCase().replace(' ', '-'),
        name,
        risk,
        activeCases: count * 15 // Estimated multiplier
      };
    });
  }
};