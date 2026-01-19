import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 z-30 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive('/dashboard') ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <span className={`material-symbols-outlined ${isActive('/dashboard') ? 'material-symbols-filled' : ''}`}>play_circle</span>
          <span className="text-[10px] font-medium">Iniciados</span>
        </button>

        <button
          onClick={() => navigate('/analysis')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive('/analysis') ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <span className={`material-symbols-outlined ${isActive('/analysis') ? 'material-symbols-filled' : ''}`}>assignment_turned_in</span>
          <span className="text-[10px] font-medium">Análise</span>
        </button>

        <button
          onClick={() => navigate('/completed')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive('/completed') ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <span className={`material-symbols-outlined ${isActive('/completed') ? 'material-symbols-filled' : ''}`}>check_circle</span>
          <span className="text-[10px] font-medium">Concluídos</span>
        </button>

        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive('/profile') ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <span className={`material-symbols-outlined ${isActive('/profile') ? 'material-symbols-filled' : ''}`}>person</span>
          <span className="text-[10px] font-medium">Mais+</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;