import React, { useEffect, useState } from 'react';
import { InventoryService } from '../services/mockBackend';
import { Medicine, UserRole } from '../types';
import { Search, Filter, AlertCircle, CheckCircle, Calendar, ArrowDown, ArrowUp, Lock, Plus, X } from 'lucide-react';

interface WarehouseProps {
  userRole?: UserRole;
}

const Warehouse: React.FC<WarehouseProps> = ({ userRole }) => {
  const [inventory, setInventory] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'General',
    stock: 0,
    expiry: '',
    criticalThreshold: 100
  });

  // Read only applies to *editing existing stock*, but we allow adding new items
  const isReadOnly = userRole === UserRole.SUPPLIER || userRole === UserRole.COMMUNITY;

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    const data = await InventoryService.getAll();
    setInventory(data);
    setLoading(false);
  };

  const updateStock = async (id: string, current: number, change: number) => {
    if (isReadOnly) return;
    const newValue = Math.max(0, current + change);
    setInventory(prev => prev.map(m => m.id === id ? { ...m, stock: newValue } : m));
    await InventoryService.updateStock(id, newValue);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.expiry) return;

    await InventoryService.addMedicine({
      ...newItem,
      stock: Number(newItem.stock),
      criticalThreshold: Number(newItem.criticalThreshold)
    });
    
    setShowAddModal(false);
    setNewItem({ name: '', category: 'General', stock: 0, expiry: '', criticalThreshold: 100 });
    loadInventory();
  };

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock < threshold) return { label: 'Critical', color: 'bg-red-100 text-red-700 border-red-200', barColor: 'bg-red-500' };
    if (stock < threshold * 1.5) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', barColor: 'bg-yellow-500' };
    return { label: 'Healthy', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', barColor: 'bg-emerald-500' };
  };

  const getExpiryStatus = (dateStr: string) => {
    const days = Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 30) return { label: 'Expiring Soon', className: 'text-red-600 font-bold bg-red-50 px-2 py-1 rounded' };
    if (days < 180) return { label: '< 6 Months', className: 'text-orange-600 font-medium' };
    return { label: 'Valid', className: 'text-slate-500' };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <div className="flex items-center gap-2">
             <h2 className="text-2xl font-bold text-slate-800">Inventory Management</h2>
             {isReadOnly && (
                <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full border border-slate-200 flex items-center">
                  <Lock size={12} className="mr-1" /> Stock Locked
                </span>
             )}
           </div>
           <p className="text-slate-500">
             {isReadOnly 
               ? "View central stock. Add new medicines to the registry." 
               : "Monitor stock levels, manage expiries, and process reorders."}
           </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
           <div className="relative flex-1 sm:flex-none">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Search..." 
               className="w-full sm:w-48 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
             />
           </div>
           
           {/* Add Item Button - Available for Admin, Warehouse, AND Supplier */}
           {userRole !== UserRole.COMMUNITY && (
             <button 
               onClick={() => setShowAddModal(true)}
               className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
             >
               <Plus size={18} className="mr-2" />
               Add Item
             </button>
           )}

           <button className="flex items-center px-4 py-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium shadow-sm transition-colors">
             <Filter size={18} className="mr-2" />
             Filters
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                <th className="px-6 py-4">Medicine Details</th>
                <th className="px-6 py-4 w-1/3">Stock Level & Availability</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Expiry Status</th>
                {!isReadOnly && <th className="px-6 py-4 text-right">Quick Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={isReadOnly ? 4 : 5} className="px-6 py-12 text-center text-slate-400">Loading inventory data...</td></tr>
              ) : inventory.map((item) => {
                const status = getStockStatus(item.stock, item.criticalThreshold);
                const expiry = getExpiryStatus(item.expiry);
                const maxStock = item.criticalThreshold * 2.5; 
                const percentage = Math.min(100, (item.stock / maxStock) * 100);

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 mr-3">
                           <span className="font-bold text-xs">{item.name.substring(0, 2).toUpperCase()}</span>
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{item.name}</div>
                          <div className="text-xs text-slate-400 font-mono">ID: {item.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full max-w-xs">
                        <div className="flex justify-between items-end mb-1">
                          <span className="font-bold text-slate-700">{item.stock.toLocaleString()}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${status.barColor}`} 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="mt-1 flex justify-between text-xs text-slate-400">
                          <span>0</span>
                          <span>Threshold: {item.criticalThreshold}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-md">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm">
                        <Calendar size={14} className="mr-2 text-slate-400" />
                        <div>
                          <div className="text-slate-700">{item.expiry}</div>
                          <div className={`text-xs mt-0.5 ${expiry.className}`}>{expiry.label}</div>
                        </div>
                      </div>
                    </td>
                    {!isReadOnly && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => updateStock(item.id, item.stock, -100)}
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors border border-transparent hover:border-red-100"
                            title="Dispatch 100 Units"
                          >
                            <ArrowDown size={18} />
                          </button>
                          <button 
                            onClick={() => updateStock(item.id, item.stock, 100)}
                            className="p-2 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors border border-transparent hover:border-emerald-100"
                            title="Restock 100 Units"
                          >
                            <ArrowUp size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Add New Medicine</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Medicine Name</label>
                <input 
                  type="text" 
                  required
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Doxycycline"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  value={newItem.category}
                  onChange={e => setNewItem({...newItem, category: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="General">General</option>
                  <option value="Antibiotic">Antibiotic</option>
                  <option value="Antiviral">Antiviral</option>
                  <option value="Analgesic">Analgesic</option>
                  <option value="Vaccine">Vaccine</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={newItem.stock}
                    onChange={e => setNewItem({...newItem, stock: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Critical Threshold</label>
                   <input 
                    type="number" 
                    required
                    min="1"
                    value={newItem.criticalThreshold}
                    onChange={e => setNewItem({...newItem, criticalThreshold: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                <input 
                  type="date" 
                  required
                  value={newItem.expiry}
                  onChange={e => setNewItem({...newItem, expiry: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-all">
                  Add to Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Warehouse;