import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import BottomNav from '../BottomNav';
import { supabase } from '../../lib/supabase';
import { cacheService } from '../../services/cacheService';

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { logout, session } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserProfile() {
      if (!session?.user?.id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, role, email')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setUserProfile(data);
        // Atualiza cache se conseguiu buscar online
        if (data) {
          localStorage.setItem('checkship_user_profile', JSON.stringify(data));
        }
      } catch (error) {
        console.error('📴 Erro ao carregar perfil online, usando cache:', error);
        // FALLBACK: Busca do cache
        const cachedProfile = cacheService.getUserProfile();
        if (cachedProfile) {
          setUserProfile(cachedProfile);
        }
      } finally {
        setLoading(false);
      }
    }
    loadUserProfile();
  }, [session?.user?.id]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNotifications = () => {
    alert('Não existe nenhuma notificação no momento');
  };

  const handleSupport = () => {
    alert('Click no link e fale com o suporte pelo nosso whatsapp');
    // Opcional: Abrir WhatsApp
    // window.open('https://wa.me/5511999999999', '_blank');
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'GESTOR': 'Gestor de Frota',
      'MOTORISTA': 'Motorista',
      'SUPERVISOR': 'Supervisor',
      'ADMIN': 'Administrador'
    };
    return roleMap[role] || role;
  };

  return (
    <div className="bg-background-light h-full min-h-screen text-slate-900 pb-24">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center p-2 rounded-full hover:bg-slate-100 text-primary transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h1 className="text-lg font-bold text-slate-900 flex-1 text-center pr-10">Perfil</h1>
        </div>
      </header>

      <main className="flex flex-col gap-6 p-4 max-w-md mx-auto w-full">
        <section className="flex flex-col items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          {loading ? (
            <div className="py-8">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-primary rounded-full"></div>
            </div>
          ) : (
            <>
              <div className="relative mb-4 group cursor-pointer">
                <div
                  className="h-28 w-28 rounded-full border-4 border-slate-50 shadow-md overflow-hidden bg-primary flex items-center justify-center text-white text-3xl font-bold"
                >
                  {userProfile?.full_name?.charAt(0) || 'U'}
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">{userProfile?.full_name || 'Usuário'}</h2>
              <p className="text-slate-500 text-sm font-medium mb-1">{getRoleDisplayName(userProfile?.role || '')}</p>
              <p className="text-slate-400 text-sm">{userProfile?.email || 'email@exemplo.com'}</p>
            </>
          )}
        </section>

        <nav className="flex flex-col gap-3">
          <button
            onClick={handleNotifications}
            className="flex items-center justify-between w-full bg-white p-4 rounded-xl shadow-sm border border-slate-100 active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-10 rounded-lg bg-blue-50 text-primary">
                <span className="material-symbols-outlined">notifications</span>
              </div>
              <span className="text-base font-medium text-slate-700">Notificações</span>
            </div>
            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
          </button>

          <button
            onClick={handleSupport}
            className="flex items-center justify-between w-full bg-white p-4 rounded-xl shadow-sm border border-slate-100 active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-10 rounded-lg bg-blue-50 text-primary">
                <span className="material-symbols-outlined">help</span>
              </div>
              <span className="text-base font-medium text-slate-700">Ajuda e Suporte</span>
            </div>
            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
          </button>
        </nav>

        <div className="mt-4">
          <button
            onClick={handleLogout}
            className="w-full py-3.5 px-4 rounded-xl border border-red-200 bg-white text-red-600 font-semibold text-base shadow-sm active:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">logout</span>
            Sair da conta
          </button>
          <p className="text-center text-xs text-slate-400 mt-4">Versão 2.4.0 (Build 2023)</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default ProfileScreen;