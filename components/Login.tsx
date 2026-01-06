import React from 'react';
import { UserRole } from '../types';
import { Activity, Shield, Package, Users, Truck } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const roles = [
    { 
      role: UserRole.ADMIN, 
      label: 'Admin Authority', 
      icon: Shield, 
      desc: 'View AI insights, map global risks, manage all sectors.',
      color: 'bg-indigo-600'
    },
    { 
      role: UserRole.WAREHOUSE, 
      label: 'Warehouse Manager', 
      icon: Package, 
      desc: 'Update stock levels, check expiry, manage logistics.',
      color: 'bg-emerald-600'
    },
    { 
      role: UserRole.SUPPLIER, 
      label: 'Supplier', 
      icon: Truck, 
      desc: 'Declare capacity, view demand signals, manage shipments.',
      color: 'bg-orange-600'
    },
    { 
      role: UserRole.COMMUNITY, 
      label: 'Community User', 
      icon: Users, 
      desc: 'Report symptoms, view local health alerts.',
      color: 'bg-blue-600'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <div className="bg-blue-600 p-4 rounded-2xl inline-flex mb-4 shadow-lg shadow-blue-200">
           <Activity size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">MedSupply AI</h1>
        <p className="text-slate-500 max-w-md mx-auto">Select a persona to explore the AI-driven supply chain platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full">
        {roles.map((r) => (
          <button
            key={r.role}
            onClick={() => onLogin(r.role)}
            className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-slate-200 text-left flex flex-col h-full hover:-translate-y-1"
          >
             <div className={`${r.color} w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-white shadow-md`}>
               <r.icon size={24} />
             </div>
             <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
               {r.label}
             </h3>
             <p className="text-slate-500 text-sm leading-relaxed mb-4">
               {r.desc}
             </p>
             <div className="mt-auto flex items-center text-sm font-semibold text-slate-400 group-hover:text-blue-600">
               Enter Portal &rarr;
             </div>
          </button>
        ))}
      </div>
      
      <p className="mt-12 text-slate-400 text-xs text-center">
        Demo Application &bull; Gemini 2.5 Agent &bull; React + Tailwind
      </p>
    </div>
  );
};

export default Login;