import { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { cacheService } from './services/cacheService';
import LoginScreen from './components/screens/LoginScreen';
import DashboardScreen from './components/screens/DashboardScreen';
import VehicleSelectScreen from './components/screens/VehicleSelectScreen';
import TemplateSelectScreen from './components/screens/TemplateSelectScreen';
import InspectionScreen from './components/screens/InspectionScreen';
import CompletedScreen from './components/screens/CompletedScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import AnalysisScreen from './components/screens/AnalysisScreen';
import AnnouncementBanner from './components/AnnouncementBanner';

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
    <>
      <AnnouncementBanner platform="mobile" />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/vehicles" element={<VehicleSelectScreen />} />
        <Route path="/template/:vehicleId" element={<TemplateSelectScreen />} />
        <Route path="/inspection/:vehicleId/:templateId" element={<InspectionScreen />} />
        <Route path="/completed" element={<CompletedScreen />} />
        <Route path="/analysis" element={<AnalysisScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
      </Routes>
    </>
  );
};

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (session) {
        // Valid session found
        setSession(session);
      } else if (error || !session) {
        // Session failed - check if we have cached user (offline mode)
        const cachedUserId = cacheService.getUserId();
        const cachedProfile = cacheService.getUserProfile();

        if (cachedUserId && cachedProfile) {
          console.log('📴 Offline: usando sessão em cache');
          // Create mock session for offline use
          setSession({
            user: {
              id: cachedUserId,
              email: cachedProfile.email,
              ...cachedProfile
            },
            offline: true // Flag to indicate this is cached
          });
        } else {
          setSession(null);
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
      } else {
        // Auth state changed to null - check cache before logging out
        const cachedUserId = cacheService.getUserId();
        const cachedProfile = cacheService.getUserProfile();

        if (cachedUserId && cachedProfile && !navigator.onLine) {
          console.log('📴 Token expirou mas está offline - mantendo sessão em cache');
          // Keep cached session when offline
          setSession({
            user: {
              id: cachedUserId,
              email: cachedProfile.email,
              ...cachedProfile
            },
            offline: true
          });
        } else {
          setSession(null);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
    setSession(null);
    localStorage.removeItem('sb-thztbankqpgtgiknzkaw-auth-token'); // Clear Supabase token manually just in case
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