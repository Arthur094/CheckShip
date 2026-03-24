
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Download, Trash2, CheckCircle2, Eye, AlertTriangle, FileText, MoreVertical, Calendar, ChevronDown, ChevronUp, X, ChevronLeft, ChevronRight, ClipboardCheck } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { useNavigate } from 'react-router-dom';
import ExportModal from './ExportModal';
import MultiSelectDropdown from '../src/components/common/MultiSelectDropdown';

interface HistoryItem {
  id: string;
  status: string;
  analysis_status?: string;
  analysis_current_step?: number;
  analysis_total_steps?: number;
  started_at: string;
  completed_at: string;
  user: { full_name: string; role: string; id: string } | null;
  vehicle: {
    id: string;
    plate: string;
    model: string;
    type?: string;
    branch_id?: string | null;
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
  branches: { id: string; label: string }[];
}

const ChecklistHistory: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

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
    users: [],
    branches: []
  });

  // Filter State
  const [filters, setFilters] = useState({
    status: [] as string[],   // Empty = all statuses
    periodType: 'started_at',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    code: '',
    vehicleTypes: [] as string[],
    vehicles: [] as string[],
    checklists: [] as string[],
    userTypes: [] as string[],
    users: [] as string[],
    platform: [] as string[],
    branches: [] as string[]
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
  }, []);

  useEffect(() => {
    fetchHistory(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  const fetchFilterData = async () => {
    try {
      const [vTypes, vecs, tpls, usrs, brns] = await Promise.all([
        supabase.from('vehicle_types').select('id, name').order('name'),
        supabase.from('vehicles').select('id, plate, branch_id, active').order('plate'),
        supabase.from('checklist_templates').select('id, name').order('name'),
        supabase.from('profiles').select('id, full_name').order('full_name'),
        supabase.from('branches').select('id, name').eq('active', true).order('name')
      ]);

      const uniqueTpls = new Map();
      (tpls.data || []).forEach(t => {
        if (!uniqueTpls.has(t.name)) uniqueTpls.set(t.name, t.name);
      });

      setFilterOptions(prev => ({
        ...prev,
        vehicleTypes: (vTypes.data || []).map(x => ({ id: x.name, label: x.name })),
        vehicles: (vecs.data || []).map(x => ({ id: x.id, label: x.plate, inactive: !x.active, branch_id: x.branch_id })),
        checklists: Array.from(uniqueTpls.keys()).map(name => ({ id: name, label: name })),
        users: (usrs.data || []).map(x => ({ id: x.id, label: x.full_name })),
        branches: (brns.data || []).map(x => ({ id: x.id, label: x.name })),
      }));
    } catch (e) {
      console.error('Error fetching filter options', e);
    }
  };

  const fetchHistory = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('checklist_inspections')
        .select(`
          id,
          status,
          analysis_status,
          analysis_current_step,
          analysis_total_steps,
          started_at,
          completed_at,
          responses,
          vehicle_id,
          checklist_template_id,
          inspector_id
        `, { count: 'exact' });

      // Apply Period filters
      if (filters.startDate) {
        query = query.gte(filters.periodType || 'started_at', `${filters.startDate}T00:00:00.000Z`);
      }
      if (filters.endDate) {
        query = query.lte(filters.periodType || 'started_at', `${filters.endDate}T23:59:59.999Z`);
      }

      // Apply Status filters
      if (filters.status.length > 0) {
        const statusOrs: string[] = [];
        if (filters.status.includes('Finalizado')) {
            statusOrs.push('and(status.eq.completed,analysis_status.neq.approved,analysis_status.neq.rejected)');
            // Also include if analysis_status is null
            statusOrs.push('and(status.eq.completed,analysis_status.is.null)');
        }
        if (filters.status.includes('Aprovado')) statusOrs.push('and(status.eq.completed,analysis_status.eq.approved)');
        if (filters.status.includes('Reprovado')) {
            statusOrs.push('status.eq.rejected');
            statusOrs.push('analysis_status.eq.rejected');
        }
        if (filters.status.includes('Em Análise')) statusOrs.push('status.eq.pending');
        if (filters.status.includes('Em Andamento')) statusOrs.push('status.eq.in_progress');
        if (statusOrs.length > 0) {
            query = query.or(statusOrs.join(','));
        }
      }

      // Apply Code filter
      if (filters.code) {
        const cleanCode = filters.code.replace(/#/g, '').trim();
        if (cleanCode) {
          (query as any).filter('id::text', 'ilike', `%${cleanCode}%`);
        }
      }

      // Fetch related IDs for nested filters
      // 1. Templates by Name
      if (filters.checklists.length > 0) {
        const { data: tData } = await supabase.from('checklist_templates').select('id').in('name', filters.checklists);
        const tIds = (tData || []).map(t => t.id);
        query = query.in('checklist_template_id', tIds.length > 0 ? tIds : ['none']);
      }

      // 2. Inspector and User Roles
      if (filters.users.length > 0 || filters.userTypes.length > 0) {
        let uQuery = supabase.from('profiles').select('id');
        if (filters.users.length > 0) uQuery = uQuery.in('id', filters.users);
        if (filters.userTypes.length > 0) uQuery = uQuery.in('role', filters.userTypes);
        const { data: uData } = await uQuery;
        const uIds = (uData || []).map(u => u.id);
        query = query.in('inspector_id', uIds.length > 0 ? uIds : ['none']);
      }

      // 3. Vehicles by ID, Type, Branch
      if (filters.vehicles.length > 0 || filters.vehicleTypes.length > 0 || filters.branches.length > 0) {
        let vQuery = supabase.from('vehicles').select('id, vehicle_type_id');
        if (filters.vehicles.length > 0) vQuery = vQuery.in('id', filters.vehicles);
        if (filters.branches.length > 0) vQuery = vQuery.in('branch_id', filters.branches);
        const { data: vData } = await vQuery;
        let validV = vData || [];
        
        if (filters.vehicleTypes.length > 0) {
           const { data: vtData } = await supabase.from('vehicle_types').select('id, name').in('name', filters.vehicleTypes);
           const vtIds = (vtData || []).map(vt => vt.id);
           validV = validV.filter(v => vtIds.includes(v.vehicle_type_id));
        }
        
        const vIds = validV.map(v => v.id);
        query = query.in('vehicle_id', vIds.length > 0 ? vIds : ['none']);
      }

      const { data, error, count } = await query
        .order('started_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Update total count from Supabase exact count
      if (count !== null) setTotalCount(count);

      // Fetch related data separately
      const inspectorIds = [...new Set((data || []).map((d: any) => d.inspector_id).filter(Boolean))];
      const vehicleIds = [...new Set((data || []).map((d: any) => d.vehicle_id).filter(Boolean))];
      const templateIds = [...new Set((data || []).map((d: any) => d.checklist_template_id).filter(Boolean))];

      // Fetch users (profiles)
      const usersMap: Record<string, any> = {};
      if (inspectorIds.length > 0) {
        const { data: usersData } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .in('id', inspectorIds);
        (usersData || []).forEach((u: any) => { usersMap[u.id] = u; });
      }

      // Fetch vehicles
      const vehiclesMap: Record<string, any> = {};
      if (vehicleIds.length > 0) {
        const { data: vehiclesData } = await supabase
          .from('vehicles')
          .select('id, plate, model, vehicle_type_id, branch_id')
          .in('id', vehicleIds);
        (vehiclesData || []).forEach((v: any) => { vehiclesMap[v.id] = v; });
      }

      // Fetch templates
      const templatesMap: Record<string, any> = {};
      if (templateIds.length > 0) {
        const { data: templatesData } = await supabase
          .from('checklist_templates')
          .select('id, name')
          .in('id', templateIds);
        (templatesData || []).forEach((t: any) => { templatesMap[t.id] = t; });
      }

      // Post-process and merge
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
          analysis_status: item.analysis_status,
          analysis_current_step: item.analysis_current_step,
          analysis_total_steps: item.analysis_total_steps,
          started_at: item.started_at,
          completed_at: item.completed_at,
          user: usersMap[item.inspector_id] || null,
          vehicle: vehiclesMap[item.vehicle_id] || null,
          template: templatesMap[item.checklist_template_id] || null,
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

  // Client-side filtering on current page data
  // Note: for full server-side filtering, filters should be applied to the query.
  // Currently we apply client-side filters to the current page's data.
  const filteredHistory = useMemo(() => {
    return history;
  }, [history]);

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
      platform: [],
      branches: []
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

  // Pagination Logic (server-side — totalCount comes from Supabase)
  const totalItems = totalCount;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedHistory = filteredHistory;

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
    { id: 'Em Andamento', label: 'Em Andamento' },
    { id: 'Em Análise', label: 'Em Análise' },
    { id: 'Aprovado', label: 'Aprovado' },
    { id: 'Reprovado', label: 'Reprovado' }
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
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase block">Status</label>
            <MultiSelectDropdown
              title="Status"
              options={statusOptions}
              selected={filters.status}
              onChange={s => setFilters({ ...filters, status: s })}
              isOpen={activeFilterDropdown === 'status'}
              onToggle={() => handleToggleFilter('status')}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase block">Período</label>
            <div className="relative">
              <select
                value={filters.periodType}
                onChange={e => setFilters({ ...filters, periodType: e.target.value })}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
              >
                {periodTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase block">De:</label>
            <div className="relative">
              <input
                type="date"
                value={filters.startDate}
                onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase block">Até:</label>
            <div className="relative">
              <input
                type="date"
                value={filters.endDate}
                onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
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
              <label className="text-[10px] font-bold text-slate-500 uppercase block">Código da avaliação</label>
              <input
                type="text"
                placeholder="Buscar ID..."
                value={filters.code}
                onChange={e => setFilters({ ...filters, code: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">Tipo de Operação</label>
              <MultiSelectDropdown
                title="Tipos"
                options={filterOptions.vehicleTypes}
                selected={filters.vehicleTypes}
                onChange={s => setFilters({ ...filters, vehicleTypes: s })}
                isOpen={activeFilterDropdown === 'vehicleTypes'}
                onToggle={() => handleToggleFilter('vehicleTypes')}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">Veículo</label>
              <MultiSelectDropdown
                title="Veículos"
                options={filterOptions.vehicles}
                selected={filters.vehicles}
                onChange={s => setFilters({ ...filters, vehicles: s })}
                isOpen={activeFilterDropdown === 'vehicles'}
                onToggle={() => handleToggleFilter('vehicles')}
                searchPlaceholder="Buscar veículo..."
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">Checklist</label>
              <MultiSelectDropdown
                title="Checklists"
                options={filterOptions.checklists}
                selected={filters.checklists}
                onChange={s => setFilters({ ...filters, checklists: s })}
                isOpen={activeFilterDropdown === 'checklists'}
                onToggle={() => handleToggleFilter('checklists')}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">Tipo de Usuário</label>
              <MultiSelectDropdown
                title="Tipos"
                options={filterOptions.userTypes}
                selected={filters.userTypes}
                onChange={s => setFilters({ ...filters, userTypes: s })}
                isOpen={activeFilterDropdown === 'userTypes'}
                onToggle={() => handleToggleFilter('userTypes')}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">Usuário</label>
              <MultiSelectDropdown
                title="Usuários"
                options={filterOptions.users}
                selected={filters.users}
                onChange={s => setFilters({ ...filters, users: s })}
                isOpen={activeFilterDropdown === 'users'}
                onToggle={() => handleToggleFilter('users')}
                searchPlaceholder="Buscar usuário..."
              />
            </div>



            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">Filial</label>
              <MultiSelectDropdown
                title="Filiais"
                options={filterOptions.branches}
                selected={filters.branches}
                onChange={s => setFilters({ ...filters, branches: s })}
                isOpen={activeFilterDropdown === 'branches'}
                onToggle={() => handleToggleFilter('branches')}
                searchPlaceholder="Buscar filial..."
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <div className="flex gap-2">
            <button onClick={handleClearFilters} className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wide transition-colors">
              Limpar
            </button>
            <button onClick={() => { setCurrentPage(1); fetchHistory(1, itemsPerPage); }} className="bg-blue-900 text-white px-8 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-800 transition-colors flex items-center gap-2">
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
                <th className="px-6 py-4">Tipo Operação</th>
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
                      {(() => {
                        let badgeClass = 'bg-slate-100 text-slate-600';
                        let badgeText = row.status;

                        if (row.status === 'completed' && row.analysis_status === 'approved') {
                          badgeClass = 'bg-green-100 text-green-700';
                          badgeText = 'Aprovado';
                        } else if (row.status === 'completed') {
                          badgeClass = 'bg-green-100 text-green-700';
                          badgeText = 'Finalizado';
                        } else if (row.status === 'rejected') {
                          badgeClass = 'bg-red-100 text-red-700';
                          badgeText = 'Reprovado';
                        } else if (row.status === 'pending') {
                          badgeClass = 'bg-amber-100 text-amber-700';
                          badgeText = `Em Análise (${row.analysis_current_step || 0}/${row.analysis_total_steps || 1})`;
                        } else if (row.status === 'in_progress') {
                          badgeClass = 'bg-blue-100 text-blue-700';
                          badgeText = 'Em Andamento';
                        }

                        return (
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${badgeClass}`}>
                            {badgeText}
                          </span>
                        );
                      })()}
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
                              {/* Analisar - only show for pending status */}
                              {row.status === 'pending' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                    navigate(`/inspections/${row.id}?mode=analysis`);
                                  }}
                                  className="w-full text-left px-4 py-3 text-xs font-bold text-amber-600 hover:bg-amber-50 flex items-center gap-2 transition-colors"
                                >
                                  <ClipboardCheck size={16} /> Analisar
                                </button>
                              )}
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
                {[20, 50, 100, 200, 500].map(val => (
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
