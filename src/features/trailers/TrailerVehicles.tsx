
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter, X } from 'lucide-react';
import MultiSelectDropdown from '../../components/common/MultiSelectDropdown';

interface TrailerVehiclesProps {
    trailerId: string | null;
    onEnsureExists: () => Promise<string | null>;
}

interface Vehicle {
    id: string;
    plate: string;
    model: string;
    brand: string;
    active: boolean;
    trailer_id_1: string | null;
    trailer_id_2: string | null;
    trailer_id_3: string | null;
    vehicle_type_id: string | null;
    vehicle_configuration_id: string | null;
    linked_slot?: number | null;
}

interface Option {
    id: string;
    label: string;
}

interface Filters {
    vehicleTypes: string[];
    trailers: string[];
    active: string[];
    show: string[];
}

const TrailerVehicles: React.FC<TrailerVehiclesProps> = ({ trailerId, onEnsureExists }) => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [allTrailers, setAllTrailers] = useState<Option[]>([]);
    const [allVehicleTypes, setAllVehicleTypes] = useState<Option[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [filters, setFilters] = useState<Filters>({
        vehicleTypes: [],
        trailers: [],
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

            // Fetch Vehicles with new trailer columns
            const { data: vData, error: vError } = await supabase
                .from('vehicles')
                .select('id, plate, model, brand, active, trailer_id_1, trailer_id_2, trailer_id_3, vehicle_type_id, vehicle_configuration_id')
                .order('plate');

            if (vError) throw vError;

            // Map vehicles and determine which slot the current trailer is in
            const mappedVehicles = (vData || []).map(v => {
                let linkedSlot = null;
                if (v.trailer_id_1 === trailerId) linkedSlot = 1;
                else if (v.trailer_id_2 === trailerId) linkedSlot = 2;
                else if (v.trailer_id_3 === trailerId) linkedSlot = 3;

                return {
                    ...v,
                    linked_slot: linkedSlot
                };
            });

            setVehicles(mappedVehicles);

            // Fetch Trailers for filter
            const { data: bData, error: bError } = await supabase
                .from('trailers')
                .select('id, plate')
                .eq('active', true)
                .order('plate');

            if (bError) throw bError;
            setAllTrailers((bData || []).map(b => ({ id: b.id, label: b.plate })));

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
        let currentTrailerId = trailerId;
        const isLinked = vehicle.linked_slot !== null;

        // Ensure trailer exists
        if (!currentTrailerId) {
            currentTrailerId = await onEnsureExists();
            if (!currentTrailerId) return;
        }

        try {
            if (isLinked) {
                // Unlinking: clear the specific slot
                const slotKey = `trailer_id_${vehicle.linked_slot}`;
                const { error } = await supabase
                    .from('vehicles')
                    .update({ [slotKey]: null })
                    .eq('id', vehicle.id);

                if (error) throw error;
            } else {
                // Linking: find first available slot
                // First, check vehicle configuration to see max trailers allowed
                const { data: configData } = await supabase
                    .from('vehicle_configurations')
                    .select('plates_count')
                    .eq('id', vehicle.vehicle_configuration_id)
                    .single();

                const maxTrailers = configData?.plates_count || 0;

                if (maxTrailers === 0) {
                    alert('Este veículo não suporta carretas.');
                    return;
                }

                // Find first available slot
                let targetSlot = null;
                if (!vehicle.trailer_id_1) targetSlot = 1;
                else if (maxTrailers >= 2 && !vehicle.trailer_id_2) targetSlot = 2;
                else if (maxTrailers >= 3 && !vehicle.trailer_id_3) targetSlot = 3;

                if (!targetSlot) {
                    alert(`Este veículo já atingiu o limite de ${maxTrailers} carreta(s).`);
                    return;
                }

                const slotKey = `trailer_id_${targetSlot}`;
                const { error } = await supabase
                    .from('vehicles')
                    .update({ [slotKey]: currentTrailerId })
                    .eq('id', vehicle.id);

                if (error) throw error;
            }

            // Refresh data
            await fetchData();

        } catch (error: any) {
            alert('Erro ao vincular veículo: ' + error.message);
        }
    };

    const filteredVehicles = useMemo(() => {
        return vehicles.filter(v => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                v.plate.toLowerCase().includes(searchLower) ||
                v.model.toLowerCase().includes(searchLower) ||
                (v.brand && v.brand.toLowerCase().includes(searchLower));

            const matchesTrailer = filters.trailers.length === 0 ||
                filters.trailers.includes(v.trailer_id_1 || '') ||
                filters.trailers.includes(v.trailer_id_2 || '') ||
                filters.trailers.includes(v.trailer_id_3 || '');

            const matchesVehicleType = filters.vehicleTypes.length === 0 ||
                (v.vehicle_type_id && filters.vehicleTypes.includes(v.vehicle_type_id));

            const matchesActive = filters.active.length === 0 ||
                (filters.active.includes('Ativo') && v.active) ||
                (filters.active.includes('Inativo') && !v.active);

            let matchesShow = true;
            if (filters.show.length > 0) {
                const isLinked = v.linked_slot !== null;
                if (filters.show.includes('Selecionados') && !filters.show.includes('Não Selecionados')) {
                    matchesShow = isLinked;
                } else if (filters.show.includes('Não Selecionados') && !filters.show.includes('Selecionados')) {
                    matchesShow = !isLinked;
                }
            }

            return matchesSearch && matchesTrailer && matchesVehicleType && matchesActive && matchesShow;
        });
    }, [vehicles, searchTerm, filters, trailerId]);

    const hasActiveFilters =
        filters.vehicleTypes.length > 0 ||
        filters.trailers.length > 0 ||
        filters.active.length > 0 ||
        filters.show.length > 0;

    const handleFilterToggle = (filterName: string) => {
        setActiveFilter(activeFilter === filterName ? null : filterName);
    };

    const handleClearFilters = () => {
        setFilters({ vehicleTypes: [], trailers: [], active: [], show: [] });
    };

    const handleSelectAll = async () => {
        let currentTrailerId = trailerId;
        if (!currentTrailerId) {
            currentTrailerId = await onEnsureExists();
            if (!currentTrailerId) return;
        }

        if (!confirm(`Deseja vincular TODAS as ${filteredVehicles.length} placas exibidas a esta Carreta?`)) return;

        try {
            setLoading(true);
            const idsToUpdate = filteredVehicles.map(v => v.id);

            const { error } = await supabase
                .from('vehicles')
                .update({ trailer_id: currentTrailerId })
                .in('id', idsToUpdate);

            if (error) throw error;

            setVehicles(prev => prev.map(v => idsToUpdate.includes(v.id) ? { ...v, trailer_id: currentTrailerId } : v));
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
            <div className="px-8 py-4 bg-white border-b border-slate-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar cavalo mecânico..."
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
                            title="Carreta"
                            options={allTrailers}
                            selected={filters.trailers}
                            onChange={(selected) => setFilters(prev => ({ ...prev, trailers: selected }))}
                            searchPlaceholder="Buscar carreta..."
                            isOpen={activeFilter === 'trailers'}
                            onToggle={() => handleFilterToggle('trailers')}
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
                        <button onClick={handleClearFilters} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">Limpar</button>
                        <button onClick={() => setShowFilterPanel(false)} className="px-6 py-2 bg-blue-900 text-white text-sm font-bold rounded-lg hover:bg-blue-800 transition-colors">Filtrar</button>
                    </div>
                </div>
            )}

            {hasActiveFilters && (
                <div className="bg-slate-100 px-8 py-3 border-b border-slate-200 flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-slate-600">Filtros ativos:</span>
                    {Object.entries(filters).map(([key, value]) => {
                        if (value.length === 0) return null;
                        const label = key === 'vehicleTypes' ? 'Tipo' : key === 'trailers' ? 'Carreta' : key === 'active' ? 'Ativo' : 'Exibir';
                        return (
                            <span key={key} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs">
                                {label} ({value.length})
                                <button onClick={() => setFilters(prev => ({ ...prev, [key]: [] }))} className="hover:text-red-600"><X size={14} /></button>
                            </span>
                        );
                    })}
                </div>
            )}

            <div className="flex-1 overflow-y-auto px-8 py-8">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase rounded-t-lg">
                        <div className="col-span-4">Veículo</div>
                        <div className="col-span-4">Modelo/Marca</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2 text-right relative group/header">
                            <span className="cursor-pointer group-hover/header:hidden">Vincular</span>
                            <div
                                className="hidden group-hover/header:flex absolute right-0 top-1/2 -translate-y-1/2 items-center gap-2"
                                onMouseEnter={() => setShowSelectAll(true)}
                                onMouseLeave={() => setShowSelectAll(false)}
                            >
                                <button onClick={handleSelectAll} className="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded shadow-sm hover:bg-blue-700 transition-all whitespace-nowrap">TODOS</button>
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {filteredVehicles.map((vehicle) => {
                            const isLinked = vehicle.linked_slot !== null;
                            return (
                                <div key={vehicle.id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors ${isLinked ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                                    <div className="col-span-4"><span className="text-sm font-bold text-slate-700 block">{vehicle.plate}</span></div>
                                    <div className="col-span-4 text-sm text-slate-500">{vehicle.brand} / {vehicle.model}</div>
                                    <div className="col-span-2"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${vehicle.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{vehicle.active ? 'Ativo' : 'Inativo'}</span></div>
                                    <div className="col-span-2 flex justify-end items-center gap-2">
                                        {isLinked && <span className="text-xs text-blue-600 mr-2">Slot {vehicle.linked_slot}</span>}
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={isLinked} onChange={() => handleToggle(vehicle)} />
                                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                        </label>
                                    </div>
                                </div>
                            );
                        })}
                        {loading && <div className="p-8 text-center text-slate-400 text-xs">Carregando...</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrailerVehicles;
