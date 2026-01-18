
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Pencil,
    Trash2,
    ToggleLeft,
    ToggleRight,
    X,
    Cloud
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import MultiSelectDropdown from '../../components/common/MultiSelectDropdown';

interface VehicleType {
    id: string;
    name: string;
    description: string;
    active: boolean; // New column
    // Joined data for filtering
    vehicles?: { id: string; plate: string; }[];
    vehicle_type_checklist_assignments?: {
        checklist_templates?: { id: string; name: string; };
    }[];
}

interface Option {
    id: string;
    label: string;
}

interface VehicleTypeListProps {
    onNew: () => void;
    onEdit: (vehicleType: VehicleType) => void;
}

interface Filters {
    vehicles: string[];
    checklists: string[];
    active: string[];
}

const VehicleTypeList: React.FC<VehicleTypeListProps> = ({ onNew, onEdit }) => {
    // Data States
    const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
    const [allVehicles, setAllVehicles] = useState<Option[]>([]);
    const [allChecklists, setAllChecklists] = useState<Option[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [filters, setFilters] = useState<Filters>({
        vehicles: [],
        checklists: [],
        active: []
    });

    // Selection States
    const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
    const [showSelectAll, setShowSelectAll] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Data Fetching
    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch Types with relationships
            const { data: typesData, error: typesError } = await supabase
                .from('vehicle_types')
                .select(`
                    *,
                    vehicles (id, plate),
                    vehicle_type_checklist_assignments (
                        checklist_templates (id, name)
                    )
                `)
                .order('name');

            if (typesError) throw typesError;

            // Normalize types data
            const normalizedTypes = (typesData || []).map((t: any) => ({
                ...t,
                // Ensure active defaults to true if null (migration default)
                active: t.active ?? true
            }));

            setVehicleTypes(normalizedTypes);

            // Extract unique Vehicles and Checklists for filter options
            const vehiclesMap = new Map<string, string>();
            const checklistsMap = new Map<string, string>();

            normalizedTypes.forEach((type: any) => {
                type.vehicles?.forEach((v: any) => vehiclesMap.set(v.id, v.plate));
                type.vehicle_type_checklist_assignments?.forEach((a: any) => {
                    if (a.checklist_templates) {
                        checklistsMap.set(a.checklist_templates.id, a.checklist_templates.name);
                    }
                });
            });

            setAllVehicles(Array.from(vehiclesMap.entries()).map(([id, label]) => ({ id, label })));
            setAllChecklists(Array.from(checklistsMap.entries()).map(([id, label]) => ({ id, label })));

        } catch (error: any) {
            console.error('Error fetching data:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Filter Logic
    const filteredTypes = useMemo(() => {
        return vehicleTypes.filter(t => {
            // Search
            const matchesSearch =
                t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));

            // Vehicle Filter (Show type if it contains ANY of the selected vehicles)
            // If no vehicle selected, show all.
            const matchesVehicles = filters.vehicles.length === 0 ||
                (t.vehicles && t.vehicles.some(v => filters.vehicles.includes(v.id)));

            // Checklist Filter (Show type if it uses ANY of the selected checklists)
            const matchesChecklists = filters.checklists.length === 0 ||
                (t.vehicle_type_checklist_assignments && t.vehicle_type_checklist_assignments.some(a =>
                    a.checklist_templates && filters.checklists.includes(a.checklist_templates.id)
                ));

            // Active Filter
            const matchesActive = filters.active.length === 0 ||
                (filters.active.includes('Ativo') && t.active) ||
                (filters.active.includes('Inativo') && !t.active);

            return matchesSearch && matchesVehicles && matchesChecklists && matchesActive;
        });
    }, [vehicleTypes, searchTerm, filters]);

    const hasActiveFilters = filters.vehicles.length > 0 || filters.checklists.length > 0 || filters.active.length > 0;

    // Handlers
    const handleFilterToggle = (filterName: string) => {
        setActiveFilter(activeFilter === filterName ? null : filterName);
    };

    const handleClearFilters = () => {
        setFilters({
            vehicles: [],
            checklists: [],
            active: []
        });
    };

    const toggleMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === id ? null : id);
    };

    // Selection Handlers
    const handleSelectType = (id: string) => {
        const newSelection = new Set(selectedTypes);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedTypes(newSelection);
    };

    const handleSelectAll = () => {
        const allIds = filteredTypes.map(t => t.id);
        setSelectedTypes(new Set(allIds));
        setShowSelectAll(false);
    };

    const handleDeselectAll = () => {
        setSelectedTypes(new Set());
    };

    // Bulk Actions
    const handleBulkDelete = async () => {
        if (selectedTypes.size === 0) return;
        if (!confirm(`Tem certeza que deseja excluir ${selectedTypes.size} tipos de veículo? Veículos associados podem ficar sem classificação.`)) return;

        try {
            setLoading(true);
            const { error } = await supabase
                .from('vehicle_types')
                .delete()
                .in('id', Array.from(selectedTypes));

            if (error) throw error;

            alert(`${selectedTypes.size} tipos excluídos com sucesso!`);
            setSelectedTypes(new Set());
            fetchData();
        } catch (error: any) {
            alert('Erro ao excluir: ' + error.message);
            setLoading(false);
        }
    };

    const handleBulkToggleActive = async () => {
        if (selectedTypes.size === 0) return;

        const selectedTypesData = vehicleTypes.filter(t => selectedTypes.has(t.id));
        const allActive = selectedTypesData.every(t => t.active);
        const action = allActive ? 'desativar' : 'ativar';
        const newStatus = !allActive;

        if (!confirm(`Tem certeza que deseja ${action} ${selectedTypes.size} tipos de veículo?`)) return;

        try {
            setLoading(true);
            const { error } = await supabase
                .from('vehicle_types')
                .update({ active: newStatus })
                .in('id', Array.from(selectedTypes));

            if (error) throw error;

            alert(`Tipos ${action === 'ativar' ? 'ativados' : 'desativados'} com sucesso!`);
            setSelectedTypes(new Set());
            fetchData();
        } catch (error: any) {
            alert(`Erro ao ${action}: ` + error.message);
            setLoading(false);
        }
    };

    const handleBulkExport = () => {
        if (selectedTypes.size === 0) return;
        if (!confirm(`Exportar ${selectedTypes.size} tipos selecionados?`)) return;

        try {
            const selectedData = vehicleTypes.filter(t => selectedTypes.has(t.id));

            const csvContent = [
                ['Nome', 'Descrição', 'Veículos Ativos', 'Checklists Associados', 'Status'],
                ...selectedData.map(t => [
                    t.name,
                    t.description || '',
                    t.vehicles?.length || 0,
                    t.vehicle_type_checklist_assignments?.length || 0,
                    t.active ? 'Ativo' : 'Inativo'
                ])
            ].map(e => e.join(',')).join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `tipos_veiculos_export_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        } catch (error: any) {
            alert('Erro ao exportar: ' + error.message);
        }
    };

    // Single Actions
    const handleDeleteSingle = async (type: VehicleType) => {
        if (confirm(`Tem certeza que deseja excluir o tipo "${type.name}"?`)) {
            try {
                setLoading(true);
                const { error } = await supabase
                    .from('vehicle_types')
                    .delete()
                    .eq('id', type.id);

                if (error) throw error;
                fetchData();
            } catch (error: any) {
                alert('Erro ao excluir: ' + error.message);
                setLoading(false);
            }
        }
    };

    const handleToggleActiveSingle = async (type: VehicleType) => {
        const action = type.active ? 'desativar' : 'ativar';
        if (confirm(`Tem certeza que deseja ${action} o tipo "${type.name}"?`)) {
            try {
                setLoading(true);
                const { error } = await supabase
                    .from('vehicle_types')
                    .update({ active: !type.active })
                    .eq('id', type.id);

                if (error) throw error;
                fetchData();
            } catch (error: any) {
                alert(`Erro ao ${action}: ` + error.message);
                setLoading(false);
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            {/* Header */}
            <div className="bg-white px-8 py-5 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-slate-800">Tipos de Veículo</h1>
                    <p className="text-sm text-slate-500 hidden md:block">Categorias e Classificações</p>
                </div>
                <button
                    onClick={onNew}
                    className="bg-blue-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-800 transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    NOVO
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white px-8 py-6 border-b border-slate-200">
                <div className="relative flex items-center">
                    <Search size={20} className="absolute left-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, descrição..."
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <MultiSelectDropdown
                            title="Veículos Associados"
                            options={allVehicles}
                            selected={filters.vehicles}
                            onChange={(selected) => setFilters(prev => ({ ...prev, vehicles: selected }))}
                            searchPlaceholder="Buscar veículo..."
                            isOpen={activeFilter === 'vehicles'}
                            onToggle={() => handleFilterToggle('vehicles')}
                        />

                        <MultiSelectDropdown
                            title="Checklists Associados"
                            options={allChecklists}
                            selected={filters.checklists}
                            onChange={(selected) => setFilters(prev => ({ ...prev, checklists: selected }))}
                            searchPlaceholder="Buscar checklist..."
                            isOpen={activeFilter === 'checklists'}
                            onToggle={() => handleFilterToggle('checklists')}
                        />

                        <MultiSelectDropdown
                            title="Status (Ativo)"
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

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="bg-slate-100 px-8 py-3 border-b border-slate-200 flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-slate-600">Filtros ativos:</span>
                    {filters.vehicles.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs">
                            Veículos ({filters.vehicles.length})
                            <button onClick={() => setFilters(prev => ({ ...prev, vehicles: [] }))} className="hover:text-red-600">
                                <X size={14} />
                            </button>
                        </span>
                    )}
                    {filters.checklists.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs">
                            Checklists ({filters.checklists.length})
                            <button onClick={() => setFilters(prev => ({ ...prev, checklists: [] }))} className="hover:text-red-600">
                                <X size={14} />
                            </button>
                        </span>
                    )}
                    {filters.active.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs">
                            Ativo ({filters.active.length})
                            <button onClick={() => setFilters(prev => ({ ...prev, active: [] }))} className="hover:text-red-600">
                                <X size={14} />
                            </button>
                        </span>
                    )}
                </div>
            )}

            {/* List content */}
            <div className="flex-1 overflow-x-auto p-8">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden min-w-[800px] mb-20">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                        <div
                            className="col-span-12 md:col-span-6 flex items-center gap-2 relative"
                            onMouseEnter={() => setShowSelectAll(true)}
                            onMouseLeave={() => setShowSelectAll(false)}
                        >
                            {showSelectAll && selectedTypes.size === 0 && (
                                <button
                                    onClick={handleSelectAll}
                                    className="absolute -left-1 px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded shadow-sm hover:bg-blue-700 transition-all z-10 w-max"
                                >
                                    TODOS
                                </button>
                            )}
                            {selectedTypes.size > 0 && (
                                <button
                                    onClick={handleDeselectAll}
                                    className="text-blue-600 hover:text-blue-800 mr-2"
                                    title="Desmarcar todos"
                                >
                                    <X size={16} />
                                </button>
                            )}
                            {!showSelectAll && selectedTypes.size === 0 && (
                                <span className="text-slate-400 px-1 mr-2">-</span>
                            )}
                            Nome
                        </div>
                        <div className="hidden md:block col-span-4">Descrição</div>
                        <div className="hidden md:block col-span-2 text-right">Status</div>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y divide-slate-100">
                        {loading ? (
                            <div className="p-12 text-center text-slate-400">
                                <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
                                <p className="text-sm">Carregando tipos de veículos...</p>
                            </div>
                        ) : filteredTypes.length === 0 ? (
                            <div className="p-12 text-center text-slate-400">
                                <p className="text-sm">Nenhum tipo de veículo encontrado.</p>
                            </div>
                        ) : (
                            filteredTypes.map((type) => (
                                <div
                                    key={type.id}
                                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors group relative ${selectedTypes.has(type.id) ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                                >
                                    <div className="col-span-12 md:col-span-6 flex items-center gap-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedTypes.has(type.id)}
                                            onChange={() => handleSelectType(type.id)}
                                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer min-w-[16px]"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-700">{type.name}</span>
                                            {/* Mobile Description */}
                                            {type.description && (
                                                <span className="md:hidden text-xs text-slate-400 truncate max-w-[200px]">{type.description}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="hidden md:block col-span-4 text-sm text-slate-600 truncate">
                                        {type.description}
                                    </div>

                                    <div className="hidden md:flex col-span-2 items-center justify-end gap-3 text-right">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${type.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {type.active ? 'Ativo' : 'Inativo'}
                                        </span>

                                        {/* Hover Actions */}
                                        <div className={`flex items-center justify-end gap-1 ${activeMenu === type.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                            <button
                                                onClick={() => onEdit(type)}
                                                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-blue-900 transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => toggleMenu(e, type.id)}
                                                    className={`p-2 rounded-full transition-colors ${activeMenu === type.id ? 'bg-slate-200 text-slate-700' : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'}`}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {activeMenu === type.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                                                        <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                                                            <button
                                                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveMenu(null);
                                                                    handleToggleActiveSingle(type);
                                                                }}
                                                            >
                                                                {type.active ? (
                                                                    <>
                                                                        <ToggleLeft size={16} />
                                                                        Desativar
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ToggleRight size={16} />
                                                                        Ativar
                                                                    </>
                                                                )}
                                                            </button>
                                                            <div className="border-t border-slate-100" />
                                                            <button
                                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveMenu(null);
                                                                    handleDeleteSingle(type);
                                                                }}
                                                            >
                                                                <Trash2 size={16} />
                                                                Excluir
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Bar for Bulk Actions (Matches FleetList pattern) */}
            {selectedTypes.size > 0 && (
                <div className="sticky bottom-0 bg-white border-t border-slate-200 px-8 py-4 flex items-center justify-between shadow-lg z-30">
                    <div className="flex items-center gap-4">
                        {/* Delete Button */}
                        <button
                            onClick={handleBulkDelete}
                            className="p-2 hover:bg-red-50 rounded-lg text-slate-600 hover:text-red-600 transition-colors"
                            title="Excluir selecionados"
                        >
                            <Trash2 size={20} />
                        </button>

                        {/* Toggle Active/Inactive Button */}
                        <button
                            onClick={handleBulkToggleActive}
                            className="p-2 hover:bg-blue-50 rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
                            title="Ativar/Inativar selecionados"
                        >
                            {vehicleTypes.filter(t => selectedTypes.has(t.id)).every(t => t.active) ? (
                                <ToggleRight size={20} />
                            ) : (
                                <ToggleLeft size={20} />
                            )}
                        </button>

                        {/* Export Button */}
                        <button
                            onClick={handleBulkExport}
                            className="p-2 hover:bg-green-50 rounded-lg text-slate-600 hover:text-green-600 transition-colors"
                            title="Exportar selecionados"
                        >
                            <Cloud size={20} />
                        </button>
                    </div>

                    {/* Counter */}
                    <div className="text-sm text-slate-600 font-medium">
                        {selectedTypes.size} de {filteredTypes.length} selecionado{selectedTypes.size !== 1 ? 's' : ''}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleTypeList;
