import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../BottomNav';
import { useAuth } from '../../App';
import { driverService } from '../../services/driverService';

type Tab = 'synced' | 'pending';

const CompletedScreen: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('synced');
  const [completedItems, setCompletedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCompletedInspections = useCallback(async () => {
    if (!session?.user?.id || loading) return;
    setLoading(true);
    try {
      const data = await driverService.getCompletedInspections(session.user.id);
      setCompletedItems(data || []);
    } catch (error) {
      console.error('Erro ao carregar inspeções concluídas:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    loadCompletedInspections();
  }, [loadCompletedInspections]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hoje • ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ontem • ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' • ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className="bg-background-light font-display text-slate-900 min-h-screen flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors text-slate-900"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-slate-900 truncate px-2">
          Checklists Concluídos
        </h1>
        <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors text-slate-900 relative">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 px-4 no-scrollbar">
        <div className="py-2">
          <div className="flex gap-1 p-1 bg-slate-200 rounded-xl">
            <button
              onClick={() => setActiveTab('synced')}
              className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all ${activeTab === 'synced'
                ? 'bg-white text-primary shadow-sm'
                : 'bg-transparent text-slate-600'
                }`}
            >
              Sincronizados
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all ${activeTab === 'pending'
                ? 'bg-white text-primary shadow-sm'
                : 'bg-transparent text-slate-600'
                }`}
            >
              Aguardando <span className="hidden sm:inline">Sincronização</span>
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {activeTab === 'synced' && (
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-base font-bold text-slate-900">
                Sincronizados Recentemente ({completedItems.length})
              </h3>
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="text-center py-10 opacity-60">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">cloud_off</span>
              <p className="text-slate-400 text-sm">Função de sincronização offline será implementada em breve</p>
            </div>
          )}

          {activeTab === 'synced' && (
            loading ? (
              <div className="text-center py-10">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-primary rounded-full"></div>
                <p className="text-sm text-slate-400 mt-2">Carregando...</p>
              </div>
            ) : completedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 opacity-60">
                <div className="text-slate-400 mb-2">
                  <span className="material-symbols-outlined text-5xl">inbox</span>
                </div>
                <p className="text-slate-400 text-sm">Nenhum checklist concluído</p>
              </div>
            ) : (
              completedItems.map((item) => (
                <div key={item.id} className="group flex bg-white rounded-xl shadow-sm border border-slate-200 p-4 gap-4 items-center">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <span className="material-symbols-outlined text-[28px]">local_shipping</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {item.vehicles?.plate}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5 truncate">
                      {item.template?.name || 'Template desconhecido'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(item.completed_at)}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined material-symbols-filled text-emerald-500 text-[28px]">check_circle</span>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </main>

      <div className="fixed bottom-24 right-6 z-30 group">
        <button
          onClick={() => navigate('/vehicles')}
          className="flex items-center justify-center h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-xl px-4 transition-all duration-300"
        >
          <div className="max-w-0 overflow-hidden group-hover:max-w-[150px] group-hover:mr-2 transition-[max-width,margin] duration-300 whitespace-nowrap">
            <span className="text-sm font-bold">Iniciar Inspeção</span>
          </div>
          <span className="material-symbols-outlined text-[28px]">check</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default CompletedScreen;