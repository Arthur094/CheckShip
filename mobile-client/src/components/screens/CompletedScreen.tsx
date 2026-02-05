import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../BottomNav';
import { useAuth } from '../../App';
import { cacheService } from '../../services/cacheService';
import { localStorageService } from '../../services/localStorageService';
import { supabase } from '../../lib/supabase';

type Tab = 'synced' | 'pending';

const CompletedScreen: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('synced');
  const [completedItems, setCompletedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load last sync timestamp
  useEffect(() => {
    const sync = cacheService.getLastSync();
    setLastSync(sync);
  }, []);

  const loadCompletedInspections = useCallback(async () => {
    if (!session?.user?.id || loading) return;
    setLoading(true);
    try {
      // Get completed inspections from cache
      const synced = cacheService.getCompletedInspections() || [];
      setCompletedItems(synced);
    } catch (error) {
      console.error('Erro ao carregar inspeções concluídas:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    loadCompletedInspections();
  }, [loadCompletedInspections]);

  // Sync cache manually
  const handleCacheSync = async () => {
    if (!session?.user?.id || syncing) return;
    setSyncing(true);
    try {
      await cacheService.downloadAllData(session.user.id, supabase);
      const sync = cacheService.getLastSync();
      setLastSync(sync);
      await loadCompletedInspections(); // Reload data after sync
      alert('✅ Dados sincronizados com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      alert('❌ Erro ao sincronizar dados');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncOne = async (pendingId: string) => {
    try {
      const pending = localStorageService.getAllPending().find(p => p.id === pendingId);
      if (!pending) return;

      const { error } = await supabase
        .from('checklist_inspections')
        .insert({
          checklist_template_id: pending.checklist_template_id,
          vehicle_id: pending.vehicle_id,
          inspector_id: pending.inspector_id,
          responses: pending.responses,
          status: pending.status,
          started_at: pending.started_at,
          completed_at: pending.completed_at
        });

      if (error) throw error;

      localStorageService.removePending(pendingId);
      alert('✅ Inspeção sincronizada com sucesso!');
      loadCompletedInspections();
    } catch (error: any) {
      console.error('Erro ao sincronizar:', error);
      alert('❌ Erro ao sincronizar: ' + error.message);
    }
  };

  const handleSyncAll = async () => {
    const pending = localStorageService.getAllPending();
    if (pending.length === 0 || isSyncing) return;

    setIsSyncing(true);

    let synced = 0;
    let failed = 0;

    for (const p of pending) {
      try {
        const { error } = await supabase
          .from('checklist_inspections')
          .insert({
            checklist_template_id: p.checklist_template_id,
            vehicle_id: p.vehicle_id,
            inspector_id: p.inspector_id,
            responses: p.responses,
            status: p.status,
            started_at: p.started_at,
            completed_at: p.completed_at
          });

        if (error) throw error;

        localStorageService.removePending(p.id);
        synced++;
      } catch (error) {
        console.error('Erro ao sincronizar:', error);
        failed++;
      }
    }

    setIsSyncing(false);

    alert(`✅ ${synced} sincronizadas${failed > 0 ? `, ${failed} falharam` : ''}!`);
    loadCompletedInspections();
  };

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
        <div className="flex-1 text-center px-2">
          <h1 className="text-lg font-bold text-slate-900 truncate">
            Checklists Concluídos
          </h1>
          {lastSync && (
            <p className="text-xs text-slate-500">
              Sync: {new Date(lastSync).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <button
          onClick={handleCacheSync}
          disabled={syncing || !isOnline}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors text-slate-900 relative disabled:opacity-50"
          title={isOnline ? "Sincronizar dados" : "Sem conexão"}
        >
          <span className={`material-symbols-outlined ${syncing ? 'animate-spin' : ''}`}>
            {isOnline ? 'sync' : 'wifi_off'}
          </span>
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
            <>
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-base font-bold text-slate-900">
                  Aguardando ({localStorageService.getPendingCount()})
                </h3>
                {localStorageService.getPendingCount() > 0 && (
                  <button
                    onClick={handleSyncAll}
                    disabled={isSyncing || !isOnline}
                    className="text-sm font-semibold text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {!isOnline ? (
                      <>
                        <span className="material-symbols-outlined text-sm">wifi_off</span>
                        Offline
                      </>
                    ) : isSyncing ? 'Sincronizando...' : 'Sincronizar Tudo'}
                  </button>
                )}
              </div>

              {localStorageService.getPendingCount() === 0 ? (
                <div className="text-center py-10 opacity-60">
                  <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">cloud_done</span>
                  <p className="text-slate-500 font-medium mt-2">Nenhuma inspeção pendente</p>
                  <p className="text-xs text-slate-400 mt-1">Todas sincronizadas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {localStorageService.getAllPending().map((inspection) => (
                    <div
                      key={inspection.id}
                      className="bg-white rounded-2xl p-4 border border-orange-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                          <span className="material-symbols-outlined text-orange-600 text-2xl">cloud_upload</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 truncate">{inspection.vehiclePlate}</h3>
                          <p className="text-sm text-slate-600 truncate">{inspection.templateName}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="material-symbols-outlined text-orange-500 text-sm">schedule</span>
                            <p className="text-xs text-orange-600 font-medium">
                              {new Date(inspection.completed_at).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSyncOne(inspection.id)}
                          className="flex-shrink-0 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition-colors"
                        >
                          Sync
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
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
