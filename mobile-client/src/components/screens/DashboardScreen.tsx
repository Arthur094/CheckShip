import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../BottomNav';
import { useAuth } from '../../App';
import { driverService } from '../../services/driverService';
import { localStorageService } from '../../services/localStorageService';
import { cacheService } from '../../services/cacheService';
import { supabase } from '../../lib/supabase';

const DuckIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.5,4.5h-0.8c0.3-0.5,0.4-1,0.2-1.6c-0.2-0.6-0.8-1-1.4-1.2c-0.6-0.1-1.2,0.1-1.7,0.5L14,3.8C13.2,3.3,12.1,3,11,3
    c-3.3,0-6,2.7-6,6c0,2.1,1.1,3.9,2.8,5c-0.3,0.3-0.7,0.7-1,1.1l-2.4-0.8c-0.6-0.2-1.2,0.1-1.5,0.7s0,1.3,0.6,1.7l3,1.6
    c1.4,0.7,3,0.8,4.5,0.2c1.5-0.6,2.6-1.8,3.1-3.3c3.8-0.9,6.5-4.4,6.5-8.4C20.5,5.9,20.1,5.1,19.5,4.5z M16.5,8c-0.6,0-1-0.4-1-1
    s0.4-1,1-1s1,0.4,1,1S17.1,8,16.5,8z"/>
  </svg>
);

const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [inspections, setInspections] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

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
      const data = await driverService.getRecentInspections(session.user.id);
      setInspections(data || []);

      // Load drafts
      const draftData = localStorageService.getAllDrafts();
      setDrafts(draftData);
    } catch (error) {
      console.error('Erro ao carregar inspeções:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

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
          disabled={syncing}
          className="size-10 flex items-center justify-center disabled:opacity-50"
          title="Sincronizar dados"
        >
          <span className={`material-symbols-outlined ${syncing ? 'animate-spin' : ''}`}>sync</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-28 space-y-4">
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-sm font-semibold text-slate-500 uppercase">Iniciados Recentes</h2>
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
            {drafts.length + inspections.length} Ativos
          </span>
        </div>


        {drafts.length === 0 && inspections.length === 0 ? (
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
                onClick={() => navigate(`/inspection/${draft.vehicleId}/${draft.templateId}`)}
                className="p-4 bg-white rounded-2xl shadow-sm border-2 border-blue-200 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <DuckIcon size={24} className="text-blue-600" />
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

            {/* Regular inspections */}
            {inspections.map((inspection) => (
              <article key={inspection.id} className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                    <DuckIcon size={24} className="text-slate-500" />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase">{inspection.vehicles?.plate}</h3>
                    <p className="text-xs text-slate-500">{inspection.template?.name || 'Template desconhecido'}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-300">chevron_right</span>
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

      <BottomNav />
    </div>
  );
};

export default DashboardScreen;