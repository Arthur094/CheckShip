
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Play, LogOut, UserCircle } from 'lucide-react';
import { NAV_ITEMS, COLORS } from '../constants';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({ config: true });

  const toggleSubMenu = (id: string) => {
    setOpenSubMenus(prev => ({ ...prev, [id]: !prev[id] }));
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
      <div className="mx-4 mb-4 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
            <UserCircle size={24} />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-800 truncate">Admin - Gestor</p>
            <p className="text-xs text-slate-500 truncate">Gestor de Frota</p>
          </div>
        </div>
        <div className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase border border-blue-100">
          PLANO ENTERPRISE
        </div>
      </div>

      {/* Main Action Button */}
      <div className="px-4 mb-6">
        <button className="w-full flex items-center justify-center gap-2 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold transition-all shadow-md active:scale-95">
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
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab.startsWith(item.id) ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
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
                            onClick={() => setActiveTab(child.id)}
                            className={`w-full text-left p-2 rounded-lg text-xs font-medium transition-colors pl-4 ${
                              activeTab === child.id ? 'text-blue-900 bg-white font-bold' : 'text-slate-500 hover:bg-slate-200'
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
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id ? 'bg-white text-blue-900 shadow-sm border border-slate-200 font-bold' : 'text-slate-600 hover:bg-slate-200'
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
        <button className="flex items-center gap-3 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium w-full">
          <LogOut size={18} />
          Sair do Portal
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
