
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, ChevronUp, Play, LogOut, UserCircle, KeyRound, User } from 'lucide-react';
import { NAV_ITEMS, COLORS } from '../constants';
import { supabase } from '../src/lib/supabase';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onStartInspection: () => void;
}

interface UserData {
  full_name: string;
  role: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onStartInspection }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({ config: true });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', sessionData.session.user.id)
          .single();

        if (profile) {
          setUserData(profile);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const toggleSubMenu = (id: string) => {
    setOpenSubMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      'ADMIN_MASTER': 'Administrador Master',
      'GESTOR': 'Gestor',
      'MOTORISTA': 'Motorista'
    };
    return roleMap[role] || role;
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <aside className="w-72 h-screen flex flex-col bg-slate-100 border-r border-slate-200 fixed left-0 top-0 overflow-y-auto">
      {/* Brand Logo Placeholder */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
          CS
        </div>
        <div>
          <h1 className="font-bold text-slate-800 tracking-tight">CHECKSHIP</h1>
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">Fleet Management</p>
        </div>
      </div>

      {/* User Profile Info */}
      <div className="mx-4 mb-4">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="w-full p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-blue-200 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold text-sm">
                {userData ? getInitials(userData.full_name) : 'U'}
              </div>
              <div className="overflow-hidden text-left">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {userData?.full_name || 'Carregando...'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {userData ? getRoleLabel(userData.role) : '...'}
                </p>
              </div>
            </div>
            {userMenuOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </div>
        </button>

        {/* User Dropdown */}
        {userMenuOpen && (
          <div className="mt-2 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <button
              onClick={() => setActiveTab('meu-perfil')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <User size={16} />
              Meu perfil
            </button>
            <button
              onClick={() => setActiveTab('alterar-senha')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors border-t border-slate-100"
            >
              <KeyRound size={16} />
              Alterar senha
            </button>
          </div>
        )}

        <div className="mt-3 inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase border border-blue-100">
          PLANO ENTERPRISE
        </div>
      </div>

      {/* Main Action Button */}
      <div className="px-4 mb-6">
        <button
          onClick={onStartInspection}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold transition-all shadow-md active:scale-95">
          <Play size={16} fill="white" />
          INICIAR INSPEÇÃO
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-10">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleSubMenu(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors ${activeTab.startsWith(item.id) ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {openSubMenus[item.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  {openSubMenus[item.id] && (
                    <ul className="mt-1 ml-9 space-y-1 border-l-2 border-slate-200">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <button
                            onClick={() => {
                              if (location.pathname !== '/dashboard') {
                                navigate('/dashboard', { state: { targetTab: child.id } });
                              }
                              setActiveTab(child.id);
                            }}
                            className={`w-full text-left p-2 rounded-lg text-xs font-medium transition-colors pl-4 ${activeTab === child.id ? 'text-blue-900 bg-white font-bold' : 'text-slate-500 hover:bg-slate-200'
                              }`}
                          >
                            {child.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (item.id === 'dashboard') {
                      navigate('/dashboard');
                      setActiveTab('dashboard');
                    } else if (item.id === 'history') {
                      navigate('/ckrealizados');
                      setActiveTab('history');
                    } else {
                      if (location.pathname !== '/dashboard') {
                        navigate('/dashboard', { state: { targetTab: item.id } });
                      }
                      setActiveTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-white text-blue-900 shadow-sm border border-slate-200 font-bold' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium w-full"
        >
          <LogOut size={18} />
          Sair do Portal
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
