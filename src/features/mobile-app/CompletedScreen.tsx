import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

type Tab = 'synced' | 'pending';

interface CompletedItem {
  id: number;
  plate: string;
  model: string;
  time: string;
  driver: string;
  status: 'synced' | 'pending';
}

const INITIAL_MOCK_ITEMS: CompletedItem[] = [
  // Pending items (10 items)
  { id: 1, plate: 'XYZ-9876', model: 'Scania R450', time: 'Hoje • 08:15', driver: 'Carlos Souza', status: 'pending' },
  { id: 2, plate: 'PLM-5521', model: 'Volvo FH16', time: 'Hoje • 09:30', driver: 'Ana Oliveira', status: 'pending' },
  { id: 3, plate: 'ABC-5544', model: 'Mercedes Actros', time: 'Hoje • 10:45', driver: 'Pedro Santos', status: 'pending' },
  { id: 4, plate: 'GHT-1122', model: 'DAF XF', time: 'Hoje • 11:20', driver: 'João Silva', status: 'pending' },
  { id: 5, plate: 'JUK-9988', model: 'Iveco Stralis', time: 'Hoje • 13:00', driver: 'Marcos Paulo', status: 'pending' },
  { id: 6, plate: 'LKO-3344', model: 'VW Meteor', time: 'Hoje • 14:15', driver: 'Roberto Lima', status: 'pending' },
  { id: 7, plate: 'MNB-7766', model: 'Scania P360', time: 'Hoje • 15:30', driver: 'Felipe Costa', status: 'pending' },
  { id: 8, plate: 'BVC-4455', model: 'Volvo VM', time: 'Hoje • 16:45', driver: 'Ricardo Alves', status: 'pending' },
  { id: 9, plate: 'CXD-2211', model: 'Mercedes Axor', time: 'Ontem • 17:10', driver: 'Bruno Dias', status: 'pending' },
  { id: 10, plate: 'DSA-8899', model: 'Ford Cargo', time: 'Ontem • 18:20', driver: 'André Souza', status: 'pending' },

  // Synced items (10 items)
  { id: 11, plate: 'ABC-1234', model: 'Ford Transit', time: 'Ontem • 14:30', driver: 'João Silva', status: 'synced' },
  { id: 12, plate: 'KJS-9281', model: 'Volvo FH 540', time: 'Ontem • 10:15', driver: 'João Silva', status: 'synced' },
  { id: 13, plate: 'RTA-4412', model: 'Scania R450', time: '23/10 • 16:45', driver: 'Pedro Santos', status: 'synced' },
  { id: 14, plate: 'HGF-5566', model: 'Mercedes Sprinter', time: '22/10 • 09:00', driver: 'Lucas Martins', status: 'synced' },
  { id: 15, plate: 'POI-1122', model: 'Renault Master', time: '22/10 • 11:30', driver: 'Gabriel Rocha', status: 'synced' },
  { id: 16, plate: 'QWE-7788', model: 'Fiat Ducato', time: '21/10 • 14:20', driver: 'Matheus Lima', status: 'synced' },
  { id: 17, plate: 'ZXC-3344', model: 'Peugeot Boxer', time: '21/10 • 16:10', driver: 'Rafael Santos', status: 'synced' },
  { id: 18, plate: 'TRP-9900', model: 'Iveco Daily', time: '20/10 • 08:45', driver: 'Daniel Costa', status: 'synced' },
  { id: 19, plate: 'YUI-2211', model: 'VW Delivery', time: '20/10 • 10:15', driver: 'Thiago Oliveira', status: 'synced' },
  { id: 20, plate: 'MKL-6655', model: 'Hyundai HR', time: '19/10 • 13:40', driver: 'Leonardo Silva', status: 'synced' },
];

const CompletedScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('synced');
  const [items, setItems] = useState<CompletedItem[]>(INITIAL_MOCK_ITEMS);
  const [syncingIds, setSyncingIds] = useState<Set<number>>(new Set());
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const filteredItems = items.filter(item => item.status === activeTab);
  const pendingCount = items.filter(item => item.status === 'pending').length;

  // Simulate network request for single item
  const handleSync = useCallback((id: number) => {
    // Start animation
    setSyncingIds(prev => new Set(prev).add(id));

    // Simulate delay
    setTimeout(() => {
      // Update item status to synced
      setItems(currentItems => currentItems.map(item =>
        item.id === id ? { ...item, status: 'synced', time: 'Agora mesmo' } : item
      ));

      // Stop animation
      setSyncingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2000); // 2 seconds delay
  }, []);

  // Simulate syncing all items
  const handleSyncAll = useCallback(() => {
    const pendingItems = items.filter(i => i.status === 'pending');
    if (pendingItems.length === 0) return;

    setIsSyncingAll(true);
    // Add all pending IDs to syncing set to animate individual cards too if visible
    const pendingIds = pendingItems.map(i => i.id);
    setSyncingIds(new Set(pendingIds));

    setTimeout(() => {
      setItems(currentItems => currentItems.map(item =>
        item.status === 'pending' ? { ...item, status: 'synced', time: 'Agora mesmo' } : item
      ));
      setSyncingIds(new Set());
      setIsSyncingAll(false);
    }, 3000); // 3 seconds delay for "all"
  }, [items]);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 bg-background-light dark:bg-background-dark sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-900 dark:text-white"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-slate-900 dark:text-white truncate px-2">
          Checklists Concluídos
        </h1>
        <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-900 dark:text-white relative">
          <span className="material-symbols-outlined">notifications</span>
          {pendingCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-background-light dark:border-background-dark rounded-full"></span>
          )}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 px-4 no-scrollbar">
        <div className="py-2">
          <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setActiveTab('synced')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${activeTab === 'synced'
                ? 'bg-white dark:bg-slate-700 text-primary dark:text-blue-400 shadow-sm transform scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              Sincronizados
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${activeTab === 'pending'
                ? 'bg-white dark:bg-slate-700 text-primary dark:text-blue-400 shadow-sm transform scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              Aguardando <span className="hidden sm:inline">Sincronização</span>
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {activeTab === 'pending' && (
            <div className="flex items-center justify-between pb-1">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {filteredItems.length} itens pendentes
              </p>
              {filteredItems.length > 0 && (
                <button
                  onClick={handleSyncAll}
                  disabled={isSyncingAll}
                  className="flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className={`material-symbols-outlined text-[18px] ${isSyncingAll ? 'animate-spin' : ''}`}>
                    {isSyncingAll ? 'sync' : 'cloud_upload'}
                  </span>
                  {isSyncingAll ? 'Sincronizando...' : 'Sincronizar Tudo'}
                </button>
              )}
            </div>
          )}

          {activeTab === 'synced' && (
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Sincronizados Recentemente
              </h3>
              <button className="text-xs font-semibold text-primary hover:text-primary-dark">Ver todos</button>
            </div>
          )}

          {filteredItems.map((item) => (
            item.status === 'pending' ? (
              <div key={item.id} className="group relative flex flex-col bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 border-l-[6px] border-l-orange-500 overflow-hidden">
                <div className="p-4 flex gap-4">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                      <span className="material-symbols-outlined text-[28px]">local_shipping</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate pr-2">
                        {item.model} - {item.plate}
                      </h3>
                      <span className="material-symbols-outlined text-orange-500 text-[20px]">cloud_off</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {item.time}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                      <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{item.driver}</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4 pt-0">
                  <button
                    onClick={() => handleSync(item.id)}
                    disabled={syncingIds.has(item.id)}
                    className="w-full flex items-center justify-center gap-2 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300 py-2.5 rounded-lg text-sm font-semibold transition-colors border border-orange-100 dark:border-orange-800 disabled:opacity-70 disabled:cursor-wait"
                  >
                    <span className={`material-symbols-outlined text-[18px] ${syncingIds.has(item.id) ? 'animate-spin' : ''}`}>
                      {syncingIds.has(item.id) ? 'sync' : 'sync'}
                    </span>
                    {syncingIds.has(item.id) ? 'Sincronizando...' : 'Sincronizar Agora'}
                  </button>
                </div>
              </div>
            ) : (
              <div key={item.id} className="group flex bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 gap-4 items-center">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <span className="material-symbols-outlined text-[28px]">local_shipping</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {item.model} - {item.plate}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {item.time}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                    <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{item.driver}</p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined material-symbols-filled text-emerald-500 text-[28px]">check_circle</span>
                </div>
              </div>
            )
          ))}

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 opacity-60">
              <div className="text-slate-400 mb-2">
                <span className="material-symbols-outlined text-5xl">inbox</span>
              </div>
              <p className="text-slate-400 text-sm">Nenhum item encontrado</p>
            </div>
          )}
        </div>
      </main>

      {/* FAB - Using container to create hover effect label */}
      <div className="fixed bottom-24 right-6 z-30 group">
        <button
          onClick={() => navigate('/mobile/vehicle-select')}
          className="flex items-center justify-center h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-xl px-4 transition-all duration-300"
        >
          <div className="max-w-0 overflow-hidden group-hover:max-w-[150px] group-hover:mr-2 transition-[max-width,margin] duration-300 whitespace-nowrap">
            <span className="text-sm font-bold">Iniciar Inspeção</span>
          </div>
          <span className="material-symbols-outlined text-[28px]">check</span>
        </button>
      </div>

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent dark:from-blue-900/20"></div>

    </div>
  );
};

export default CompletedScreen;