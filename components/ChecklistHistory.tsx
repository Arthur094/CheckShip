
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Download, Trash2, CheckCircle2, Eye, AlertTriangle, FileText, MoreVertical, Calendar, ChevronDown, ChevronUp, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { useNavigate } from 'react-router-dom';
import ExportModal from './ExportModal';
import MultiSelectDropdown from '../src/components/common/MultiSelectDropdown';

interface HistoryItem {
  id: string;
  status: string;
  started_at: string;
  completed_at: string;
  user: { full_name: string; role: string; id: string } | null;
  vehicle: {
    id: string;
    plate: string;
    model: string;
    type?: string;
    vehicle_types?: { name: string; id: string }
  } | null;
  template: { name: string; id: string } | null;
  critical_count?: number;
}

interface FilterOptions {
  userTypes: { id: string; label: string }[];
  vehicleTypes: { id: string; label: string }[];
  vehicles: { id: string; label: string }[];
  checklists: { id: string; label: string }[];
  users: { id: string; label: string }[];
}

const ChecklistHistory: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter Data
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    userTypes: [
      { id: 'GESTOR', label: 'Gestor' },
      { id: 'MOTORISTA', label: 'Motorista' },
      { id: 'ADMIN_MASTER', label: 'Admin Master' }
    ],
    vehicleTypes: [],
    vehicles: [],
    checklists: [],
    users: []
  });

  // Filter State
  const [filters, setFilters] = useState({
    status: ['Finalizado'],
    periodType: 'started_at',
    startDate: '2026-01-01',
    endDate: new Date().toISOString().split('T')[0],
    code: '',
    vehicleTypes: [] as string[],
    vehicles: [] as string[],
    checklists: [] as string[],
    userTypes: [] as string[],
    users: [] as string[],
    platform: [] as string[]
  });

  const [activeFilterDropdown, setActiveFilterDropdown] = useState<string | null>(null);

  // Pagination & Selection
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showPerPageDropdown, setShowPerPageDropdown] = useState(false);

  // Action States
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchFilterData();
    fetchHistory();
  }, []);

  const fetchFilterData = async () => {
    try {
      const [vTypes, vecs, tpls, usrs] = await Promise.all([
        supabase.from('vehicle_types').select('id, name').order('name'),
        supabase.from('vehicles').select('id, plate').order('plate'),
        supabase.from('checklist_templates').select('id, name').order('name'),
        supabase.from('profiles').select('id, full_name').order('full_name') // Using profiles for filtering by user
      ]);

      setFilterOptions(prev => ({
        ...prev,
        vehicleTypes: (vTypes.data || []).map(x => ({ id: x.name, label: x.name })), // Using name for UI filter match mostly, or align with how vehicle stores it. Vehicle stores name often in joins.
        vehicles: (vecs.data || []).map(x => ({ id: x.id, label: x.plate })),
        checklists: (tpls.data || []).map(x => ({ id: x.id, label: x.name })),
        users: (usrs.data || []).map(x => ({ id: x.id, label: x.full_name })),
      }));
    } catch (e) {
      console.error('Error fetching filter options', e);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('checklist_inspections')
        .select(`
          id,
          status,
          started_at,
          completed_at,
          responses,
          vehicle:vehicles!vehicle_id (
            id,
            plate,
            model,
            vehicle_types!vehicle_type_id (name, id)
          ),
          template:checklist_templates!checklist_template_id (name, id),
          user:profiles!inspector_id (full_name, role, id)
        `)
        .order('started_at', { ascending: false });

      if (error) throw error;

      // Post-process for issues count
      const processed = (data || []).map((item: any) => {
        let issues = 0;
        if (item.responses) {
          Object.values(item.responses).forEach((ans: any) => {
            if (ans?.answer === 'nao_conforme' || ans?.answer === 'reprovado') issues++;
          });
        }

        return {
          id: item.id,
          status: item.status,
          started_at: item.started_at,
          completed_at: item.completed_at,
          user: item.user,
          vehicle: item.vehicle,
          template: item.template,
          critical_count: issues
        };
      });

      setHistory(processed);

    } catch (error: any) {
      console.error('Error fetching history:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      // 1. Status
      if (filters.status.length > 0) {
        // Map UI status labels to internal keys if needed, or simple match
        // UI: 'Finalizado' -> 'completed', 'Em Andamento' -> 'in_progress'
        const itemStatus = item.status === 'completed' ? 'Finalizado' : item.status === 'in_progress' ? 'Em Andamento' : item.status;
        const mappedFilters = filters.status.map(s => s === 'Finalizado' ? 'completed' : s === 'Em Andamento' ? 'in_progress' : s);
        if (!mappedFilters.includes(item.status) && !filters.status.includes(itemStatus)) return false;
      }

      // 2. Period
      if (filters.startDate || filters.endDate) {
        const dateStr = filters.periodType === 'completed_at' ? item.completed_at : item.started_at;
        if (!dateStr) {
          // If filtering by completion date and item is not completed, it shouldn't show? Or ignore?
          // Typically if I select "Data de Conclusão", uncompleted items should probably be hidden or never match if date is required.
          // However, if only start date is set, check >= start.
          if (filters.startDate && filters.periodType === 'completed_at') return false;
        } else {
          const date = new Date(dateStr);
          if (filters.startDate) {
            const start = new Date(filters.startDate);
            start.setHours(0, 0, 0, 0);
            if (date < start) return false;
          }
          if (filters.endDate) {
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            if (date > end) return false;
          }
        }
      }

      // 3. Code
      if (filters.code) {
        if (!item.id.toLowerCase().includes(filters.code.toLowerCase())) return false;
      }

      // 4. Vehicle Type
      if (filters.vehicleTypes.length > 0) {
        const vTypeName = item.vehicle?.vehicle_types?.name;
        if (!vTypeName || !filters.vehicleTypes.includes(vTypeName)) return false;
      }

      // 5. Vehicle
      if (filters.vehicles.length > 0) {
        if (!item.vehicle?.id || !filters.vehicles.includes(item.vehicle.id)) return false;
      }

      // 6. Checklist (Template)
      if (filters.checklists.length > 0) {
        if (!item.template?.id || !filters.checklists.includes(item.template.id)) return false;
      }

      // 7. User Type
      if (filters.userTypes.length > 0) {
        if (!item.user?.role || !filters.userTypes.includes(item.user.role)) return false;
      }

      // 8. User
      if (filters.users.length > 0) {
        if (!item.user?.id || !filters.users.includes(item.user.id)) return false;
      }

      // 9. Platform (Mocked for now as we don't have it)
      // if (filters.platform.length > 0) ...

      return true;
    });
  }, [history, filters]);

  const handleClearFilters = () => {
    setCurrentPage(1);
    setFilters({
      status: [],
      periodType: 'started_at',
      startDate: '',
      endDate: '',
      code: '',
      vehicleTypes: [],
      vehicles: [],
      checklists: [],
      userTypes: [],
      users: [],
      platform: []
    });
  };

  const handleToggleFilter = (name: string) => {
    setActiveFilterDropdown(activeFilterDropdown === name ? null : name);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro de inspeção?')) {
      try {
        const { error } = await supabase.from('checklist_inspections').delete().eq('id', id);
        if (error) throw error;
        setHistory(prev => prev.filter(item => item.id !== id));
        setActiveMenuId(null);
      } catch (err: any) {
        alert('Erro ao excluir: ' + err.message);
      }
    }
  };

  const handleOpenExport = (id: string) => {
    setSelectedInspectionId(id);
    setShowExportModal(true);
    setActiveMenuId(null);
  };

  // Pagination Logic
  const totalItems = filteredHistory.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

  // Selection Logic
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(selectedIds);
      paginatedHistory.forEach(item => newSelected.add(item.id));
      setSelectedIds(newSelected);
    } else {
      const newSelected = new Set(selectedIds);
      paginatedHistory.forEach(item => newSelected.delete(item.id));
      setSelectedIds(newSelected);
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const isAllSelected = paginatedHistory.length > 0 && paginatedHistory.every(item => selectedIds.has(item.id));
  const isIndeterminate = paginatedHistory.some(item => selectedIds.has(item.id)) && !isAllSelected;

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Tem certeza que deseja excluir ${selectedIds.size} registros selecionados?`)) {
      try {
        const { error } = await supabase.from('checklist_inspections').delete().in('id', Array.from(selectedIds));
        if (error) throw error;
        setHistory(prev => prev.filter(item => !selectedIds.has(item.id)));
        setSelectedIds(new Set());
      } catch (err: any) {
        alert('Erro ao excluir registros: ' + err.message);
      }
    }
  };

  const periodTypeOptions = [
    { label: 'Data de início', value: 'started_at' },
    { label: 'Data de conclusão', value: 'completed_at' },
    // Mocked others as requested by UI but not in DB yet
    { label: 'Data de Sincronização', value: 'synced_at' },
    { label: 'Data de Aprovação', value: 'approved_at' },
  ];

  const statusOptions = [
    { id: 'Finalizado', label: 'Finalizado' },
    { id: 'Em Andamento', label: 'Em Andamento' }
  ];

  const platformOptions = [
    { id: 'IOS', label: 'IOS' },
    { id: 'Android', label: 'Android' },
    { id: 'Web', label: 'Web' }
  ];

  return (
    <div className="p-8 space-y-6 animate-in slide-in-from-right duration-300 pb-24" onClick={() => { setActiveMenuId(null); setActiveFilterDropdown(null); setShowPerPageDropdown(false); }}>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Checklists Realizados</h1>
          <p className="text-slate-500">Histórico completo de inspeções de frota.</p>
        </div>
      </header>

      {/* Advanced Filter Panel */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4" onClick={e => e.stopPropagation()}>
        {/* Top Row: Status, Period, Dates */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MultiSelectDropdown
            title="Status"
            options={statusOptions}
            selected={filters.status}
            onChange={s => setFilters({ ...filters, status: s })}
            isOpen={activeFilterDropdown === 'status'}
            onToggle={() => handleToggleFilter('status')}
          />

          <div className="relative">
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Período</label>
            <div className="relative">
              <select
                value={filters.periodType}
                onChange={e => setFilters({ ...filters, periodType: e.target.value })}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
              >
                {periodTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">De:</label>
            <div className="relative">
              <input
                type="date"
                value={filters.startDate}
                onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Até:</label>
            <div className="relative">
              <input
                type="date"
                value={filters.endDate}
                onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>
        </div>

        {/* More Filters Toggle */}
        <div>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-1 text-slate-500 text-xs font-bold uppercase hover:text-blue-900 transition-colors"
          >
            Mais Filtros
            {showAdvancedFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Collapsible Section */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200 pt-2 border-t border-slate-50 mt-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Código da avaliação</label>
              <input
                type="text"
                placeholder="Buscar ID..."
                value={filters.code}
                onChange={e => setFilters({ ...filters, code: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            <MultiSelectDropdown
              title="Tipo de Veículo"
              options={filterOptions.vehicleTypes}
              selected={filters.vehicleTypes}
              onChange={s => setFilters({ ...filters, vehicleTypes: s })}
              isOpen={activeFilterDropdown === 'vehicleTypes'}
              onToggle={() => handleToggleFilter('vehicleTypes')}
            />

            <MultiSelectDropdown
              title="Veículo"
              options={filterOptions.vehicles}
              selected={filters.vehicles}
              onChange={s => setFilters({ ...filters, vehicles: s })}
              isOpen={activeFilterDropdown === 'vehicles'}
              onToggle={() => handleToggleFilter('vehicles')}
              searchPlaceholder="Buscar veículo..."
            />

            <MultiSelectDropdown
              title="Checklist"
              options={filterOptions.checklists}
              selected={filters.checklists}
              onChange={s => setFilters({ ...filters, checklists: s })}
              isOpen={activeFilterDropdown === 'checklists'}
              onToggle={() => handleToggleFilter('checklists')}
            />

            <MultiSelectDropdown
              title="Tipo de Usuário"
              options={filterOptions.userTypes}
              selected={filters.userTypes}
              onChange={s => setFilters({ ...filters, userTypes: s })}
              isOpen={activeFilterDropdown === 'userTypes'}
              onToggle={() => handleToggleFilter('userTypes')}
            />

            <MultiSelectDropdown
              title="Usuário"
              options={filterOptions.users}
              selected={filters.users}
              onChange={s => setFilters({ ...filters, users: s })}
              isOpen={activeFilterDropdown === 'users'}
              onToggle={() => handleToggleFilter('users')}
              searchPlaceholder="Buscar usuário..."
            />

            <MultiSelectDropdown
              title="Plataforma"
              options={platformOptions}
              selected={filters.platform}
              onChange={s => setFilters({ ...filters, platform: s })}
              isOpen={activeFilterDropdown === 'platform'}
              onToggle={() => handleToggleFilter('platform')}
            />
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <div className="flex gap-2">
            <button onClick={handleClearFilters} className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wide transition-colors">
              Limpar
            </button>
            <button onClick={() => fetchHistory()} className="bg-blue-900 text-white px-8 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-800 transition-colors flex items-center gap-2">
              <Filter size={16} />
              FILTRAR
            </button>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible min-h-[400px]">
        <div className="overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                <th className="px-6 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => { if (el) el.indeterminate = isIndeterminate; }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-300 text-blue-900 focus:ring-blue-900 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Tipo Veículo</th>
                <th className="px-6 py-4">Veículo</th>
                <th className="px-6 py-4">Checklist</th>
                <th className="px-6 py-4">Início</th>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-400">
                    <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
                    <p className="text-sm">Carregando histórico...</p>
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-400">
                    <p className="text-sm">Nenhuma inspeção encontrada.</p>
                  </td>
                </tr>
              ) : (
                paginatedHistory.map((row) => (
                  <tr key={row.id} className={`hover:bg-blue-50/30 transition-colors group relative ${selectedIds.has(row.id) ? 'bg-blue-50' : ''}`}>
                    {/* Checkbox */}
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => handleSelectOne(row.id)}
                        className="rounded border-slate-300 text-blue-900 focus:ring-blue-900 cursor-pointer"
                      />
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${row.status === 'completed' || row.status === 'Aprovado' ? 'bg-green-100 text-green-700' :
                        row.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                        {row.status === 'completed' ? 'Finalizado' : row.status}
                      </span>
                    </td>

                    {/* Code */}
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                      #{row.id.slice(0, 8)}
                    </td>

                    {/* Vehicle Type */}
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {row.vehicle?.vehicle_types?.name || row.vehicle?.type || '-'}
                    </td>

                    {/* Vehicle */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{row.vehicle?.plate}</span>
                        <span className="text-[10px] text-slate-400">{row.vehicle?.model}</span>
                      </div>
                    </td>

                    {/* Template */}
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {row.template?.name || 'Modelo Excluído'}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(row.started_at).toLocaleString('pt-BR')}
                    </td>

                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                          {row.user?.full_name?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm text-slate-700">{row.user?.full_name || 'Desconhecido'}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right relative">
                      <div className="flex justify-end gap-2 items-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenExport(row.id); }}
                          className="p-2 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all"
                          title="Exportar"
                        >
                          <FileText size={18} />
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/inspections/${row.id}`); }}
                          className="p-2 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all"
                          title="Ver Detalhes"
                        >
                          <Eye size={18} />
                        </button>

                        {/* Dropdown Trigger */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === row.id ? null : row.id);
                            }}
                            className={`p-2 rounded-lg transition-all ${activeMenuId === row.id ? 'bg-slate-100 text-blue-900' : 'text-slate-400 hover:text-blue-900 hover:bg-blue-50'}`}
                          >
                            <MoreVertical size={18} />
                          </button>

                          {/* Dropdown Menu */}
                          {activeMenuId === row.id && (
                            <div className="absolute right-0 top-10 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 animate-in zoom-in-95 duration-200 header-dropdown">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(row.id);
                                }}
                                className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                              >
                                <Trash2 size={16} /> Excluir Registro
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Action Footer */}
      <div className="fixed bottom-0 left-72 right-0 bg-white border-t border-slate-200 p-4 shadow-lg flex items-center justify-between z-40 transition-transform duration-300">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBulkDelete}
            disabled={selectedIds.size === 0}
            className={`p-2 rounded-lg transition-all ${selectedIds.size > 0 ? 'text-red-600 hover:bg-red-50' : 'text-slate-300 cursor-not-allowed'}`}
            title="Excluir selecionados"
          >
            <Trash2 size={20} />
          </button>
          <button
            className={`p-2 rounded-lg transition-all ${selectedIds.size > 0 ? 'text-blue-900 hover:bg-blue-50' : 'text-slate-300 cursor-not-allowed'}`}
            title="Exportar selecionados"
            disabled={selectedIds.size === 0}
          >
            <Download size={20} />
          </button>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <span className="text-sm text-slate-500 font-medium">
            {selectedIds.size} selecionado(s)
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            <div
              className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 px-2 py-1 rounded transition-colors"
              onClick={(e) => { e.stopPropagation(); setShowPerPageDropdown(!showPerPageDropdown); }}
            >
              <span className="text-sm text-slate-600">Itens por página: <span className="font-bold">{itemsPerPage}</span></span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>

            {/* Dropdown (Opening Upwards) */}
            {showPerPageDropdown && (
              <div className="absolute bottom-full mb-2 left-0 w-full bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                {[20, 50, 100, 200, 500, 1000].map(val => (
                  <button
                    key={val}
                    onClick={(e) => { e.stopPropagation(); setItemsPerPage(val); setCurrentPage(1); setShowPerPageDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${itemsPerPage === val ? 'font-bold text-blue-900 bg-blue-50' : 'text-slate-600'}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-sm text-slate-500">
            {startIndex + 1} - {endIndex} de <span className="font-bold">{totalItems}</span>
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1 text-slate-400 hover:text-blue-900 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1 text-slate-400 hover:text-blue-900 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        inspectionId={selectedInspectionId || ''}
      />
    </div>
  );
};

export default ChecklistHistory;
