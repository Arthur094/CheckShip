
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

interface FleetVehicle {
    id: string;
    plate: string;
    model: string;
    vehicle_types?: {
        name: string;
    } | null;
    current_km?: number;
    renavam?: string;
    crlv_expiry?: string;
    active: boolean;
    // New fields implied by handleBulkExport
    brand?: string;
    year?: number;
    color?: string;
}

interface VehicleType {
    id: string;
    name: string;
}

interface FleetListProps {
    onNew: () => void;
    onEdit: (vehicle: any) => void;
}

interface Filters {
    vehicleTypes: string[];
    active: string[];
}

const FleetList: React.FC<FleetListProps> = ({ onNew, onEdit }) => {
    // Data States
    const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
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
    const [showSelectAll, setShowSelectAll] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

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
                    vehicle_types (
                        name
                    )
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
    const filteredVehicles = useMemo(() => {
        return vehicles.filter(v => {
            // Search
            const matchesSearch =
                v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.model.toLowerCase().includes(searchTerm.toLowerCase());

            // Vehicle Type Filter
            const matchesType = filters.vehicleTypes.length === 0 ||
                (v.vehicle_types?.name && filters.vehicleTypes.includes(v.vehicle_types.name));

            // Active Filter
            const matchesActive = filters.active.length === 0 ||
                (filters.active.includes('Ativo') && v.active) ||
                (filters.active.includes('Inativo') && !v.active);

            return matchesSearch && matchesType && matchesActive;
        });
    }, [vehicles, searchTerm, filters]);

    const hasActiveFilters = filters.vehicleTypes.length > 0 || filters.active.length > 0;

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

    const toggleMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === id ? null : id);
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
        const allIds = filteredVehicles.map(v => v.id);
        setSelectedVehicles(new Set(allIds));
        setShowSelectAll(false);
    };

    const handleDeselectAll = () => {
        setSelectedVehicles(new Set());
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

            alert(`${selectedVehicles.size} veículos excluídos com sucesso!`);
            setSelectedVehicles(new Set());
            fetchVehicles();
        } catch (error: any) {
            alert('Erro ao excluir: ' + error.message);
            setLoading(false);
        }
    };

    const handleBulkToggleActive = async () => {
        if (selectedVehicles.size === 0) return;

        const selectedVehiclesData = vehicles.filter(v => selectedVehicles.has(v.id));
        const allActive = selectedVehiclesData.every(v => v.active);
        const action = allActive ? 'desativar' : 'ativar';
        const newStatus = !allActive;

        if (!confirm(`Tem certeza que deseja ${action} ${selectedVehicles.size} veículos?`)) return;

        try {
            setLoading(true);
            const { error } = await supabase
                .from('vehicles')
                .update({ active: newStatus })
                .in('id', Array.from(selectedVehicles));

            if (error) throw error;

            alert(`Veículos ${action === 'ativar' ? 'ativados' : 'desativados'} com sucesso!`);
            setSelectedVehicles(new Set());
            fetchVehicles();
        } catch (error: any) {
            alert(`Erro ao ${action}: ` + error.message);
            setLoading(false);
        }
    };

    const handleBulkExport = () => {
        if (selectedVehicles.size === 0) return;

        if (!confirm(`Exportar ${selectedVehicles.size} veículos selecionados?`)) return;

        try {
            const selectedData = vehicles.filter(v => selectedVehicles.has(v.id));

            // Only 'Dados Cadastrais' screens data
            const csvContent = [
                ['Placa', 'Modelo', 'Marca', 'Ano', 'Cor', 'Renavam', 'KM Atual', 'Tipo de Veículo', 'Status'],
                ...selectedData.map(v => [
                    v.plate,
                    v.model,
                    (v as any).brand || '',
                    (v as any).year?.toString() || '',
                    (v as any).color || '',
                    v.renavam || '',
                    v.current_km?.toString() || '',
                    v.vehicle_types?.name || '',
                    v.active ? 'Ativo' : 'Inativo'
                ])
            ].map(e => e.join(',')).join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `veiculos_export_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            alert(`${selectedVehicles.size} veículos exportados com sucesso.`);
        } catch (error: any) {
            console.error('Erro ao exportar:', error);
            alert('Erro ao exportar: ' + error.message);
        }
    };

    const handleDeleteSingle = async (vehicle: FleetVehicle) => {
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

    const handleDeactivateSingle = async (vehicle: FleetVehicle) => {
        const action = vehicle.active ? 'desativar' : 'ativar';
        if (confirm(`Tem certeza que deseja ${action} o veículo ${vehicle.plate}?`)) {
            try {
                setLoading(true);
                const { error } = await supabase
                    .from('vehicles')
                    .update({ active: !vehicle.active })
                    .eq('id', vehicle.id);

                if (error) throw error;
                fetchVehicles();
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
                    <h1 className="text-xl font-bold text-slate-800">Frotas</h1>
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
                        placeholder="Buscar por placa, modelo..."
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
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <MultiSelectDropdown
                            title="Tipo de Veículo"
                            options={vehicleTypes.map(t => ({ id: t.name, label: t.name }))}
                            selected={filters.vehicleTypes}
                            onChange={(selected) => setFilters(prev => ({ ...prev, vehicleTypes: selected }))}
                            searchPlaceholder="Digite para pesquisar"
                            isOpen={activeFilter === 'types'}
                            onToggle={() => handleFilterToggle('types')}
                        />

                        <MultiSelectDropdown
                            title="Ativo"
                            options={[{ id: 'Ativo', label: 'Sim' }, { id: 'Inativo', label: 'Não' }]}
                            selected={filters.active}
                            onChange={(selected) => setFilters(prev => ({ ...prev, active: selected }))}
                            searchPlaceholder="Digite para pesquisar"
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
                    {filters.vehicleTypes.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs">
                            Tipo ({filters.vehicleTypes.length})
                            <button onClick={() => setFilters(prev => ({ ...prev, vehicleTypes: [] }))} className="hover:text-red-600">
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
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden min-w-[900px] mb-20">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                        <div
                            className="col-span-1 flex items-center gap-2 relative"
                            onMouseEnter={() => setShowSelectAll(true)}
                            onMouseLeave={() => setShowSelectAll(false)}
                        >
                            {showSelectAll && selectedVehicles.size === 0 && (
                                <button
                                    onClick={handleSelectAll}
                                    className="absolute -left-1 px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded shadow-sm hover:bg-blue-700 transition-all z-10 w-max"
                                >
                                    TODOS
                                </button>
                            )}
                            {selectedVehicles.size > 0 && (
                                <button
                                    onClick={handleDeselectAll}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Desmarcar todos"
                                >
                                    <X size={16} />
                                </button>
                            )}
                            {!showSelectAll && selectedVehicles.size === 0 && (
                                <span className="text-slate-400 px-1">-</span>
                            )}
                        </div>
                        <div className="col-span-3">Placa</div>
                        <div className="col-span-3">Modelo</div>
                        <div className="col-span-3">Tipo de Veículo / Unidade</div>
                        <div className="col-span-2 text-right">Status</div>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y divide-slate-100">
                        {loading ? (
                            <div className="p-12 text-center text-slate-400">
                                <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
                                <p className="text-sm">Carregando veículos...</p>
                            </div>
                        ) : filteredVehicles.length === 0 ? (
                            <div className="p-12 text-center text-slate-400">
                                <p className="text-sm">Nenhum veículo encontrado.</p>
                            </div>
                        ) : (
                            filteredVehicles.map((vehicle) => (
                                <div
                                    key={vehicle.id}
                                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors group relative ${selectedVehicles.has(vehicle.id) ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                                >
                                    <div className="col-span-1 flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedVehicles.has(vehicle.id)}
                                            onChange={() => handleSelectVehicle(vehicle.id)}
                                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                    </div>
                                    <div className="col-span-3 text-sm font-bold text-slate-700 relative group/plate">
                                        {vehicle.plate}
                                        {/* Tooltip on Hover */}
                                        <div className="absolute left-20 top-0 hidden group-hover/plate:block z-20 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                            Unidade: {vehicle.vehicle_types?.name || 'Não definida'}
                                        </div>
                                    </div>
                                    <div className="col-span-3 text-sm text-slate-600">
                                        {vehicle.model}
                                    </div>
                                    <div className="col-span-3 text-sm text-slate-600 font-bold">
                                        {vehicle.vehicle_types?.name || 'Não definido'}
                                    </div>
                                    <div className="col-span-2 flex items-center justify-end gap-3 text-right">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${vehicle.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {vehicle.active ? 'Ativo' : 'Inativo'}
                                        </span>

                                        {/* Hover Actions */}
                                        <div className={`flex items-center justify-end gap-1 ${activeMenu === vehicle.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                            <button
                                                onClick={() => onEdit(vehicle)}
                                                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-blue-900 transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => toggleMenu(e, vehicle.id)}
                                                    className={`p-2 rounded-full transition-colors ${activeMenu === vehicle.id ? 'bg-slate-200 text-slate-700' : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'}`}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {activeMenu === vehicle.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                                                        <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                                                            <button
                                                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveMenu(null);
                                                                    handleDeactivateSingle(vehicle);
                                                                }}
                                                            >
                                                                {vehicle.active ? (
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
                                                                    handleDeleteSingle(vehicle);
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

            {/* Bottom Bar for Bulk Actions (Matches UserList) */}
            {selectedVehicles.size > 0 && (
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
                            {vehicles.filter(v => selectedVehicles.has(v.id)).every(v => v.active) ? (
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
                        {selectedVehicles.size} de {filteredVehicles.length} selecionado{selectedVehicles.size !== 1 ? 's' : ''}
                    </div>
                </div>
            )}
        </div>

    );
};

export default FleetList;
