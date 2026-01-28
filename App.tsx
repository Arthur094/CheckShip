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
import OperationTypeList from './src/features/operations/OperationTypeList';
import OperationTypeConfig from './src/features/operations/OperationTypeConfig';
import Announcements from './src/features/settings/Announcements';
import LoginPage from './components/LoginPage';
import { HelpCircle, Bell, Search as SearchIcon } from 'lucide-react';

import StartInspectionModal from './src/features/inspections/StartInspectionModal';
import InspectionForm from './src/features/inspections/InspectionForm';
import InspectionDetails from './src/features/inspections/InspectionDetails';
import AnnouncementBanner from './src/components/common/AnnouncementBanner';
import WorkflowList from './src/features/workflows/WorkflowList';
import WorkflowConfig from './src/features/workflows/WorkflowConfig';
import ReleaseFlowList from './src/features/workflows/ReleaseFlowList';
import ReleaseFlowDetail from './src/features/workflows/ReleaseFlowDetail';
import Branches from './src/features/branches/Branches';
import Trailers from './src/features/trailers/Trailers';
import DocManagementDashboard from './src/features/documents/DocManagementDashboard';





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
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [selectedOperationType, setSelectedOperationType] = useState<any>(null);

  // Inspection State
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  // const [showReleaseFlowModal, setShowReleaseFlowModal] = useState(false);
  const [activeInspection, setActiveInspection] = useState<{ checklistId: string, vehicleId: string, itemExecutionId?: string } | null>(null);
  const [activeReleaseFlowId, setActiveReleaseFlowId] = useState<string | null>(null);

  const renderContent = () => {
    // If there is an active inspection, render the form FULL SCREEN (overriding tab content)
    if (activeInspection) {
      return (
        <InspectionForm
          checklistId={activeInspection.checklistId}
          vehicleId={activeInspection.vehicleId}
          onClose={async () => {
            // If part of execution, mark item as done
            if (activeInspection.itemExecutionId) {
              await supabase
                .from('workflow_execution_items')
                .update({ status: 'completed' })
                .eq('id', activeInspection.itemExecutionId);
            }
            setActiveInspection(null);
          }}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'history':
        return <ChecklistHistory />;
      case 'docs-management':
        return <DocManagementDashboard />;
      case 'config-vehicles':
        return <FleetManagement />;
      case 'config-users':
        return <UserManagement />;
      case 'config-otypes':
        return (
          <OperationTypeList
            onNew={() => {
              setSelectedOperationType(null);
              setActiveTab('config-otypes-edit');
            }}
            onEdit={(type) => {
              setSelectedOperationType(type);
              setActiveTab('config-otypes-edit');
            }}
          />
        );
      case 'config-otypes-edit':
        return (
          <OperationTypeConfig
            initialData={selectedOperationType}
            onBack={() => setActiveTab('config-otypes')}
            onSave={() => {
              // Optionally refresh list or just go back
              setActiveTab('config-otypes');
            }}
          />
        );
      case 'config-profiles':
        return <AccessProfiles />;
      case 'config-announcements':
        return <Announcements />;
      case 'config-branches':
        return <Branches />;
      case 'config-trailers':
        return <Trailers />;
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
      case 'config-workflows':
        return (
          <WorkflowList
            onNew={() => {
              setSelectedWorkflow(null);
              setActiveTab('config-workflow-editor');
            }}
            onEdit={(workflow) => {
              setSelectedWorkflow(workflow);
              setActiveTab('config-workflow-editor');
            }}
          />
        );
      case 'config-workflow-editor':
        return (
          <WorkflowConfig
            initialWorkflow={selectedWorkflow}
            onBack={() => setActiveTab('config-workflows')}
          />
        );
      case 'release-flows':
        return (
          <ReleaseFlowList
            onNew={() => setShowInspectionModal(true)}
          />
        );
      case 'release-flow-detail':
        return activeReleaseFlowId ? (
          <ReleaseFlowDetail
            executionId={activeReleaseFlowId}
            onBack={() => {
              setActiveReleaseFlowId(null);
              setActiveTab('release-flows');
            }}
            onStartInspection={(templateId, vehicleId, itemId) => {
              setActiveInspection({ checklistId: templateId, vehicleId: vehicleId, itemExecutionId: itemId });
            }}
          />
        ) : null;
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
          onStartWorkflow={(executionId) => {
            setShowInspectionModal(false);
            setActiveReleaseFlowId(executionId);
            setActiveTab('release-flow-detail');
          }}
        />
      )}

      {/* Release Flow Modal (Deprecated) */}
      {/* {showReleaseFlowModal && ( ... )} */}


      {/* Release Flow Modal Removed */}


      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onStartInspection={() => setShowInspectionModal(true)}
      // We'll update Sidebar to support distinct actions if needed
      />

      {/* Main Content Wrapper */}
      {/* Main Content Wrapper */}
      <main className="flex-1 ml-72 flex flex-col min-w-0 relative">
        <AnnouncementBanner platform="web" />
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
import ChangePasswordScreen from './src/features/auth/ChangePasswordScreen';
import { supabase } from './src/lib/supabase';

const ForcePasswordChangeGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // We can cache this or invoke a lightweight query
        const { data } = await supabase
          .from('profiles')
          .select('force_password_change')
          .eq('id', user.id)
          .single();

        if (data?.force_password_change) {
          setShouldRedirect(true);
        }
      }
      setChecking(false);
    };
    checkProfile();
  }, []);

  if (checking) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full"></div></div>;

  if (shouldRedirect) {
    return <Navigate to="/change-password" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/change-password" element={<ChangePasswordScreen />} />

          <Route path="/dashboard" element={
            <ForcePasswordChangeGuard>
              <MainLayout />
            </ForcePasswordChangeGuard>
          } />

          <Route path="/ckrealizados" element={
            <ForcePasswordChangeGuard>
              <MainLayout initialTab="history" />
            </ForcePasswordChangeGuard>
          } />

          <Route path="/announcements" element={
            <ForcePasswordChangeGuard>
              <MainLayout initialTab="config-announcements" />
            </ForcePasswordChangeGuard>
          } />

          <Route path="/release-flows/:id" element={
            <ForcePasswordChangeGuard>
              <MainLayout initialTab="release-flows" />
              {/* Note: Logic to auto-open the detail needed, or just handle inside MainLayout via URL params? 
                  For simplicity let's stick to state routing inside MainLayout for now, 
                  or update MainLayout to read URL params.
              */}
            </ForcePasswordChangeGuard>
          } />

          <Route path="/inspections/:id" element={
            <ForcePasswordChangeGuard>
              <InspectionDetails />
            </ForcePasswordChangeGuard>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
