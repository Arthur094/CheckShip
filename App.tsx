import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChecklistHistory from './components/ChecklistHistory';
import FleetManagement from './src/features/fleets/FleetManagement';
import Drivers from './src/features/users/Drivers';
import ChecklistConfig from './src/features/checklists/ChecklistConfig';
import ChecklistList from './src/features/checklists/ChecklistList';
import AccessProfiles from './src/features/access-profiles/AccessProfiles';
import UserManagement from './src/features/users/UserManagement';
import VehicleTypeManagement from './src/features/fleets/VehicleTypeManagement';
import LoginPage from './components/LoginPage';
import { HelpCircle, Bell, Search as SearchIcon } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'history':
        return <ChecklistHistory />;
      case 'config-vehicles':
        return <FleetManagement />;
      case 'config-users':
        return <UserManagement />;
      case 'config-vtypes':
        return <VehicleTypeManagement />;
      case 'config-profiles':
        return <AccessProfiles />;
      case 'config-models':
        return <ChecklistList onNew={() => setActiveTab('config-create')} />;
      case 'config-create':
        return <ChecklistConfig />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-20 animate-pulse">
            <h2 className="text-xl font-bold uppercase tracking-widest mb-2">Módulo em Desenvolvimento</h2>
            <p className="text-sm">A tela "{activeTab}" está sendo implementada para o contexto logístico.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Wrapper */}
      <main className="flex-1 ml-72 flex flex-col min-w-0">
        {/* Top Utility Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="md:flex hidden items-center bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-900 transition-all">
              <SearchIcon size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisa rápida..."
                className="bg-transparent border-none text-sm outline-none px-2 w-48"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-blue-900 hover:bg-slate-50 rounded-full transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2 text-slate-400 hover:text-blue-900 hover:bg-slate-50 rounded-full transition-all">
              <HelpCircle size={20} />
            </button>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800 leading-none">Admin Master</p>
                <p className="text-[10px] text-slate-400 font-medium">CheckShip Corp</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                AM
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>

        {/* Global Action Footer */}
        <footer className="h-12 bg-white border-t border-slate-200 px-8 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
          <div>CheckShip System v2.4.0</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-blue-900 transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-blue-900 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-blue-900 transition-colors">Ajuda</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<MainLayout />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
