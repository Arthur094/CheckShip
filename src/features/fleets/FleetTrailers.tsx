import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter, X, AlertCircle } from 'lucide-react';
import MultiSelectDropdown from '../../components/common/MultiSelectDropdown';

interface FleetTrailersProps {
    vehicleId: string | null;
    vehicleConfigId: string | null;
    onEnsureExists: () => Promise<string | null>;
}

interface Trailer {
    id: string;
    plate: string;
    active: boolean;
    trailer_type: string;
    linked_vehicle_id?: string | null;
    linked_slot?: number | null;
}

interface Option {
    id: string;
    label: string;
}

interface Filters {
    trailerTypes: string[];
    active: string[];
    show: string[];
}

interface VehicleTrailers {
    trailer_id_1: string | null;
    trailer_id_2: string | null;
    trailer_id_3: string | null;
}

const FleetTrailers: React.FC<FleetTrailersProps> = ({ vehicleId, vehicleConfigId, onEnsureExists }) => {
    const [trailers, setTrailers] = useState<Trailer[]>([]);
    const [vehicleTrailers, setVehicleTrailers] = useState<VehicleTrailers>({
        trailer_id_1: null,
        trailer_id_2: null,
        trailer_id_3: null
    });
    const [maxTrailers, setMaxTrailers] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [configName, setConfigName] = useState<string>('');

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [filters, setFilters] = useState<Filters>({
        trailerTypes: [],
        active: [],
        show: []
    });

    const trailerTypeOptions: Option[] = [
        { id: 'CARRETA', label: 'Carreta' },
        { id: 'DOLLY', label: 'Dolly' }
    ];

    useEffect(() => {
        fetchConfiguration();
    }, [vehicleConfigId]);

    useEffect(() => {
        if (vehicleId) {
            fetchVehicleTrailers();
        }
        fetchAllTrailers();
    }, [vehicleId]);

    const fetchConfiguration = async () => {
        if (!vehicleConfigId) {
            setMaxTrailers(0);
            setConfigName('Não definido');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('vehicle_configurations')
                .select('name, plates_count')
                .eq('id', vehicleConfigId)
                .single();

            if (error) throw error;

            if (data) {
                setMaxTrailers(data.plates_count || 0);
                setConfigName(data.name);
            }
        } catch (error: any) {
            console.error('Error fetching configuration:', error.message);
        }
    };

    const fetchVehicleTrailers = async () => {
        if (!vehicleId) return;

        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select('trailer_id_1, trailer_id_2, trailer_id_3')
                .eq('id', vehicleId)
                .single();

            if (error) throw error;

            if (data) {
                setVehicleTrailers({
                    trailer_id_1: data.trailer_id_1,
                    trailer_id_2: data.trailer_id_2,
                    trailer_id_3: data.trailer_id_3
                });
            }
        } catch (error: any) {
            console.error('Error fetching vehicle trailers:', error.message);
        }
    };

    const fetchAllTrailers = async () => {
        try {
            setLoading(true);

            // Fetch all trailers
            const { data: tData, error: tError } = await supabase
                .from('trailers')
                .select('id, plate, active, trailer_type')
                .order('plate');

            if (tError) throw tError;

            // Fetch all vehicles to check trailer assignments
            const { data: vData, error: vError } = await supabase
                .from('vehicles')
                .select('id, trailer_id_1, trailer_id_2, trailer_id_3');

            if (vError) throw vError;

            // Map trailers with their current assignments
            const mappedTrailers = (tData || []).map(trailer => {
                let linkedVehicleId = null;
                let linkedSlot = null;

                for (const vehicle of vData || []) {
                    if (vehicle.trailer_id_1 === trailer.id) {
                        linkedVehicleId = vehicle.id;
                        linkedSlot = 1;
                        break;
                    }
                    if (vehicle.trailer_id_2 === trailer.id) {
                        linkedVehicleId = vehicle.id;
                        linkedSlot = 2;
                        break;
                    }
                    if (vehicle.trailer_id_3 === trailer.id) {
                        linkedVehicleId = vehicle.id;
                        linkedSlot = 3;
                        break;
                    }
                }

                return {
                    ...trailer,
                    linked_vehicle_id: linkedVehicleId,
                    linked_slot: linkedSlot
                };
            });

            setTrailers(mappedTrailers);

        } catch (error: any) {
            console.error('Error fetching trailers:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (trailer: Trailer, slot: number) => {
        let currentVehicleId = vehicleId;

        // Determine if we're linking or unlinking
        const currentSlotKey = `trailer_id_${slot}` as keyof VehicleTrailers;
        const isLinked = vehicleTrailers[currentSlotKey] === trailer.id;

        // Ensure vehicle exists
        if (!currentVehicleId) {
            currentVehicleId = await onEnsureExists();
            if (!currentVehicleId) return;
        }

        // Check if trailer is already linked to another vehicle
        if (!isLinked && trailer.linked_vehicle_id && trailer.linked_vehicle_id !== currentVehicleId) {
            if (!confirm(`Esta carreta já está vinculada a outro veículo (Slot ${trailer.linked_slot}). Deseja transferi-la para este veículo?`)) {
                return;
            }
        }

        try {
            const updates: any = {};

            if (isLinked) {
                // Unlinking
                updates[currentSlotKey] = null;
            } else {
                // Linking
                updates[currentSlotKey] = trailer.id;
            }

            const { error } = await supabase
                .from('vehicles')
                .update(updates)
                .eq('id', currentVehicleId);

            if (error) throw error;

            // Refresh data
            await fetchVehicleTrailers();
            await fetchAllTrailers();

        } catch (error: any) {
            alert('Erro ao vincular carreta: ' + error.message);
        }
    };

    const filteredTrailers = useMemo(() => {
        return trailers.filter(t => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = t.plate.toLowerCase().includes(searchLower);

            const matchesType = filters.trailerTypes.length === 0 ||
                filters.trailerTypes.includes(t.trailer_type);

            const matchesActive = filters.active.length === 0 ||
                (filters.active.includes('Ativo') && t.active) ||
                (filters.active.includes('Inativo') && !t.active);

            let matchesShow = true;
            if (filters.show.length > 0) {
                const isLinkedToThisVehicle =
                    vehicleTrailers.trailer_id_1 === t.id ||
                    vehicleTrailers.trailer_id_2 === t.id ||
                    vehicleTrailers.trailer_id_3 === t.id;

                if (filters.show.includes('Selecionados') && !filters.show.includes('Não Selecionados')) {
                    matchesShow = isLinkedToThisVehicle;
                } else if (filters.show.includes('Não Selecionados') && !filters.show.includes('Selecionados')) {
                    matchesShow = !isLinkedToThisVehicle;
                }
            }

            return matchesSearch && matchesType && matchesActive && matchesShow;
        });
    }, [trailers, searchTerm, filters, vehicleTrailers]);

    const hasActiveFilters =
        filters.trailerTypes.length > 0 ||
        filters.active.length > 0 ||
        filters.show.length > 0;

    const handleFilterToggle = (filterName: string) => {
        setActiveFilter(activeFilter === filterName ? null : filterName);
    };

    const handleClearFilters = () => {
        setFilters({ trailerTypes: [], active: [], show: [] });
    };

    const getSlotStatus = (slot: number): { trailerId: string | null; isLinked: boolean } => {
        const slotKey = `trailer_id_${slot}` as keyof VehicleTrailers;
        const trailerId = vehicleTrailers[slotKey];
        return { trailerId, isLinked: !!trailerId };
    };

    // If configuration doesn't support trailers
    if (maxTrailers === 0) {
        return (
            <div className="flex items-center justify-center h-full bg-slate-50">
                <div className="bg-white rounded-lg border border-slate-200 p-8 max-w-md text-center">
                    <AlertCircle className="mx-auto mb-4 text-slate-400" size={48} />
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Sem Suporte para Carretas</h3>
                    <p className="text-sm text-slate-500">
                        A configuração <strong>{configName}</strong> não permite vínculo com carretas.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="px-8 py-4 bg-white border-b border-slate-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar carreta..."
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <MultiSelectDropdown
                            title="Tipo de Implemento"
                            options={trailerTypeOptions}
                            selected={filters.trailerTypes}
                            onChange={(selected) => setFilters(prev => ({ ...prev, trailerTypes: selected }))}
                            searchPlaceholder="Buscar tipo..."
                            isOpen={activeFilter === 'trailerTypes'}
                            onToggle={() => handleFilterToggle('trailerTypes')}
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
                            options={[{ id: 'Selecionados', label: 'Vinculadas' }, { id: 'Não Selecionados', label: 'Não Vinculadas' }]}
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
                        const label = key === 'trailerTypes' ? 'Tipo' : key === 'active' ? 'Ativo' : 'Exibir';
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
                    <div className="grid gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase rounded-t-lg" style={{ gridTemplateColumns: `3fr 2fr 1fr repeat(${maxTrailers}, 1fr)` }}>
                        <div>Placa</div>
                        <div>Tipo</div>
                        <div>Status</div>
                        {Array.from({ length: maxTrailers }, (_, i) => (
                            <div key={i} className="text-center">Slot {i + 1}</div>
                        ))}
                    </div>

                    <div className="divide-y divide-slate-100">
                        {filteredTrailers.map((trailer) => {
                            const isLinkedToThisVehicle =
                                vehicleTrailers.trailer_id_1 === trailer.id ||
                                vehicleTrailers.trailer_id_2 === trailer.id ||
                                vehicleTrailers.trailer_id_3 === trailer.id;

                            return (
                                <div
                                    key={trailer.id}
                                    className={`grid gap-4 px-6 py-4 items-center transition-colors ${isLinkedToThisVehicle ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                                    style={{ gridTemplateColumns: `3fr 2fr 1fr repeat(${maxTrailers}, 1fr)` }}
                                >
                                    <div>
                                        <span className="text-sm font-bold text-slate-700 block">{trailer.plate}</span>
                                        {trailer.linked_vehicle_id && trailer.linked_vehicle_id !== vehicleId && (
                                            <span className="text-xs text-amber-600">Vinculada a outro veículo</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-slate-500">{trailer.trailer_type}</div>
                                    <div>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${trailer.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {trailer.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </div>
                                    {Array.from({ length: maxTrailers }, (_, i) => {
                                        const slot = i + 1;
                                        const slotStatus = getSlotStatus(slot);
                                        const isThisSlot = slotStatus.trailerId === trailer.id;

                                        return (
                                            <div key={slot} className="flex justify-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={isThisSlot}
                                                        onChange={() => handleToggle(trailer, slot)}
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                                </label>
                                            </div>
                                        );
                                    })}
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

export default FleetTrailers;
