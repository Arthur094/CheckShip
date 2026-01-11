import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../BottomNav';
import { useAuth } from '../../App';
import { driverService } from '../../services/driverService';

const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Usamos useCallback para estabilizar a função e evitar loops
  const loadData = useCallback(async () => {
    if (!session?.user?.id || loading) return;
    setLoading(true);
    try {
      const data = await driverService.getRecentInspections(session.user.id);
      setInspections(data || []);
    } catch (error) {
      console.error('Erro ao carregar inspeções:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="flex flex-col h-full bg-background-light relative min-h-screen">
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined material-symbols-filled">directions_boat</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">CheckShip</h1>
        </div>
        <button onClick={loadData} className="size-10 flex items-center justify-center">
          <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>refresh</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-28 space-y-4">
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-sm font-semibold text-slate-500 uppercase">Iniciados Recentes</h2>
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
            {inspections.length} Ativos
          </span>
        </div>

        {inspections.length === 0 ? (
          <div className="text-center py-20 opacity-60">
            <span className="material-symbols-outlined text-5xl mb-2 text-slate-300">inventory_2</span>
            <p className="text-slate-400">Nenhum checklist em aberto.</p>
          </div>
        ) : (
          inspections.map((inspection) => (
            <article key={inspection.id} className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined">local_shipping</span>
                </div>
                <div>
                  <h3 className="font-bold uppercase">{inspection.vehicles?.plate}</h3>
                  <p className="text-xs text-slate-500">{inspection.status}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </article>
          ))
        )}
      </main>

      <div className="fixed bottom-24 right-6 z-30">
        <button
          onClick={() => navigate('/vehicles')}
          className="flex items-center justify-center h-14 bg-primary text-white rounded-full shadow-xl px-6 font-bold gap-2"
        >
          <span>Iniciar Inspeção</span>
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default DashboardScreen;