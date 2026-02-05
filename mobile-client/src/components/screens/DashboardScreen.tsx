import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../BottomNav';
import { useAuth } from '../../App';
import { localStorageService } from '../../services/localStorageService';
import { cacheService } from '../../services/cacheService';
import { supabase } from '../../lib/supabase';

const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [drafts, setDrafts] = useState<any[]>([]);
  const [draftModalId, setDraftModalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
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

  // Usamos useCallback para estabilizar a função e evitar loops
  const loadData = useCallback(async () => {
    if (!session?.user?.id || loading) return;
    setLoading(true);
    try {
      // Load only drafts - no completed inspections
      const draftData = localStorageService.getAllDrafts();
      setDrafts(draftData);
    } catch (error) {
      console.error('Erro ao carregar rascunhos:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, loading]);

  // Sync cache manually
  const handleSync = async () => {
    if (!session?.user?.id || syncing) return;
    setSyncing(true);
    try {
      await cacheService.downloadAllData(session.user.id, supabase);
      const sync = cacheService.getLastSync();
      setLastSync(sync);
      await loadData(); // Reload data after sync
      alert('✅ Dados sincronizados com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      alert('❌ Erro ao sincronizar dados');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="flex flex-col h-full bg-background-light relative min-h-screen">
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 z-20">
        <div className="flex items-center gap-3">
          {/* CS Box Logo */}
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary shadow-sm">
            <span className="text-lg font-bold text-white">CS</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-wide">CHECKSHIP</h1>
            {lastSync && (
              <p className="text-xs text-slate-500">
                Sync: {new Date(lastSync).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing || !isOnline}
          className="size-10 flex items-center justify-center disabled:opacity-50 transition-opacity"
          title={isOnline ? "Sincronizar dados" : "Sem conexão com a internet"}
        >
          <span className={`material-symbols-outlined ${syncing ? 'animate-spin' : ''}`}>
            {isOnline ? 'sync' : 'wifi_off'}
          </span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-28 space-y-4">
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-sm font-semibold text-slate-500 uppercase">Iniciados Recentes</h2>
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
            {drafts.length} Ativos
          </span>
        </div>


        {drafts.length === 0 ? (
          <div className="text-center py-20 opacity-60">
            <span className="material-symbols-outlined text-5xl mb-2 text-slate-300">inventory_2</span>
            <p className="text-slate-400">Nenhum checklist em aberto.</p>
          </div>
        ) : (
          <>
            {/* Draft cards */}
            {drafts.map((draft) => (
              <article
                key={draft.id}
                onClick={() => setDraftModalId(draft.id)}
                className="p-4 bg-white rounded-2xl shadow-sm border-2 border-blue-200 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600">edit_note</span>
                  </div>
                  <div>
                    <h3 className="font-bold uppercase text-slate-900">{draft.vehiclePlate}</h3>
                    <p className="text-xs text-slate-600">{draft.templateName}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-blue-500 text-xs">schedule</span>
                      <p className="text-xs text-blue-600 font-medium">Rascunho</p>
                    </div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
              </article>
            ))}
          </>
        )}
      </main>

      <div className="fixed bottom-24 right-6 z-30 group">
        <button
          onClick={() => navigate('/vehicles')}
          className="flex items-center justify-center h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-xl px-4 transition-all duration-300"
        >
          <div className="max-w-0 overflow-hidden group-hover:max-w-[150px] group-hover:mr-2 transition-[max-width,margin] duration-300 whitespace-nowrap">
            <span className="text-sm font-bold">Iniciar Inspeção</span>
          </div>
          <span className="material-symbols-outlined text-[28px]">add</span>
        </button>
      </div>

      {/* Draft Modal */}
      {draftModalId && (() => {
        const draft = drafts.find(d => d.id === draftModalId);
        if (!draft) return null;

        const handleResume = () => {
          navigate(`/inspection/${draft.vehicleId}/${draft.templateId}`);
          setDraftModalId(null);
        };

        const handleDelete = () => {
          const draftKey = `${draft.vehicleId}_${draft.templateId}`;
          localStorageService.removeDraft(draftKey);
          setDraftModalId(null);
          loadData();
        };

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="font-bold text-lg text-slate-900 mb-1">{draft.vehiclePlate}</h3>
              <p className="text-sm text-slate-600 mb-6">{draft.templateName}</p>
              <div className="space-y-3">
                <button onClick={handleResume} className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">
                  Retomar
                </button>
                <button onClick={handleDelete} className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
                  Excluir
                </button>
                <button onClick={() => setDraftModalId(null)} className="w-full py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <BottomNav />
    </div>
  );
};

export default DashboardScreen;