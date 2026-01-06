import React, { useState } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Warehouse from './components/Warehouse';
import Community from './components/Community';
import SupplierPanel from './components/Supplier';
import { UserRole } from './types';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    // Set default view based on role
    if (role === UserRole.COMMUNITY) {
      setCurrentView('community');
    } else if (role === UserRole.SUPPLIER) {
      setCurrentView('supplier');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentView('dashboard');
  };

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'warehouse':
        return <Warehouse userRole={userRole} />;
      case 'supplier':
        return <SupplierPanel />;
      case 'community':
        return <Community />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout 
      userRole={userRole} 
      currentView={currentView} 
      onChangeView={setCurrentView}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;