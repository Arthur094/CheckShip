import { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import LoginScreen from './components/screens/LoginScreen';
import DashboardScreen from './components/screens/DashboardScreen';
import VehicleSelectScreen from './components/screens/VehicleSelectScreen';
import TemplateSelectScreen from './components/screens/TemplateSelectScreen';
import InspectionScreen from './components/screens/InspectionScreen';
import CompletedScreen from './components/screens/CompletedScreen';
import ProfileScreen from './components/screens/ProfileScreen';

const AuthContext = createContext<{
  session: any | null;
  loading: boolean;
  logout: () => void;
}>({
  session: null,
  loading: true,
  logout: () => { },
});

const AppRoutes = () => {
  const { session, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<LoginScreen />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardScreen />} />
      <Route path="/vehicles" element={<VehicleSelectScreen />} />
      <Route path="/template/:vehicleId" element={<TemplateSelectScreen />} />
      <Route path="/inspection/:vehicleId/:templateId" element={<InspectionScreen />} />
      <Route path="/completed" element={<CompletedScreen />} />
      <Route path="/profile" element={<ProfileScreen />} />
    </Routes>
  );
};

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, loading, logout }}>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);