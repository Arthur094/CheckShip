import React, { useState } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import LoginScreen from './components/screens/LoginScreen';
import DashboardScreen from './components/screens/DashboardScreen';
import VehicleSelectScreen from './components/screens/VehicleSelectScreen';
import TemplateSelectScreen from './components/screens/TemplateSelectScreen';
import InspectionScreen from './components/screens/InspectionScreen';
import CompletedScreen from './components/screens/CompletedScreen';
import ProfileScreen from './components/screens/ProfileScreen';

// Simple Auth Context mock
const AuthContext = React.createContext<{
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}>({
  isAuthenticated: false,
  login: () => { },
  logout: () => { },
});

const AppRoutes = () => {
  const { isAuthenticated } = React.useContext(AuthContext);

  if (!isAuthenticated) {
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthContext.Provider>
  );
}

export const useAuth = () => React.useContext(AuthContext);
