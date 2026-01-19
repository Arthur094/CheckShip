import React, { useState, useEffect } from 'react';
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

import StartInspectionModal from './src/features/inspections/StartInspectionModal';
import InspectionForm from './src/features/inspections/InspectionForm';
import InspectionDetails from './src/features/inspections/InspectionDetails';



interface MainLayoutProps {
  initialTab?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ initialTab = 'dashboard' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const location = useLocation();

  useEffect(() => {
    // Check if there is a target tab passed in the navigation state
    if (location.state && (location.state as any).targetTab) {
      setActiveTab((location.state as any).targetTab);
      // Clear the state so it doesn't persist on refresh/back? 
      // Actually navigate replaces history state usually, but let's keep it simple.
    } else {
      setActiveTab(initialTab);
    }
  }, [initialTab, location.state]);

  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Inspection State
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [activeInspection, setActiveInspection] = useState<{ checklistId: string, vehicleId: string } | null>(null);

  const renderContent = () => {
    // If there is an active inspection, render the form FULL SCREEN (overriding tab content)
    if (activeInspection) {
      return (
        <InspectionForm
          checklistId={activeInspection.checklistId}
          vehicleId={activeInspection.vehicleId}
          onClose={() => setActiveInspection(null)}
        />
      );
    }

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
        return (
          <ChecklistList
            onNew={() => {
              setSelectedTemplate(null);
              setActiveTab('config-create');
            }}
            onEdit={(template) => {
              setSelectedTemplate(template);
              setActiveTab('config-create');
            }}
          />
        );
      case 'config-create':
        return (
          <ChecklistConfig
            initialTemplate={selectedTemplate}
            onBack={() => setActiveTab('config-models')}
          />
        );
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
      {/* Inspection Modal */}
      {showInspectionModal && (
        <StartInspectionModal
          onClose={() => setShowInspectionModal(false)}
          onStart={(checklistId, vehicleId) => {
            setShowInspectionModal(false);
            setActiveInspection({ checklistId, vehicleId });
          }}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onStartInspection={() => setShowInspectionModal(true)}
      />

      {/* Main Content Wrapper */}
      <main className="flex-1 ml-72 flex flex-col min-w-0">
        {/* Header removed per user request */}

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

import { useAuth, AuthProvider } from './src/hooks/useAuth';

// ... existing code ...

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<MainLayout />} />
          <Route path="/ckrealizados" element={<MainLayout initialTab="history" />} />
          <Route path="/inspections/:id" element={<InspectionDetails />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
