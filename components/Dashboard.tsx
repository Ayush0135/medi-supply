import React, { useEffect, useState, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, ShieldCheck, MapPin, BrainCircuit, RefreshCw } from 'lucide-react';
import { AIService } from '../services/mockBackend';
import { AIAnalysisResult, RegionStats } from '../types';

// Helper icon
const PackageIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
)

const Dashboard: React.FC = () => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [regions, setRegions] = useState<RegionStats[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [localInsights, setLocalInsights] = useState<any>(null);
  const [locationStatus, setLocationStatus] = useState("Waiting for location...");
  const [locationError, setLocationError] = useState<string | null>(null);

  // Simulation of terminal logs
  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `> ${new Date().toLocaleTimeString()} - ${msg}`]);
  };

  const getAddressFromCoords = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
      const data = await res.json();
      // Fallback logic for city names
      const city = data.city || data.locality || data.principalSubdivision || "Unknown Location";
      const state = data.principalSubdivision || data.countryName || "";
      return { city, state };
    } catch (e) {
      console.error("Reverse geocoding failed", e);
      return { city: "Unknown", state: "" };
    }
  };

  const fetchLocalInsights = async (lat: number, lon: number) => {
    try {
      setLocationStatus("Analyzing local environment...");
      const { city, state } = await getAddressFromCoords(lat, lon);

      if (city && city !== "Unknown") {
        const res = await fetch(`http://localhost:8000/api/insights?lat=${lat}&lon=${lon}&city=${city}&state=${state}`);
        if (!res.ok) throw new Error("Backend API failed");
        const data = await res.json();
        setLocalInsights(data);
        setLocationStatus("Live Data Active");
        addLog(`Environment analysis for ${city} complete.`);
      } else {
        setLocationStatus("Could not determine city name.");
      }
    } catch (e) {
      console.error("Insights fetch failed", e);
      setLocationStatus("Data Unavailable");
      setLocationError("Failed to fetch local insights.");
    }
  };

  // Fallback to IP-based location if GPS is denied or unavailable
  const fetchIpLocation = async () => {
    try {
      setLocationStatus("Estimating location via IP...");
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data.latitude && data.longitude) {
        fetchLocalInsights(data.latitude, data.longitude);
      } else {
        throw new Error("IP Geolocation return invalid data");
      }
    } catch (e) {
      console.error("IP Location failed", e);
      setLocationError("Automatic location failed. Please click 'Retry Location'.");
      setLocationStatus("Location Unknown");
    }
  };

  const locateUser = () => {
    setLocationError(null);
    setLocationStatus("Detecting location...");

    if (!navigator.geolocation) {
      fetchIpLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchLocalInsights(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.warn("GPS failed, falling back to IP", err);
        // If GPS is denied or fails, try IP location automatically
        fetchIpLocation();
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    runAnalysis();
    // Try to auto-locate on mount, but don't show error if it's just a prompt waiting
    locateUser();
  }, []);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setLogs([]);
    addLog("Initializing AI Agent...");

    setTimeout(() => addLog("Fetching real-time inventory data..."), 500);
    setTimeout(() => addLog("Aggregating community symptom reports..."), 900);
    setTimeout(() => addLog("Running LLaMA-3 reasoning model..."), 1300);

    const result = await AIService.runAnalysis();
    const regionData = await AIService.getRegionalRisk();

    setAnalysis(result);
    setRegions(regionData);
    setIsAnalyzing(false);
    addLog("Analysis complete. Insights generated.");
  };

  const chartData = [
    { name: 'Mon', demand: 240, supply: 400 },
    { name: 'Tue', demand: 300, supply: 380 },
    { name: 'Wed', demand: 280, supply: 360 },
    { name: 'Thu', demand: 450, supply: 340 },
    { name: 'Fri', demand: analysis ? analysis.predictedDemand : 470, supply: 300 },
    { name: 'Sat', demand: analysis ? analysis.predictedDemand * 1.1 : 500, supply: 250 },
    { name: 'Sun', demand: analysis ? analysis.predictedDemand * 0.9 : 300, supply: 250 },
  ];

  const RiskBadge = ({ level }: { level: string }) => {
    const colors = {
      'LOW': 'bg-green-100 text-green-800 border-green-200',
      'MEDIUM': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'HIGH': 'bg-red-100 text-red-800 border-red-200 animate-pulse'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors[level as keyof typeof colors]}`}>
        {level} RISK
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Control Tower</h2>
          <p className="text-slate-500">Real-time supply chain intelligence</p>
        </div>
        <div className="flex gap-4">
          {/* Location Status Indicator */}
          <div className={`hidden md:flex items-center px-4 py-2 border text-sm shadow-sm rounded-lg ${locationError ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-600'}`}>
            <MapPin size={16} className={`mr-2 ${localInsights ? 'text-green-500' : locationError ? 'text-red-500' : 'text-slate-400'}`} />
            <span className="font-medium mr-3">
              {locationError ? locationError : (localInsights ? `${localInsights.location.city}, ${localInsights.location.state}` : locationStatus)}
            </span>
            {(!localInsights || locationError) && (
              <button onClick={locateUser} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline">
                Retry Location
              </button>
            )}
          </div>

          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm disabled:opacity-70"
          >
            {isAnalyzing ? <RefreshCw className="animate-spin mr-2" size={18} /> : <BrainCircuit className="mr-2" size={18} />}
            {isAnalyzing ? 'Processing...' : 'Run AI Agent'}
          </button>
        </div>
      </div>

      {/* NEW SECTION: Local Environmental Intelligence */}
      {localInsights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-blue-100 text-sm font-medium mb-1">Local Environment</p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-bold">{localInsights.environment.temperature}</span>
                <span className="text-lg opacity-90 mb-1">{localInsights.environment.condition}</span>
              </div>
              <div className="flex gap-4 text-sm opacity-90">
                <span>Humidity: {localInsights.environment.humidity}</span>
                <span>Wind: {localInsights.environment.wind_speed}</span>
              </div>
            </div>
            {/* Decorative Icon */}
            <div className="absolute right-[-20px] top-[-20px] opacity-20">
              <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z" /></svg>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-700">Prevalent Diseases</h3>
              <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded">AI DETECTED</span>
            </div>
            <div className="space-y-2">
              {localInsights.health_intelligence.prevalent_diseases.map((d: string, i: number) => (
                <div key={i} className="flex items-center text-sm text-slate-600">
                  <div className="w-2 h-2 rounded-full bg-red-400 mr-2"></div>
                  {d}
                </div>
              ))}
              <p className="text-xs text-slate-400 mt-2 italic border-t border-slate-100 pt-2">
                "{localInsights.health_intelligence.health_alert}"
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-700">High Demand Meds</h3>
              <TrendingUp size={16} className="text-green-500" />
            </div>
            <div className="flex flex-wrap gap-2">
              {localInsights.health_intelligence.high_demand_medicines.map((m: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full border border-indigo-100">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* AI Insight Card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 flex items-center">
              <BrainCircuit size={18} className="text-indigo-600 mr-2" />
              AI Agent Insights
            </h3>
            {analysis && <RiskBadge level={analysis.riskLevel} />}
          </div>

          <div className="p-6">
            {analysis ? (
              <div className="space-y-4">
                <div className="flex items-start p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Recommendation</p>
                    <p className="text-indigo-900 font-medium">{analysis.recommendation}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-slate-200 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Primary Reasoning</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{analysis.reasoning}</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Targeted Logistics</p>
                    <div className="flex items-center mt-2">
                      <MapPin size={16} className="text-slate-400 mr-2" />
                      <span className="text-sm font-semibold">{analysis.affectedRegion}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <PackageIcon size={16} className="text-slate-400 mr-2" />
                      <span className="text-sm font-semibold">{analysis.targetedMedicine}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400">
                Initializing models...
              </div>
            )}
          </div>
        </div>

        {/* Live Terminal */}
        <div className="bg-slate-900 rounded-xl shadow-sm overflow-hidden flex flex-col h-[320px] lg:h-auto">
          <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex items-center">
            <div className="flex space-x-1.5 mr-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs font-mono text-slate-400">agent_runtime.log</span>
          </div>
          <div className="flex-1 p-4 font-mono text-xs text-green-400 overflow-y-auto space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="opacity-90">{log}</div>
            ))}
            {isAnalyzing && <div className="animate-pulse">_</div>}
          </div>
        </div>
      </div>

      {/* Charts & Maps Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Demand Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-6 flex items-center">
            <TrendingUp size={18} className="mr-2 text-blue-600" />
            Demand vs Supply Forecast
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="demand" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDemand)" name="Projected Demand" />
                <Area type="monotone" dataKey="supply" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSupply)" name="Available Supply" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heatmap Grid (Simulated Map) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
            <AlertTriangle size={18} className="mr-2 text-orange-500" />
            Regional Outbreak Risk
          </h3>
          <div className="grid grid-cols-2 gap-4 h-64">
            {regions.map((region) => (
              <div
                key={region.id}
                className={`
                  relative rounded-lg p-4 flex flex-col justify-between transition-all
                  ${region.risk === 'HIGH' ? 'bg-red-50 border-2 border-red-200' :
                    region.risk === 'MEDIUM' ? 'bg-yellow-50 border-2 border-yellow-200' :
                      'bg-green-50 border border-green-100'}
                `}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-700">{region.name}</span>
                  <RiskBadge level={region.risk} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{region.activeCases}</p>
                  <p className="text-xs text-slate-500 uppercase font-medium">Active Symptoms</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};



export default Dashboard;