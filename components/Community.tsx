import React, { useState } from 'react';
import { MapPin, Thermometer, Activity, Send } from 'lucide-react';
import { CommunityService } from '../services/mockBackend';

const Community: React.FC = () => {
  const [location, setLocation] = useState('North Sector');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const symptomOptions = [
    'Fever', 'Cough', 'Fatigue', 'Breathing Difficulty', 
    'Headache', 'Nausea', 'Rash', 'Sore Throat'
  ];

  const toggleSymptom = (symptom: string) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.filter(s => s !== symptom));
    } else {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (symptoms.length === 0) return;
    
    await CommunityService.submitReport({
      location,
      symptoms,
      severity: 5 // Default for demo
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSymptoms([]);
    }, 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Health Check Report</h2>
        <p className="text-slate-500 mt-2">Help the AI track disease spread by reporting your symptoms anonymously.</p>
      </div>

      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="text-green-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-2">Report Received</h3>
          <p className="text-green-700">Thank you. Your data helps allocate medicine where it's needed most.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-blue-600 p-6 text-white">
            <div className="flex items-center space-x-2 opacity-90 mb-1">
              <Activity size={18} />
              <span className="text-sm font-medium uppercase tracking-wide">New Report</span>
            </div>
            <h3 className="text-xl font-bold">What are you feeling today?</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Location Section */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <MapPin size={18} className="mr-2 text-blue-500" />
                Current Location
              </label>
              <select 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
              >
                <option value="North Sector">North Sector</option>
                <option value="South Sector">South Sector</option>
                <option value="East Sector">East Sector</option>
                <option value="West Sector">West Sector</option>
              </select>
            </div>

            {/* Symptoms Grid */}
            <div>
               <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <Thermometer size={18} className="mr-2 text-blue-500" />
                Select Symptoms
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {symptomOptions.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={`
                      py-3 px-4 rounded-lg text-sm font-medium transition-all text-center border
                      ${symptoms.includes(symptom) 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50'}
                    `}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={symptoms.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center"
            >
              Submit Report
              <Send size={18} className="ml-2" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Community;