import React from 'react';
import { 
  Activity, 
  Package, 
  Users, 
  LayoutDashboard, 
  LogOut, 
  Menu,
  ShieldAlert,
  Truck
} from 'lucide-react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  currentView: string;
  onChangeView: (view: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole, currentView, onChangeView, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: string, icon: any, label: string }) => (
    <button
      onClick={() => {
        onChangeView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center w-full px-4 py-3 mb-1 rounded-lg transition-colors ${
        currentView === view 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} className="mr-3" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-700 flex items-center">
            <div className="bg-blue-500 p-2 rounded-lg mr-3">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">MedSupply AI</h1>
              <p className="text-xs text-slate-400">Intelligent Logistics</p>
            </div>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="mb-6">
              <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Platform</p>
              
              {(userRole === UserRole.ADMIN || userRole === UserRole.WAREHOUSE) && (
                <NavItem view="dashboard" icon={LayoutDashboard} label="AI Control Tower" />
              )}
              
              {/* Allow Suppliers to view Inventory as well */}
              {(userRole === UserRole.ADMIN || userRole === UserRole.WAREHOUSE || userRole === UserRole.SUPPLIER) && (
                <NavItem view="warehouse" icon={Package} label="Inventory" />
              )}

              {userRole === UserRole.SUPPLIER && (
                <NavItem view="supplier" icon={Truck} label="Supplier Portal" />
              )}

              <NavItem view="community" icon={Users} label="Community Reports" />
            </div>
            
            <div className="mt-auto">
               <div className="bg-slate-800 rounded-xl p-4 mb-4">
                 <div className="flex items-center mb-2 text-blue-400">
                    <ShieldAlert size={16} className="mr-2" />
                    <span className="text-xs font-bold uppercase">System Status</span>
                 </div>
                 <p className="text-xs text-slate-300">AI Agent Active<br/>Gemini 2.5 Connected</p>
               </div>
            </div>
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button 
              onClick={onLogout}
              className="flex items-center w-full px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center">
             <div className="bg-blue-600 p-1.5 rounded mr-2">
              <Activity size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-800">MedSupply AI</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;