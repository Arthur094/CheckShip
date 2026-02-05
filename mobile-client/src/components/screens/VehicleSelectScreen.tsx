import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { cacheService } from '../../services/cacheService';

const VehicleSelectScreen: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchVehicles() {
      if (!session?.user?.id) return;
      setLoading(true);
      try {
        // Get vehicles from cache instead of Supabase
        const cachedVehicles = cacheService.getVehicles();
        setVehicles(cachedVehicles || []);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicles();
  }, [session?.user?.id]);

  const filtered = vehicles.filter(v =>
    v.plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-background-light min-h-screen flex flex-col">
      <header className="p-4 bg-white border-b flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold">Frota Vinculada (Real)</h1>
      </header>

      <main className="p-4 space-y-4">
        <input
          type="text"
          placeholder="Buscar placa no banco..."
          className="w-full p-4 rounded-xl border border-slate-200 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="space-y-3">
          {loading ? (
            <p className="text-center py-10">Carregando veículos...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500">Nenhum veículo vinculado.</p>
              <p className="text-xs text-slate-400 mt-1">Verifique seu perfil no banco.</p>
            </div>
          ) : (
            filtered.map((v) => (
              <button
                key={v.id}
                onClick={() => navigate(`/template/${v.id}`)}
                className="w-full bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4"
              >
                <div className="size-12 bg-blue-50 text-primary flex items-center justify-center rounded-lg">
                  <span className="material-symbols-outlined">local_shipping</span>
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-slate-900 uppercase">{v.plate}</p>
                  <p className="text-xs text-slate-500">{v.brand} {v.model}</p>
                </div>
                <span className="material-symbols-outlined text-slate-300">chevron_right</span>
              </button>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default VehicleSelectScreen;