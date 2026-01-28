
import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Truck,
  Edit3,
  Trash2,
  Filter,
  X,
  Cloud,
  ToggleLeft,
  ToggleRight,
  MoreVertical
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import MultiSelectDropdown from '../../components/common/MultiSelectDropdown';

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

interface VehicleType {
  id: string;
  name: string;
}

interface Filters {
  vehicleTypes: string[];
  active: string[];
}

const Vehicles: React.FC = () => {
  // Data States
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    vehicleTypes: [],
    active: []
  });

  // Selection States
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());

  // Data Fetching
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

  const fetchVehicleTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicle_types')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setVehicleTypes(data || []);
    } catch (error: any) {
      console.error('Error fetching vehicle types:', error.message);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchVehicleTypes();
  }, []);

  // Filter Logic
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      // Search
      const matchesSearch =
        v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model?.toLowerCase().includes(searchTerm.toLowerCase());

      // Vehicle Type Filter
      const matchesType = filters.vehicleTypes.length === 0 ||
        (v.vehicle_type?.name && filters.vehicleTypes.includes(v.vehicle_type.name));

      // Active Filter
      const matchesActive = filters.active.length === 0 ||
        (filters.active.includes('Ativo') && v.active) ||
        (filters.active.includes('Inativo') && !v.active);

      return matchesSearch && matchesType && matchesActive;
    });
  }, [vehicles, searchTerm, filters]);

  // Handlers
  const handleFilterToggle = (filterName: string) => {
    setActiveFilter(activeFilter === filterName ? null : filterName);
  };

  const handleClearFilters = () => {
    setFilters({
      vehicleTypes: [],
      active: []
    });
  };

  // Selection Handlers
  const handleSelectVehicle = (id: string) => {
    const newSelection = new Set(selectedVehicles);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedVehicles(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedVehicles.size === filteredVehicles.length) {
      setSelectedVehicles(new Set());
    } else {
      setSelectedVehicles(new Set(filteredVehicles.map(v => v.id)));
    }
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (selectedVehicles.size === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${selectedVehicles.size} veículos? Esta ação não pode ser desfeita.`)) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .in('id', Array.from(selectedVehicles));

      if (error) throw error;

      alert('Veículos excluídos com sucesso!');
      setSelectedVehicles(new Set());
      fetchVehicles();
    } catch (error: any) {
      alert('Erro ao excluir: ' + error.message);
      setLoading(false);
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedVehicles.size === 0) return;
    if (!confirm(`Tem certeza que deseja desativar ${selectedVehicles.size} veículos?`)) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('vehicles')
        .update({ active: false })
        .in('id', Array.from(selectedVehicles));

      if (error) throw error;

      alert('Veículos desativados com sucesso!');
      setSelectedVehicles(new Set());
      fetchVehicles();
    } catch (error: any) {
      alert('Erro ao desativar: ' + error.message);
      setLoading(false);
    }
  };

  const handleBulkExport = () => {
    if (selectedVehicles.size === 0) return;

    const selectedData = vehicles.filter(v => selectedVehicles.has(v.id));

    const csvContent = [
      ['Placa', 'Modelo', 'Tipo', 'KM Atual', 'Renavam', 'Venc. CRLV', 'Status'],
      ...selectedData.map(v => [
        v.plate,
        v.model,
        v.vehicle_type?.name || '',
        v.current_km?.toString() || '',
        v.renavam || '',
        v.crlv_expiry || '',
        v.active ? 'Ativo' : 'Inativo'
      ])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `veiculos_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleDeleteSingle = async (vehicle: Vehicle) => {
    if (confirm(`Tem certeza que deseja excluir o veículo ${vehicle.plate}?`)) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('vehicles')
          .delete()
          .eq('id', vehicle.id);

        if (error) throw error;
        fetchVehicles();
      } catch (error: any) {
        alert('Erro ao excluir: ' + error.message);
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-8 space-y-6 animate-in slide-in-from-bottom duration-300 relative pb-24">
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
        <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex flex-col space-y-4">

          {/* Top Bar: Search and Toggle Filters */}
          <div className="flex flex-col md:flex-row gap-4 justify-between">
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
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={`px-4 py-2 border rounded-lg text-xs font-bold transition-colors uppercase tracking-wider flex items-center gap-2 ${showFilterPanel ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <Filter size={16} />
                Filtros {showFilterPanel ? 'Ativos' : 'Avançados'}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilterPanel && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <MultiSelectDropdown
                label="Tipo de Operação"
                options={vehicleTypes.map(t => t.name)}
                selected={filters.vehicleTypes}
                onChange={(selected) => setFilters(prev => ({ ...prev, vehicleTypes: selected }))}
                isOpen={activeFilter === 'types'}
                onToggle={() => handleFilterToggle('types')}
              />

              <MultiSelectDropdown
                label="Status (Ativo)"
                options={['Ativo', 'Inativo']}
                selected={filters.active}
                onChange={(selected) => setFilters(prev => ({ ...prev, active: selected }))}
                isOpen={activeFilter === 'active'}
                onToggle={() => handleFilterToggle('active')}
              />

              <div className="flex items-end">
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg font-bold transition-colors flex items-center gap-2"
                >
                  <X size={16} />
                  Limpar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[10px] uppercase font-bold tracking-wider bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={filteredVehicles.length > 0 && selectedVehicles.size === filteredVehicles.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                  />
                </th>
                <th className="px-6 py-4">Veículo</th>
                <th className="px-6 py-4">Tipo / Unidade</th>
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
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
                    <p className="text-sm">Carregando veículos...</p>
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <p className="text-sm">Nenhum veículo encontrado.</p>
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v) => (
                  <tr key={v.id} className={`group transition-colors ${selectedVehicles.has(v.id) ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedVehicles.has(v.id)}
                        onChange={() => handleSelectVehicle(v.id)}
                        className="rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                      />
                    </td>
                    <td className="px-6 py-4 relative group/plate">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
                          <Truck size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800" title={`Unidade: ${v.vehicle_type?.name || 'N/A'}`}>{v.plate}</p>
                          <p className="text-[10px] text-slate-500">{v.model || '-'}</p>
                        </div>
                      </div>
                      {/* Tooltip on Hover */}
                      <div className="absolute left-20 top-0 hidden group-hover/plate:block z-10 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                        Unidade: {v.vehicle_type?.name || 'Não definida'}
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
                          onClick={() => handleDeleteSingle(v)}
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

      {/* Bottom Bar for Bulk Actions */}
      {selectedVehicles.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 flex items-center gap-6 animate-in slide-in-from-bottom-10 z-50">
          <span className="text-sm font-bold text-slate-600 pl-2">
            {selectedVehicles.size} selecionado{selectedVehicles.size > 1 ? 's' : ''}
          </span>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex gap-2">
            <button
              onClick={handleBulkDeactivate}
              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-lg text-slate-600 font-bold text-xs uppercase tracking-wide transition-colors"
            >
              <ToggleRight size={18} />
              Desativar
            </button>
            <button
              onClick={handleBulkExport}
              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-lg text-slate-600 font-bold text-xs uppercase tracking-wide transition-colors"
            >
              <Cloud size={18} />
              Exportar
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold text-xs uppercase tracking-wide transition-colors"
            >
              <Trash2 size={18} />
              Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
