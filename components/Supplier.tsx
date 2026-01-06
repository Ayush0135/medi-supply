import React, { useEffect, useState } from 'react';
import { Truck, Package, Save, Check, TrendingUp, AlertTriangle, ShieldCheck, Plus, X } from 'lucide-react';
import { InventoryService, SupplierService } from '../services/mockBackend';
import { Medicine, Supplier } from '../types';

const SupplierPanel: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [supplierData, setSupplierData] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'General',
    expiry: '',
    criticalThreshold: 100
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [meds, suppliers] = await Promise.all([
      InventoryService.getAll(),
      SupplierService.getSuppliers()
    ]);
    setMedicines(meds);
    setSupplierData(suppliers[0]); 
    setLoading(false);
  };

  const handleUpdateCapacity = async (medicineId: string, newCapacity: number) => {
    if (!supplierData) return;
    setSaving(medicineId);
    await SupplierService.updateCapacity(supplierData.id, medicineId, newCapacity);
    
    setSupplierData({
      ...supplierData,
      capacity: {
        ...supplierData.capacity,
        [medicineId]: newCapacity
      }
    });
    
    setTimeout(() => setSaving(null), 500);
  };

  const handleRegisterProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name) return;

    // Add to global registry so we can supply it
    await InventoryService.addMedicine({
      ...newItem,
      stock: 0, // Suppliers introduce product, but initial warehouse stock is 0
      criticalThreshold: Number(newItem.criticalThreshold)
    });

    setShowAddModal(false);
    setNewItem({ name: '', category: 'General', expiry: '', criticalThreshold: 100 });
    loadData(); // Refresh list to show new item
  };

  const getDemandSignal = (stock: number, threshold: number) => {
    if (stock < threshold) return { label: 'CRITICAL DEMAND', color: 'text-red-700 bg-red-100 border-red-200', icon: AlertTriangle };
    if (stock < threshold * 1.5) return { label: 'HIGH DEMAND', color: 'text-orange-700 bg-orange-100 border-orange-200', icon: TrendingUp };
    return { label: 'Stable', color: 'text-slate-600 bg-slate-100 border-slate-200', icon: ShieldCheck };
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading supplier portal...</div>;
  if (!supplierData) return <div className="p-8 text-center text-red-500">Supplier profile not found.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Truck className="mr-3 text-orange-400" size={28} />
            Supplier Portal
          </h2>
          <p className="text-slate-400 mt-1">
            Logged in as: <span className="font-semibold text-white">{supplierData.name}</span> ({supplierData.location})
          </p>
        </div>
        <div className="flex items-center space-x-8 bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{Object.keys(supplierData.capacity).length}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Active Contracts</div>
          </div>
          <div className="h-8 w-px bg-slate-700"></div>
          <div className="text-right">
             <div className="text-2xl font-bold text-green-400">98%</div>
             <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Fulfillment Rate</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div>
             <h3 className="font-bold text-slate-800">Market Opportunities</h3>
             <p className="text-sm text-slate-500">Review warehouse demand signals and update your supply commitment.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
               onClick={() => setShowAddModal(true)}
               className="flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
             >
               <Plus size={16} className="mr-2" />
               Register New Product
             </button>
            <div className="flex items-center text-xs font-medium text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
               <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
               Live Feed
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                <th className="px-6 py-4">Medicine Name</th>
                <th className="px-6 py-4">Market Signal (Warehouse Demand)</th>
                <th className="px-6 py-4">Your Committed Capacity</th>
                <th className="px-6 py-4 text-right">Update Contract</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medicines.map((item) => {
                const capacity = supplierData.capacity[item.id] || 0;
                const demand = getDemandSignal(item.stock, item.criticalThreshold);
                const DemandIcon = demand.icon;
                
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-lg">{item.name}</div>
                      <div className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wide">
                        {item.category}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-lg border ${demand.color} transition-all`}>
                        <DemandIcon size={16} className="mr-2" />
                        <span className="text-xs font-bold uppercase tracking-wide">{demand.label}</span>
                      </div>
                      {item.stock < item.criticalThreshold && (
                        <div className="mt-1.5 text-xs text-red-600 font-medium pl-1">
                          Current stock below {item.criticalThreshold} units
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${capacity > 0 ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                           <Package size={20} />
                        </div>
                        <div>
                           <div className="text-sm font-semibold text-slate-700">
                             {capacity > 0 ? `${capacity.toLocaleString()} units` : 'Not Supplying'}
                           </div>
                           <div className="text-xs text-slate-400">Daily Max Capacity</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end">
                        <div className="relative">
                          <input 
                            type="number" 
                            defaultValue={capacity}
                            onBlur={(e) => handleUpdateCapacity(item.id, parseInt(e.target.value))}
                            className="w-32 pl-4 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                            qty
                          </div>
                        </div>
                        <div className="w-8 ml-2 flex items-center justify-center">
                           {saving === item.id && (
                             <Check className="text-green-500 animate-bounce" size={20} />
                           )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Register New Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRegisterProduct} className="p-6 space-y-4">
              <div className="bg-orange-50 p-3 rounded-lg text-xs text-orange-800 mb-4">
                 Registering a new product adds it to the global logistics system. You can then set your supply capacity for it.
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                <input 
                  type="text" 
                  required
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="e.g. New Vaccine X"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  value={newItem.category}
                  onChange={e => setNewItem({...newItem, category: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="General">General</option>
                  <option value="Antibiotic">Antibiotic</option>
                  <option value="Antiviral">Antiviral</option>
                  <option value="Analgesic">Analgesic</option>
                  <option value="Vaccine">Vaccine</option>
                </select>
              </div>
              <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Critical Threshold</label>
                   <input 
                    type="number" 
                    required
                    min="1"
                    value={newItem.criticalThreshold}
                    onChange={e => setNewItem({...newItem, criticalThreshold: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Global demand trigger point (units)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Batch Expiry Date</label>
                <input 
                  type="date" 
                  required
                  value={newItem.expiry}
                  onChange={e => setNewItem({...newItem, expiry: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg shadow-md transition-all">
                  Add & Set Capacity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierPanel;