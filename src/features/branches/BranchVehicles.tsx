
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter, X } from 'lucide-react';
import MultiSelectDropdown from '../../components/common/MultiSelectDropdown';

interface BranchVehiclesProps {
    branchId: string | null;
    onEnsureExists: () => Promise<boolean>;
}

interface Vehicle {
    id: string;
    plate: string;
    model: string;
    brand: string;
    active: boolean;
    branch_id: string | null;
    vehicle_type_id: string | null;
}

interface Option {
    id: string;
    label: string;
}

interface Filters {
    vehicleTypes: string[];
    branches: string[];
    active: string[];
    show: string[];
}

const BranchVehicles: React.FC<BranchVehiclesProps> = ({ branchId, onEnsureExists }) => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [allBranches, setAllBranches] = useState<Option[]>([]);
    const [allVehicleTypes, setAllVehicleTypes] = useState<Option[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [filters, setFilters] = useState<Filters>({
        vehicleTypes: [],
        branches: [],
        active: [],
        show: []
    });

    // Select All State
    const [showSelectAll, setShowSelectAll] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch Vehicles
            const { data: vData, error: vError } = await supabase
                .from('vehicles')
                .select('id, plate, model, brand, active, branch_id, vehicle_type_id')
                .order('plate');

            if (vError) throw vError;
            setVehicles(vData || []);

            // Fetch Branches for filter
            const { data: bData, error: bError } = await supabase
                .from('branches')
                .select('id, name')
                .eq('active', true)
                .order('name');

            if (bError) throw bError;
            setAllBranches((bData || []).map(b => ({ id: b.id, label: b.name })));

            // Fetch Vehicle Types for filter
            const { data: tData, error: tError } = await supabase
                .from('vehicle_types')
                .select('id, name')
                .order('name');

            if (tError) throw tError;
            setAllVehicleTypes((tData || []).map(t => ({ id: t.id, label: t.name })));

        } catch (error: any) {
            console.error('Error fetching data:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (vehicle: Vehicle) => {
        let targetBranchId = branchId;

        // If we are unlinking, set to null
        const isLinked = !!branchId && vehicle.branch_id === branchId;
        if (isLinked) {
            targetBranchId = null;
        } else {
            // We are linking. Ensure Branch exists first.
            if (!branchId) {
                const saved = await onEnsureExists();
                if (!saved) return;
                return;
            }
        }

        try {
            // If linking to another branch, confirm?
            if (targetBranchId && vehicle.branch_id && vehicle.branch_id !== targetBranchId) {
                if (!confirm('Este veículo já está vinculado a outra Filial. Deseja transferi-lo?')) return;
            }

            const { error } = await supabase
                .from('vehicles')
                .update({ branch_id: targetBranchId })
                .eq('id', vehicle.id);

            if (error) throw error;

            // Optimistic update
            setVehicles(prev => prev.map(v => v.id === vehicle.id ? { ...v, branch_id: targetBranchId } : v));

        } catch (error: any) {
            alert('Erro ao vincular veículo: ' + error.message);
        }
    };

    const handleToggleWrapper = async (vehicle: Vehicle) => {
        if (!branchId) {
            const success = await onEnsureExists();
            if (!success) return;
            return;
        }
        handleToggle(vehicle);
    }

    // Filter Logic
    const filteredVehicles = useMemo(() => {
        return vehicles.filter(v => {
            // Search
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                v.plate.toLowerCase().includes(searchLower) ||
                v.model.toLowerCase().includes(searchLower) ||
                (v.brand && v.brand.toLowerCase().includes(searchLower));

            // Branch Filter
            const matchesBranch = filters.branches.length === 0 ||
                (v.branch_id && filters.branches.includes(v.branch_id));

            // Vehicle Type Filter
            const matchesVehicleType = filters.vehicleTypes.length === 0 ||
                (v.vehicle_type_id && filters.vehicleTypes.includes(v.vehicle_type_id));

            // Active Filter
            const matchesActive = filters.active.length === 0 ||
                (filters.active.includes('Ativo') && v.active) ||
                (filters.active.includes('Inativo') && !v.active);

            // Show Filter (Linked/Unlinked relative to CURRENT branch)
            let matchesShow = true;
            if (filters.show.length > 0) {
                const isLinked = !!branchId && v.branch_id === branchId;
                if (filters.show.includes('Selecionados') && !filters.show.includes('Não Selecionados')) {
                    matchesShow = isLinked;
                } else if (filters.show.includes('Não Selecionados') && !filters.show.includes('Selecionados')) {
                    matchesShow = !isLinked;
                }
            }

            return matchesSearch && matchesBranch && matchesVehicleType && matchesActive && matchesShow;
        });
    }, [vehicles, searchTerm, filters, branchId]);

    const hasActiveFilters =
        filters.vehicleTypes.length > 0 ||
        filters.branches.length > 0 ||
        filters.active.length > 0 ||
        filters.show.length > 0;

    const handleFilterToggle = (filterName: string) => {
        setActiveFilter(activeFilter === filterName ? null : filterName);
    };

    const handleClearFilters = () => {
        setFilters({ vehicleTypes: [], branches: [], active: [], show: [] });
    };

    // Bulk Actions
    const handleSelectAll = async () => {
        if (!branchId) {
            const success = await onEnsureExists();
            if (!success) return;
            return;
        }

        if (!confirm(`Deseja vincular TODAS as ${filteredVehicles.length} placas exibidas a esta Filial?`)) return;

        try {
            setLoading(true);
            const idsToUpdate = filteredVehicles.map(v => v.id);

            const { error } = await supabase
                .from('vehicles')
                .update({ branch_id: branchId })
                .in('id', idsToUpdate);

            if (error) throw error;

            // Optimistic
            setVehicles(prev => prev.map(v => idsToUpdate.includes(v.id) ? { ...v, branch_id: branchId } : v));
            alert(`${idsToUpdate.length} veículos vinculados com sucesso!`);

        } catch (error: any) {
            alert('Erro ao vincular em massa: ' + error.message);
        } finally {
            setLoading(false);
            setShowSelectAll(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Search & Filter Bar */}
            <div className="px-8 py-4 bg-white border-b border-slate-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar veículo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-12 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-900"
                    />
                    <button
                        onClick={() => setShowFilterPanel(!showFilterPanel)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${showFilterPanel || hasActiveFilters ? 'text-blue-900' : 'text-slate-400 hover:text-blue-900'}`}
                    >
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilterPanel && (
                <div className="bg-white px-8 py-6 border-b border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <MultiSelectDropdown
                            title="Tipo de Operação"
                            options={allVehicleTypes}
                            selected={filters.vehicleTypes}
                            onChange={(selected) => setFilters(prev => ({ ...prev, vehicleTypes: selected }))}
                            searchPlaceholder="Buscar tipo..."
                            isOpen={activeFilter === 'vehicleTypes'}
                            onToggle={() => handleFilterToggle('vehicleTypes')}
                        />
                        <MultiSelectDropdown
                            title="Filial"
                            options={allBranches}
                            selected={filters.branches}
                            onChange={(selected) => setFilters(prev => ({ ...prev, branches: selected }))}
                            searchPlaceholder="Buscar filial..."
                            isOpen={activeFilter === 'branches'}
                            onToggle={() => handleFilterToggle('branches')}
                        />
                        <MultiSelectDropdown
                            title="Ativo"
                            options={[{ id: 'Ativo', label: 'Sim' }, { id: 'Inativo', label: 'Não' }]}
                            selected={filters.active}
                            onChange={(selected) => setFilters(prev => ({ ...prev, active: selected }))}
                            isOpen={activeFilter === 'active'}
                            onToggle={() => handleFilterToggle('active')}
                        />
                        <MultiSelectDropdown
                            title="Exibir"
                            options={[{ id: 'Selecionados', label: 'Selecionados' }, { id: 'Não Selecionados', label: 'Não Selecionados' }]}
                            selected={filters.show}
                            onChange={(selected) => setFilters(prev => ({ ...prev, show: selected }))}
                            isOpen={activeFilter === 'show'}
                            onToggle={() => handleFilterToggle('show')}
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
                    {Object.entries(filters).map(([key, value]) => {
                        if (value.length === 0) return null;
                        const label = key === 'vehicleTypes' ? 'Tipo' : key === 'branches' ? 'Filial' : key === 'active' ? 'Ativo' : 'Exibir';
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

            <div className="flex-1 overflow-y-auto px-8 py-8">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase rounded-t-lg">
                        <div className="col-span-4">Veículo</div>
                        <div className="col-span-4">Modelo/Marca</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2 text-right relative group/header">
                            <span className="cursor-pointer group-hover/header:hidden">Vincular</span>
                            {/* Select All on Hover */}
                            <div
                                className="hidden group-hover/header:flex absolute right-0 top-1/2 -translate-y-1/2 items-center gap-2"
                                onMouseEnter={() => setShowSelectAll(true)}
                                onMouseLeave={() => setShowSelectAll(false)}
                            >
                                <button
                                    onClick={handleSelectAll}
                                    className="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded shadow-sm hover:bg-blue-700 transition-all whitespace-nowrap"
                                >
                                    TODOS
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-slate-100">
                        {filteredVehicles.map((vehicle) => {
                            const isLinked = !!branchId && vehicle.branch_id === branchId;

                            return (
                                <div key={vehicle.id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors ${isLinked ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                                    <div className="col-span-4">
                                        <span className="text-sm font-bold text-slate-700 block">{vehicle.plate}</span>
                                    </div>
                                    <div className="col-span-4 text-sm text-slate-500">
                                        {vehicle.brand} / {vehicle.model}
                                    </div>
                                    <div className="col-span-2">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${vehicle.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {vehicle.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </div>
                                    <div className="col-span-2 flex justify-end items-center gap-2">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={isLinked}
                                                onChange={() => handleToggleWrapper(vehicle)}
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            );
                        })}

                        {loading && (
                            <div className="p-8 text-center text-slate-400">
                                <div className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mb-1"></div>
                                <p className="text-xs">Carregando...</p>
                            </div>
                        )}

                        {!loading && filteredVehicles.length === 0 && (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                Nenhum veículo encontrado para os filtros selecionados.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BranchVehicles;
