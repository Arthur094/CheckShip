
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import MultiSelectDropdown from '../../components/common/MultiSelectDropdown';

interface UserVehiclesProps {
    profileId: string | null;
    onEnsureExists: () => Promise<boolean>;
}

interface VehicleType {
    id: string;
    name: string;
}

interface Filters {
    vehicleTypes: string[];
    active: string[];
    display: string[];
}

const UserVehicles: React.FC<UserVehiclesProps> = ({ profileId, onEnsureExists }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
    const [assignments, setAssignments] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const [filters, setFilters] = useState<Filters>({
        vehicleTypes: [],
        active: [],
        display: []
    });

    const fetchData = async () => {
        if (!profileId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // 1. Fetch all vehicles with type info
            const { data: vehiclesData, error: vehiclesError } = await supabase
                .from('vehicles')
                .select('*, vehicle_types(id, name)')
                .order('plate');

            if (vehiclesError) throw vehiclesError;

            // 2. Fetch vehicle types
            const { data: typesData, error: typesError } = await supabase
                .from('vehicle_types')
                .select('id, name')
                .order('name');

            if (typesError) throw typesError;

            // 3. Fetch current assignments for this profile
            const { data: assignmentsData, error: assignmentsError } = await supabase
                .from('vehicle_assignments')
                .select('vehicle_id')
                .eq('profile_id', profileId);

            if (assignmentsError) throw assignmentsError;

            setVehicles(vehiclesData || []);
            setVehicleTypes(typesData || []);
            setAssignments(new Set((assignmentsData || []).map(a => a.vehicle_id)));
        } catch (error: any) {
            console.error('Error fetching vehicles/assignments:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [profileId]);

    const handleToggleLink = async (vehicleId: string, isLinked: boolean) => {
        if (!profileId) return;

        // Ensure profile exists in DB before linking to avoid FK error
        const exists = await onEnsureExists();
        if (!exists) return;

        try {
            if (isLinked) {
                // Remove assignment
                const { error } = await supabase
                    .from('vehicle_assignments')
                    .delete()
                    .match({ vehicle_id: vehicleId, profile_id: profileId });

                if (error) throw error;

                const newAssignments = new Set(assignments);
                newAssignments.delete(vehicleId);
                setAssignments(newAssignments);
            } else {
                // Add assignment
                const { error } = await supabase
                    .from('vehicle_assignments')
                    .insert({ vehicle_id: vehicleId, profile_id: profileId });

                if (error) throw error;

                const newAssignments = new Set(assignments);
                newAssignments.add(vehicleId);
                setAssignments(newAssignments);
            }
        } catch (error: any) {
            console.error('Error toggling assignment:', error.message);
            alert('Erro ao atualizar vínculo: ' + error.message);
        }
    };

    const filteredVehicles = useMemo(() => {
        return vehicles.filter(vehicle => {
            // Search filter
            const matchesSearch = searchTerm === '' ||
                vehicle.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase());

            // Vehicle type filter
            const matchesVehicleType = filters.vehicleTypes.length === 0 ||
                (vehicle.vehicle_type_id && filters.vehicleTypes.includes(vehicle.vehicle_type_id));

            // Active status filter
            const matchesActive = filters.active.length === 0 ||
                (filters.active.includes('Sim') && vehicle.active) ||
                (filters.active.includes('Não') && !vehicle.active);

            // Display filter (Selected/Not Selected)
            const isLinked = assignments.has(vehicle.id);
            const matchesDisplay = filters.display.length === 0 ||
                (filters.display.includes('Selecionados') && isLinked) ||
                (filters.display.includes('Não Selecionados') && !isLinked);

            return matchesSearch && matchesVehicleType && matchesActive && matchesDisplay;
        });
    }, [vehicles, searchTerm, filters, assignments]);

    const handleBulkToggle = async () => {
        if (!profileId || filteredVehicles.length === 0) return;

        // Ensure profile exists in DB
        const exists = await onEnsureExists();
        if (!exists) return;

        // Determine target state
        const allLinked = filteredVehicles.every(v => assignments.has(v.id));
        const targetState = !allLinked;

        try {
            if (targetState) {
                // Link all filtered vehicles
                const toAdd = filteredVehicles
                    .filter(v => !assignments.has(v.id))
                    .map(v => ({
                        vehicle_id: v.id,
                        profile_id: profileId
                    }));

                if (toAdd.length > 0) {
                    const { error } = await supabase
                        .from('vehicle_assignments')
                        .upsert(toAdd, { onConflict: 'vehicle_id, profile_id', ignoreDuplicates: true });

                    if (error) throw error;
                }

                // Update local state
                const newAssignments = new Set(assignments);
                filteredVehicles.forEach(v => newAssignments.add(v.id));
                setAssignments(newAssignments);

            } else {
                // Unlink all filtered vehicles
                const idsToRemove = filteredVehicles.map(v => v.id);

                const { error } = await supabase
                    .from('vehicle_assignments')
                    .delete()
                    .eq('profile_id', profileId)
                    .in('vehicle_id', idsToRemove);

                if (error) throw error;

                // Update local state
                const newAssignments = new Set(assignments);
                filteredVehicles.forEach(v => newAssignments.delete(v.id));
                setAssignments(newAssignments);
            }

            alert(`Ação em massa concluída: ${targetState ? 'Todos vinculados' : 'Todos desvinculados'}`);

        } catch (error: any) {
            console.error('Error bulk updating assignments:', error.message);
            alert('Erro ao atualizar em massa: ' + error.message);
        }
    };

    const handleFilterToggle = (filterName: string) => {
        setActiveFilter(activeFilter === filterName ? null : filterName);
    };

    const handleClearFilters = () => {
        setFilters({
            vehicleTypes: [],
            active: [],
            display: []
        });
    };

    const hasActiveFilters = filters.vehicleTypes.length > 0 ||
        filters.active.length > 0 ||
        filters.display.length > 0;

    const vehicleTypeOptions = vehicleTypes.map(vt => ({ id: vt.id, label: vt.name }));
    const activeOptions = [
        { id: 'Sim', label: 'Sim' },
        { id: 'Não', label: 'Não' }
    ];
    const displayOptions = [
        { id: 'Selecionados', label: 'Selecionados' },
        { id: 'Não Selecionados', label: 'Não Selecionados' }
    ];

    if (loading) {
        return (
            <div className="p-12 text-center text-slate-400">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
                <p className="text-sm">Carregando veículos...</p>
            </div>
        );
    }

    if (!profileId) {
        return (
            <div className="p-12 text-center text-slate-400 italic">
                Crie o usuário primeiro para vincular veículos.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Search Bar */}
            <div className="px-8 py-6">
                <div className="relative flex items-center bg-white rounded-lg border border-slate-200 shadow-sm">
                    <Search size={20} className="absolute left-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar veículo por placa ou modelo"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
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
                <div className="px-8 pb-6">
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <MultiSelectDropdown
                                title="Tipo de Veículo"
                                options={vehicleTypeOptions}
                                selected={filters.vehicleTypes}
                                onChange={(selected) => setFilters({ ...filters, vehicleTypes: selected })}
                                searchPlaceholder="Digite para pesquisar"
                                isOpen={activeFilter === 'vehicleTypes'}
                                onToggle={() => handleFilterToggle('vehicleTypes')}
                            />

                            <MultiSelectDropdown
                                title="Ativo"
                                options={activeOptions}
                                selected={filters.active}
                                onChange={(selected) => setFilters({ ...filters, active: selected })}
                                searchPlaceholder="Digite para pesquisar"
                                isOpen={activeFilter === 'active'}
                                onToggle={() => handleFilterToggle('active')}
                            />

                            <MultiSelectDropdown
                                title="Exibir"
                                options={displayOptions}
                                selected={filters.display}
                                onChange={(selected) => setFilters({ ...filters, display: selected })}
                                searchPlaceholder="Digite para pesquisar"
                                isOpen={activeFilter === 'display'}
                                onToggle={() => handleFilterToggle('display')}
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
                </div>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="px-8 pb-4">
                    <div className="bg-slate-100 px-4 py-2 rounded-lg flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-slate-600">Filtros ativos:</span>
                        {filters.vehicleTypes.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs">
                                Tipos ({filters.vehicleTypes.length})
                                <button onClick={() => setFilters({ ...filters, vehicleTypes: [] })} className="hover:text-red-600">
                                    <X size={14} />
                                </button>
                            </span>
                        )}
                        {filters.active.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs">
                                Ativo ({filters.active.length})
                                <button onClick={() => setFilters({ ...filters, active: [] })} className="hover:text-red-600">
                                    <X size={14} />
                                </button>
                            </span>
                        )}
                        {filters.display.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs">
                                Exibir ({filters.display.length})
                                <button onClick={() => setFilters({ ...filters, display: [] })} className="hover:text-red-600">
                                    <X size={14} />
                                </button>
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Vehicles List */}
            <div className="flex-1 overflow-y-auto px-8 pb-8">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                        <div className="col-span-2">Placa</div>
                        <div className="col-span-8">Veículo</div>
                        <div className="col-span-2 text-right group flex items-center justify-end gap-2 cursor-pointer" onClick={handleBulkToggle}>
                            <span className="group-hover:hidden">Vincular</span>
                            <span className="hidden group-hover:block text-blue-600 font-extrabold text-[10px] tracking-wide bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shadow-sm transition-all">MARCAR TODOS</span>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {filteredVehicles.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                Nenhum veículo encontrado.
                            </div>
                        ) : (
                            filteredVehicles.map((vehicle) => {
                                const isLinked = assignments.has(vehicle.id);
                                return (
                                    <div key={vehicle.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
                                        <div className="col-span-2 text-sm text-slate-500 font-mono">
                                            {vehicle.plate}
                                        </div>
                                        <div className="col-span-8 text-sm text-slate-700 font-medium">
                                            {vehicle.model}
                                        </div>
                                        <div className="col-span-2 flex justify-end">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={isLinked}
                                                    onChange={() => handleToggleLink(vehicle.id, isLinked)}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                            </label>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserVehicles;
