import React, { useState } from 'react';
import { Search, Building, MapPin, Pill, Loader, ExternalLink } from 'lucide-react';

const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep", "Delhi", "Puducherry",
    "Ladakh", "Jammu and Kashmir"
];

const HospitalNetwork: React.FC = () => {
    const [selectedState, setSelectedState] = useState('');
    const [loading, setLoading] = useState(false);
    const [hospitals, setHospitals] = useState<any[]>([]);

    const fetchHospitals = async () => {
        if (!selectedState) return;
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/hospitals/${encodeURIComponent(selectedState)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setHospitals(data.hospitals);
        } catch (error) {
            console.error("Failed to fetch hospitals", error);
            alert("Failed to fetch data. Ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">National Hospital Network</h2>
                        <p className="text-slate-500">Real-time inventory tracking across 29 States & UTs</p>
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Select State / UT</option>
                            {STATES.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>

                        <button
                            onClick={fetchHospitals}
                            disabled={loading || !selectedState}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all"
                        >
                            {loading ? <Loader className="animate-spin mr-2" size={20} /> : <Search className="mr-2" size={20} />}
                            Fetch Live Data
                        </button>
                    </div>
                </div>
            </div>

            {hospitals.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {hospitals.map((hospital, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                        <Building size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800 line-clamp-1" title={hospital.name}>{hospital.name}</h3>
                                        <div className="flex items-center text-xs text-slate-500 mt-1">
                                            <MapPin size={12} className="mr-1" />
                                            {hospital.location} • {hospital.type}
                                        </div>
                                    </div>
                                </div>
                                <a href={hospital.source_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500">
                                    <ExternalLink size={16} />
                                </a>
                            </div>

                            <div className="p-4">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                                    <Pill size={14} className="mr-1.5" />
                                    Live Medicine Stock
                                </h4>
                                <div className="space-y-2">
                                    {Object.entries(hospital.medicine_stock).map(([medicine, stock]: [string, any]) => (
                                        <div key={medicine} className="flex justify-between items-center text-sm">
                                            <span className="text-slate-600">{medicine}</span>
                                            <span className={`font-mono font-medium ${parseInt(stock) < 100 ? 'text-red-500' : 'text-green-600'
                                                }`}>
                                                {stock}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 text-right">
                                    Last updated: {hospital.last_updated}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {hospitals.length === 0 && !loading && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                    <Building className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500">Select a state and click fetch to see live hospital data</p>
                </div>
            )}
        </div>
    );
};

export default HospitalNetwork;
