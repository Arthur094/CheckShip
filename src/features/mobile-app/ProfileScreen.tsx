import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/mobile/login');
  };

  return (
    <div className="bg-background-light dark:bg-background-dark h-full min-h-screen text-slate-main dark:text-white pb-24">
      <header className="sticky top-0 z-50 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-primary transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h1 className="text-lg font-bold text-slate-main dark:text-white flex-1 text-center pr-10">Perfil</h1>
        </div>
      </header>

      <main className="flex flex-col gap-6 p-4 max-w-md mx-auto w-full">
        <section className="flex flex-col items-center bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="relative mb-4 group cursor-pointer">
            <div
              className="h-28 w-28 rounded-full border-4 border-slate-50 dark:border-slate-800 shadow-md overflow-hidden bg-slate-200 bg-cover bg-center"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop')` }}
            >
            </div>
            <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">João Silva</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Gestor de Frota</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm">joao.silva@checkship.com</p>
        </section>

        <nav className="flex flex-col gap-3">
          <button className="flex items-center justify-between w-full bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 active:scale-[0.99] transition-transform">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-primary">
                <span className="material-symbols-outlined">notifications</span>
              </div>
              <span className="text-base font-medium text-slate-700 dark:text-slate-200">Notificações</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">2</span>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </div>
          </button>

          <button className="flex items-center justify-between w-full bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 active:scale-[0.99] transition-transform">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-primary">
                <span className="material-symbols-outlined">help</span>
              </div>
              <span className="text-base font-medium text-slate-700 dark:text-slate-200">Ajuda e Suporte</span>
            </div>
            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
          </button>
        </nav>

        <div className="mt-4">
          <button
            onClick={handleLogout}
            className="w-full py-3.5 px-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-surface-dark text-red-600 dark:text-red-400 font-semibold text-base shadow-sm active:bg-red-50 dark:active:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">logout</span>
            Sair da conta
          </button>
          <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-4">Versão 2.4.0 (Build 2023)</p>
        </div>
      </main>


    </div>
  );
};

export default ProfileScreen;