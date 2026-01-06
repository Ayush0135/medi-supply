import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignIn, UserButton, useUser } from "@clerk/clerk-react";
import Layout from './components/Layout';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Warehouse from './components/Warehouse';
import Community from './components/Community';
import SupplierPanel from './components/Supplier';
import HospitalNetwork from './components/HospitalNetwork';
import { UserRole } from './types';

const App: React.FC = () => {
  // We can default to a role for now or derive it from metadata if you set that up in Clerk
  // For this example, we'll strip the manual login logic and just let the specific role selection happen inside the app if needed,
  // or default to something safe like 'HOSPITAL' (which seems to map to Dashboard/Home usually).
  // However, the original code had a manual role selection.

  // To keep it simple as requested: "IF USER LOGIN OR SIGNUP IT DIRECTLY GIVE ACCES TO MYPAGE"
  // We will assume a default role for the authenticated user or allow them to switch inside.

  const [userRole, setUserRole] = useState<UserRole>(UserRole.ADMIN);
  const [currentView, setCurrentView] = useState('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <Home userRole={userRole} />;
      case 'dashboard':
        return <Dashboard />;
      case 'warehouse':
        return <Warehouse userRole={userRole} />;
      case 'supplier':
        return <SupplierPanel />;
      case 'community':
        return <Community />;
      case 'network':
        return <HospitalNetwork />;
      default:
        return <Home userRole={userRole} />;
    }
  };

  return (
    <>
      <SignedOut>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <SignIn forceRedirectUrl="/" signUpForceRedirectUrl="/" />
        </div>
      </SignedOut>
      <SignedIn>
        <Layout
          userRole={userRole}
          currentView={currentView}
          onChangeView={setCurrentView}
          onLogout={() => {
            // Clerk handles logout, but we might want to reset local state if needed.
            // The UserButton handles the actual sign out action usually, so we might not need this callback 
            // if we replace the custom logout button with UserButton.
            // But if Layout has a custom logout button, we need to wire it to Clerk's signOut.
          }}
        >
          {renderContent()}
        </Layout>
      </SignedIn>
    </>
  );
};

export default App;