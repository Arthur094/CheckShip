
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  ClipboardList,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Pencil
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ChecklistTemplate } from '../../../types';
import MultiSelectDropdown from '../../components/common/MultiSelectDropdown';

interface ChecklistListProps {
  onNew: () => void;
  onEdit: (template: ChecklistTemplate) => void;
}

interface Option {
  id: string;
  label: string;
}

interface Filters {
  subjects: string[];
  users: string[];
  vehicleTypes: string[];
  active: string[];
}

// Extended interface for the template with local active status
// Fix: Omit both fields that might conflict or use Partial to be safe, then redefine
interface ExtendedTemplate extends Omit<ChecklistTemplate, 'target_vehicle_types' | 'assigned_user_ids'> {
  active: boolean; // From new column
  assigned_user_ids?: string[];
  target_vehicle_types?: string[];
}

const ChecklistList: React.FC<ChecklistListProps> = ({ onNew, onEdit }) => {
  // Data States
  const [templates, setTemplates] = useState<ExtendedTemplate[]>([]);
  const [allSubjects, setAllSubjects] = useState<Option[]>([]);
  const [allUsers, setAllUsers] = useState<Option[]>([]);
  const [allVehicleTypes, setAllVehicleTypes] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    subjects: [],
    users: [],
    vehicleTypes: [],
    active: []
  });

  // Selection States
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showSelectAll, setShowSelectAll] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch Templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('checklist_templates')
        .select('*')
        .order('updated_at', { ascending: false });

      if (templatesError) throw templatesError;

      // Fetch Profiles (for User filter)
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name');

      // Fetch Vehicle Types (for Vehicle Type filter)
      const { data: vTypesData } = await supabase
        .from('vehicle_types')
        .select('id, name');

      // Process Data
      const normalizedTemplates: ExtendedTemplate[] = (templatesData || []).map(t => ({
        ...t,
        active: t.active ?? true // Default to true if null
      }));

      setTemplates(normalizedTemplates);

      // Build Filter Options
      // 1. Subjects (Types)
      const subjects = Array.from(new Set(normalizedTemplates.map(t => t.subject).filter(Boolean))) as string[];
      setAllSubjects(subjects.map(s => ({ id: s, label: s })));

      // 2. Users
      const userMap = new Map((profilesData || []).map(p => [p.id, p.full_name]));
      setAllUsers(Array.from(userMap.entries()).map(([id, label]) => ({ id, label })));

      // 3. Vehicle Types
      const vTypeMap = new Map((vTypesData || []).map(v => [v.id, v.name]));
      setAllVehicleTypes(Array.from(vTypeMap.entries()).map(([id, label]) => ({ id, label })));

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter Logic
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      // Search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        t.name.toLowerCase().includes(searchLower) ||
        (t.subject && t.subject.toLowerCase().includes(searchLower)) ||
        t.id.toLowerCase().includes(searchLower);

      // Subject Filter
      const matchesSubject = filters.subjects.length === 0 ||
        (t.subject && filters.subjects.includes(t.subject));

      // User Filter (Check if ANY selected user is in assigned_user_ids)
      const matchesUser = filters.users.length === 0 ||
        (t.assigned_user_ids && t.assigned_user_ids.some(uid => filters.users.includes(uid)));

      // Vehicle Type Filter (Check if ANY selected type is in target_vehicle_types)
      const matchesVehicleType = filters.vehicleTypes.length === 0 ||
        (t.target_vehicle_types && t.target_vehicle_types.some(vid => filters.vehicleTypes.includes(vid)));

      // Active Filter
      const matchesActive = filters.active.length === 0 ||
        (filters.active.includes('Ativo') && t.active) ||
        (filters.active.includes('Inativo') && !t.active);

      return matchesSearch && matchesSubject && matchesUser && matchesVehicleType && matchesActive;
    });
  }, [templates, searchTerm, filters]);

  const hasActiveFilters =
    filters.subjects.length > 0 ||
    filters.users.length > 0 ||
    filters.vehicleTypes.length > 0 ||
    filters.active.length > 0;

  // Handlers
  const handleFilterToggle = (filterName: string) => {
    setActiveFilter(activeFilter === filterName ? null : filterName);
  };

  const handleClearFilters = () => {
    setFilters({ subjects: [], users: [], vehicleTypes: [], active: [] });
  };

  // Selection Handlers
  const handleSelect = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedIds(newSelection);
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(filteredTemplates.map(t => t.id)));
    setShowSelectAll(false);
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  // Action Handlers
  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este checklist?')) return;
    try {
      const { error } = await supabase.from('checklist_templates').delete().eq('id', id);
      if (error) throw error;
      setTemplates(prev => prev.filter(t => t.id !== id));
      setActiveMenuId(null);
    } catch (error: any) {
      alert('Erro ao excluir: ' + error.message);
    }
  };

  const handleToggleActive = async (template: ExtendedTemplate) => {
    const action = template.active ? 'desativar' : 'ativar';
    if (!window.confirm(`Tem certeza que deseja ${action} este checklist?`)) return;
    try {
      const { error } = await supabase
        .from('checklist_templates')
        .update({ active: !template.active })
        .eq('id', template.id);
      if (error) throw error;
      fetchData(); // Refresh to ensure sync
      setActiveMenuId(null);
    } catch (error: any) {
      alert(`Erro ao ${action}: ` + error.message);
    }
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${selectedIds.size} checklists?`)) return;
    try {
      setIsLoading(true);
      const { error } = await supabase.from('checklist_templates').delete().in('id', Array.from(selectedIds));
      if (error) throw error;
      alert(`${selectedIds.size} checklists excluídos!`);
      setSelectedIds(new Set());
      fetchData();
    } catch (error: any) {
      alert('Erro ao excluir: ' + error.message);
      setIsLoading(false);
    }
  };

  const handleBulkToggleActive = async () => {
    if (selectedIds.size === 0) return;
    const selectedItems = templates.filter(t => selectedIds.has(t.id));
    const allActive = selectedItems.every(t => t.active);
    const action = allActive ? 'desativar' : 'ativar';

    if (!confirm(`Tem certeza que deseja ${action} ${selectedIds.size} checklists?`)) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('checklist_templates')
        .update({ active: !allActive })
        .in('id', Array.from(selectedIds));
      if (error) throw error;
      alert(`Checklists ${action === 'ativar' ? 'ativados' : 'desativados'}!`);
      setSelectedIds(new Set());
      fetchData();
    } catch (error: any) {
      alert(`Erro ao ${action}: ` + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <header className="bg-white px-8 py-5 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-slate-800">Checklists</h1>
        <button
          onClick={onNew}
          className="bg-blue-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus size={18} />
          NOVO
        </button>
      </header>

      {/* Search Bar */}
      <div className="bg-white px-8 py-6 border-b border-slate-200">
        <div className="relative flex items-center">
          <Search size={20} className="absolute left-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, assunto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder:text-slate-400 bg-slate-50"
          />
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`absolute right-4 transition-colors ${showFilterPanel || hasActiveFilters ? 'text-blue-900' : 'text-slate-400 hover:text-blue-900'}`}
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="bg-white px-8 py-6 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <MultiSelectDropdown
              title="Tipo de Checklist"
              options={allSubjects}
              selected={filters.subjects}
              onChange={(selected) => setFilters(prev => ({ ...prev, subjects: selected }))}
              isOpen={activeFilter === 'subjects'}
              onToggle={() => handleFilterToggle('subjects')}
            />
            <MultiSelectDropdown
              title="Usuário"
              options={allUsers}
              selected={filters.users}
              onChange={(selected) => setFilters(prev => ({ ...prev, users: selected }))}
              searchPlaceholder="Buscar usuário..."
              isOpen={activeFilter === 'users'}
              onToggle={() => handleFilterToggle('users')}
            />
            <MultiSelectDropdown
              title="Tipos de Veículo"
              options={allVehicleTypes}
              selected={filters.vehicleTypes}
              onChange={(selected) => setFilters(prev => ({ ...prev, vehicleTypes: selected }))}
              searchPlaceholder="Buscar unidade..."
              isOpen={activeFilter === 'vehicleTypes'}
              onToggle={() => handleFilterToggle('vehicleTypes')}
            />
            <MultiSelectDropdown
              title="Ativo"
              options={[{ id: 'Ativo', label: 'Sim' }, { id: 'Inativo', label: 'Não' }]}
              selected={filters.active}
              onChange={(selected) => setFilters(prev => ({ ...prev, active: selected }))}
              isOpen={activeFilter === 'active'}
              onToggle={() => handleFilterToggle('active')}
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Limpar
            </button>
            <button
              onClick={() => setShowFilterPanel(false)}
              className="px-6 py-2 bg-blue-900 text-white text-sm font-bold rounded-lg hover:bg-blue-800 transition-colors"
            >
              Filtrar
            </button>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="bg-slate-100 px-8 py-3 border-b border-slate-200 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-600">Filtros ativos:</span>
          {(Object.entries(filters) as [keyof Filters, string[]][]).map(([key, value]) => {
            if (value.length === 0) return null;
            const label = key === 'subjects' ? 'Tipo' : key === 'users' ? 'Usuário' : key === 'vehicleTypes' ? 'Unidade' : 'Ativo';
            return (
              <span key={key} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs">
                {label} ({value.length})
                <button onClick={() => setFilters(prev => ({ ...prev, [key]: [] }))} className="hover:text-red-600">
                  <X size={14} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Checklist Table */}
      <div className="flex-1 overflow-x-auto p-8 mb-20">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
              <p className="text-sm">Carregando checklists...</p>
            </div>
          ) : filteredTemplates.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <tr>
                  <th className="px-6 py-4 w-10">
                    {/* Select All Checkbox logic if needed, simplifed to just header here, but implementing hover select all below */}
                    <input type="checkbox" className="rounded hidden" />
                  </th>
                  <th className="px-6 py-4 relative group/header">
                    <span className="group-hover/header:hidden">Nome</span>
                    {/* Hover Select All Logic */}
                    <div
                      className="hidden group-hover/header:flex absolute left-6 top-1/2 -translate-y-1/2 items-center gap-2"
                      onMouseEnter={() => setShowSelectAll(true)}
                      onMouseLeave={() => setShowSelectAll(false)}
                    >
                      {showSelectAll && selectedIds.size < filteredTemplates.length && (
                        <button
                          onClick={handleSelectAll}
                          className="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded shadow-sm hover:bg-blue-700 transition-all whitespace-nowrap"
                        >
                          TODOS
                        </button>
                      )}
                      {selectedIds.size > 0 && (
                        <button
                          onClick={handleDeselectAll}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-blue-100"
                        >
                          <X size={14} />
                          <span className="text-[10px] font-bold">LIMPAR</span>
                        </button>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4">Assunto</th>
                  <th className="px-6 py-4 text-right">Status</th>
                  <th className="px-6 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTemplates.map((template) => (
                  <tr
                    key={template.id}
                    className={`transition-colors cursor-pointer group ${selectedIds.has(template.id) ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                    onClick={() => {
                      // Select row logic or Edit logic? Usually row click is edit, checkbox is select.
                      // Let's make row click edit
                      onEdit(template);
                    }}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                        checked={selectedIds.has(template.id)}
                        onChange={() => handleSelect(template.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 group-hover:text-blue-900">{template.name}</span>
                        <span className="text-[10px] text-slate-400">{template.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{template.subject || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${template.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {template.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 relative" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          className={`p-1 rounded-md transition-all ${activeMenuId === template.id ? 'bg-slate-100 text-blue-900' : 'hover:bg-slate-100'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === template.id ? null : template.id);
                          }}
                        >
                          <MoreVertical size={16} />
                        </button>
                        {activeMenuId === template.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                            <div ref={menuRef} className="absolute right-8 top-0 bg-white border border-slate-200 rounded-lg shadow-xl py-2 w-40 z-20 animate-in fade-in zoom-in-95 duration-200">
                              <button
                                onClick={() => { setActiveMenuId(null); onEdit(template); }}
                                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Pencil size={14} />
                                Editar
                              </button>
                              <button
                                onClick={() => { setActiveMenuId(null); handleToggleActive(template); }}
                                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                {template.active ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                                {template.active ? 'Desativar' : 'Ativar'}
                              </button>
                              <div className="border-t border-slate-100 my-1" />
                              <button
                                onClick={() => { setActiveMenuId(null); handleDelete(template.id); }}
                                className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 size={14} />
                                Excluir
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <ClipboardList size={32} />
              </div>
              <div>
                <p className="text-slate-800 font-bold">Nenhum checklist encontrado</p>
                <p className="text-slate-500 text-sm">Tente ajustar os filtros ou crie um novo.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar for Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-8 py-4 flex items-center justify-between shadow-lg z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBulkDelete}
              className="p-2 hover:bg-red-50 rounded-lg text-slate-600 hover:text-red-600 transition-colors"
              title="Excluir selecionados"
            >
              <Trash2 size={20} />
            </button>

            <button
              onClick={handleBulkToggleActive}
              className="p-2 hover:bg-blue-50 rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
              title="Ativar/Inativar selecionados"
            >
              {templates.filter(t => selectedIds.has(t.id)).every(t => t.active) ? (
                <ToggleRight size={20} />
              ) : (
                <ToggleLeft size={20} />
              )}
            </button>

            {/* Counter */}
            <div className="pl-4 border-l border-slate-200">
              <span className="text-slate-400 text-xs">Ações em massa</span>
            </div>
          </div>

          <div className="text-sm text-slate-600 font-medium">
            {selectedIds.size} de {filteredTemplates.length} selecionado{selectedIds.size !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChecklistList;
