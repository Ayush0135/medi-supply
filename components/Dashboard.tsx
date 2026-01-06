import React, { useEffect, useState, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, ShieldCheck, MapPin, BrainCircuit, RefreshCw } from 'lucide-react';
import { AIService } from '../services/mockBackend';
import { AIAnalysisResult, RegionStats } from '../types';

const Dashboard: React.FC = () => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [regions, setRegions] = useState<RegionStats[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Simulation of terminal logs
  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `> ${new Date().toLocaleTimeString()} - ${msg}`]);
  };

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

  useEffect(() => {
    runAnalysis();
  }, []);

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
        <button 
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm disabled:opacity-70"
        >
          {isAnalyzing ? <RefreshCw className="animate-spin mr-2" size={18}/> : <BrainCircuit className="mr-2" size={18}/>}
          {isAnalyzing ? 'Processing...' : 'Run AI Agent'}
        </button>
      </div>

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
                        <MapPin size={16} className="text-slate-400 mr-2"/>
                        <span className="text-sm font-semibold">{analysis.affectedRegion}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <PackageIcon size={16} className="text-slate-400 mr-2"/>
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
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
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

export default Dashboard;