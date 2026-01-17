
import React, { useState, useEffect } from 'react';
import { Plus, Search, Truck, MoreVertical, Edit3, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  vehicle_type?: {
    name: string;
  };
  current_km?: number;
  renavam?: string;
  crlv_expiry?: string;
  active: boolean;
}

const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          id,
          plate,
          model,
          current_km,
          renavam,
          crlv_expiry,
          active,
          vehicle_type:vehicle_types(name)
        `)
        .order('plate');

      if (error) throw error;
      setVehicles(data || []);
    } catch (error: any) {
      console.error('Error fetching vehicles:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDelete = async (vehicle: Vehicle) => {
    if (confirm(`Tem certeza que deseja excluir o veículo ${vehicle.plate}?`)) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('vehicles')
          .delete()
          .eq('id', vehicle.id);

        if (error) throw error;

        alert('Veículo excluído com sucesso.');
        fetchVehicles();
      } catch (error: any) {
        console.error('Erro ao excluir veículo:', error);
        alert('Erro ao excluir veículo: ' + error.message);
        setLoading(false);
      }
    }
  };

  const filteredVehicles = vehicles.filter(v =>
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 animate-in slide-in-from-bottom duration-300">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Veículos (Frota)</h1>
          <p className="text-slate-500">Gestão centralizada de ativos da transportadora.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl font-bold shadow-lg hover:bg-blue-800 transition-all active:scale-95">
          <Plus size={20} />
          CADASTRAR VEÍCULO
        </button>
      </header>

      {/* Table & Tools */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Pesquisar por placa ou modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-wider">Exportar</button>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-wider">Filtros Avançados</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="px-6 py-4">Veículo</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">KM Atual</th>
                <th className="px-6 py-4">Renavam</th>
                <th className="px-6 py-4">Venc. CRLV</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
                    <p className="text-sm">Carregando veículos...</p>
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <p className="text-sm">Nenhum veículo encontrado.</p>
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
                          <Truck size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{v.plate}</p>
                          <p className="text-[10px] text-slate-500">{v.model || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">
                      {v.vehicle_type?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {v.current_km ? `${v.current_km.toLocaleString()} km` : '-'}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      {v.renavam || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-600">
                        {v.crlv_expiry || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${v.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {v.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-2 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(v)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Vehicles;
