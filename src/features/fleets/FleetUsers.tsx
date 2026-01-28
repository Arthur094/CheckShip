
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter, X } from 'lucide-react';
import MultiSelectDropdown from '../../components/common/MultiSelectDropdown';

interface FleetUsersProps {
    vehicleId: string | null;
    onEnsureExists: () => Promise<string | null>;
}

interface User {
    id: string;
    full_name: string;
    role: string;
    active: boolean;
}

interface Option {
    id: string;
    label: string;
}

interface Filters {
    userTypes: string[];
    vehicleTypes: string[];
    vehicles: string[];
    checklists: string[];
    active: string[];
    show: string[]; // 'Selecionados', 'Não Selecionados'
}

const FleetUsers: React.FC<FleetUsersProps> = ({ vehicleId, onEnsureExists }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [assignments, setAssignments] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    // Filter Options Data
    const [allVehicleTypes, setAllVehicleTypes] = useState<Option[]>([]);
    const [allVehicles, setAllVehicles] = useState<Option[]>([]);
    const [allChecklists, setAllChecklists] = useState<Option[]>([]);

    // User mappings for filters
    const [userVehicles, setUserVehicles] = useState<Record<string, string[]>>({});
    const [userVehicleTypes, setUserVehicleTypes] = useState<Record<string, string[]>>({});
    const [userChecklists, setUserChecklists] = useState<Record<string, string[]>>({});

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [filters, setFilters] = useState<Filters>({
        userTypes: [],
        vehicleTypes: [],
        vehicles: [],
        checklists: [],
        active: [],
        show: []
    });

    const [showSelectAll, setShowSelectAll] = useState(false);

    useEffect(() => {
        fetchData();
        fetchFilterData();
    }, [vehicleId]);

    const fetchData = async () => {
        // We fetch users regardless of vehicleId to allow viewing them
        try {
            setLoading(true);

            // 1. Fetch all users
            const { data: usersData, error: usersError } = await supabase
                .from('profiles')
                .select('id, full_name, role, active')
                .order('full_name');

            if (usersError) throw usersError;
            setUsers(usersData || []);

            // 2. Fetch current assignments for this vehicle (if exists)
            if (vehicleId) {
                const { data: assignmentsData, error: assignmentsError } = await supabase
                    .from('vehicle_assignments')
                    .select('profile_id')
                    .eq('vehicle_id', vehicleId);

                if (assignmentsError) throw assignmentsError;
                setAssignments(new Set((assignmentsData || []).map(a => a.profile_id)));
            } else {
                setAssignments(new Set());
            }

        } catch (error: any) {
            console.error('Error fetching users:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchFilterData = async () => {
        try {
            // Vehicle Types
            const { data: vtData } = await supabase.from('vehicle_types').select('id, name');
            setAllVehicleTypes((vtData || []).map(t => ({ id: t.name, label: t.name }))); // Filtering by Name based on image logic, or ID? UserList uses IDs typically, but let's see. logic uses name usually for types. I'll use ID here but map relation details.

            // Vehicles
            const { data: vData } = await supabase.from('vehicles').select('id, plate, vehicle_type_id');
            setAllVehicles((vData || []).map(v => ({ id: v.id, label: v.plate })));

            // Checklists
            const { data: cData } = await supabase
                .from('checklist_templates')
                .select('id, name')
                .eq('status', 'published');
            setAllChecklists((cData || []).map(c => ({ id: c.id, label: c.name })));

            // Fetch Mappings

            // User -> Checklists
            const { data: upData } = await supabase.from('profile_checklist_permissions').select('profile_id, checklist_template_id');
            const uChecklists: Record<string, string[]> = {};
            (upData || []).forEach(r => {
                if (!uChecklists[r.profile_id]) uChecklists[r.profile_id] = [];
                uChecklists[r.profile_id].push(r.checklist_template_id);
            });
            setUserChecklists(uChecklists);

            // User -> Vehicles (Assignments)
            const { data: uvData } = await supabase.from('vehicle_assignments').select('profile_id, vehicle_id');
            const uVehicles: Record<string, string[]> = {};
            const uVTypes: Record<string, string[]> = {}; // User -> Vehicle Type Names

            // Map vehicle Types
            const vTypeMap = new Map((vData || []).map(v => [v.id, (vtData || []).find(t => t.id === v.vehicle_type_id)?.name]));

            (uvData || []).forEach(r => {
                // Vehicle IDs
                if (!uVehicles[r.profile_id]) uVehicles[r.profile_id] = [];
                uVehicles[r.profile_id].push(r.vehicle_id);

                // Derived Vehicle Types
                const tName = vTypeMap.get(r.vehicle_id);
                if (tName) {
                    if (!uVTypes[r.profile_id]) uVTypes[r.profile_id] = [];
                    if (!uVTypes[r.profile_id].includes(tName)) uVTypes[r.profile_id].push(tName);
                }
            });
            setUserVehicles(uVehicles);
            setUserVehicleTypes(uVTypes);

        } catch (error) {
            console.error('Error fetching filter data', error);
        }
    };

    const handleToggleLink = async (profileId: string, isLinked: boolean) => {
        let currentVehicleId = vehicleId;
        if (!currentVehicleId) {
            currentVehicleId = await onEnsureExists();
            if (!currentVehicleId) return;
        }

        try {
            if (isLinked) {
                // Remove
                const { error } = await supabase
                    .from('vehicle_assignments')
                    .delete()
                    .match({ vehicle_id: currentVehicleId, profile_id: profileId });
                if (error) throw error;
                const newSet = new Set(assignments);
                newSet.delete(profileId);
                setAssignments(newSet);
            } else {
                // Add
                const { error } = await supabase
                    .from('vehicle_assignments')
                    .insert({ vehicle_id: currentVehicleId, profile_id: profileId });
                if (error) throw error;
                const newSet = new Set(assignments);
                newSet.add(profileId);
                setAssignments(newSet);
            }
        } catch (error: any) {
            alert('Erro ao atualizar vínculo: ' + error.message);
        }
    };

    // Filter Logic
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                user.full_name.toLowerCase().includes(searchLower) ||
                user.role.toLowerCase().includes(searchLower);

            const matchesUserType = filters.userTypes.length === 0 || filters.userTypes.includes(user.role);

            const matchesActive = filters.active.length === 0 ||
                (filters.active.includes('Sim') && user.active) ||
                (filters.active.includes('Não') && !user.active);

            // Complex Filters
            const matchesVehicleTypes = filters.vehicleTypes.length === 0 ||
                (userVehicleTypes[user.id] && filters.vehicleTypes.some(t => userVehicleTypes[user.id].includes(t)));

            const matchesVehicles = filters.vehicles.length === 0 ||
                (userVehicles[user.id] && filters.vehicles.some(v => userVehicles[user.id].includes(v)));

            const matchesChecklists = filters.checklists.length === 0 ||
                (userChecklists[user.id] && filters.checklists.some(c => userChecklists[user.id].includes(c)));

            // Show (Selected / Not Selected)
            let matchesShow = true;
            if (filters.show.length > 0) {
                const isLinked = assignments.has(user.id);
                if (filters.show.includes('Selecionados') && !filters.show.includes('Não Selecionados')) matchesShow = isLinked;
                else if (filters.show.includes('Não Selecionados') && !filters.show.includes('Selecionados')) matchesShow = !isLinked;
            }

            return matchesSearch && matchesUserType && matchesActive && matchesVehicleTypes && matchesVehicles && matchesChecklists && matchesShow;
        });
    }, [users, searchTerm, filters, userVehicleTypes, userVehicles, userChecklists, assignments]);

    const handleSelectAll = async () => {
        let currentVehicleId = vehicleId;
        if (!currentVehicleId) {
            currentVehicleId = await onEnsureExists();
            if (!currentVehicleId) return;
        }

        if (!confirm(`Deseja vincular TODOS os ${filteredUsers.length} usuários listados a este veículo?`)) return;

        try {
            setLoading(true);
            const toAdd = filteredUsers
                .filter(u => !assignments.has(u.id))
                .map(u => ({ vehicle_id: currentVehicleId, profile_id: u.id }));

            if (toAdd.length > 0) {
                const { error } = await supabase.from('vehicle_assignments').upsert(toAdd, { onConflict: 'vehicle_id, profile_id', ignoreDuplicates: true });
                if (error) throw error;

                const newSet = new Set(assignments);
                toAdd.forEach(a => newSet.add(a.profile_id));
                setAssignments(newSet);
            }
            alert('Vínculos atualizados!');
        } catch (error: any) {
            alert('Erro ao vincular em massa: ' + error.message);
        } finally {
            setLoading(false);
            setShowSelectAll(false);
        }
    };

    // Helper to clear filters
    const handleClearFilters = () => setFilters({ userTypes: [], vehicleTypes: [], vehicles: [], checklists: [], active: [], show: [] });
    const hasActiveFilters = (Object.values(filters) as string[][]).some(f => f.length > 0);
    const handleFilterToggle = (key: string) => setActiveFilter(activeFilter === key ? null : key);


    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Search & Filter Bar */}
            <div className="px-8 py-4 bg-white border-b border-slate-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar usuário..."
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <MultiSelectDropdown
                            title="Tipo de Usuário"
                            options={[{ id: 'GESTOR', label: 'Gestor' }, { id: 'MOTORISTA', label: 'Motorista' }]} // Add more if needed
                            selected={filters.userTypes}
                            onChange={(s) => setFilters(prev => ({ ...prev, userTypes: s }))}
                            isOpen={activeFilter === 'userTypes'}
                            onToggle={() => handleFilterToggle('userTypes')}
                        />
                        <MultiSelectDropdown
                            title="Tipos de Operação" // That they are already assigned to
                            options={allVehicleTypes}
                            selected={filters.vehicleTypes}
                            onChange={(s) => setFilters(prev => ({ ...prev, vehicleTypes: s }))}
                            isOpen={activeFilter === 'vehicleTypes'}
                            onToggle={() => handleFilterToggle('vehicleTypes')}
                        />
                        <MultiSelectDropdown
                            title="Veículos" // That they are already assigned to
                            options={allVehicles}
                            selected={filters.vehicles}
                            onChange={(s) => setFilters(prev => ({ ...prev, vehicles: s }))}
                            isOpen={activeFilter === 'vehicles'}
                            onToggle={() => handleFilterToggle('vehicles')}
                            searchPlaceholder="Buscar veículo..."
                        />
                        <MultiSelectDropdown
                            title="Checklist" // Assigned checklists
                            options={allChecklists}
                            selected={filters.checklists}
                            onChange={(s) => setFilters(prev => ({ ...prev, checklists: s }))}
                            isOpen={activeFilter === 'checklists'}
                            onToggle={() => handleFilterToggle('checklists')}
                            searchPlaceholder="Buscar checklist..."
                        />
                        <MultiSelectDropdown
                            title="Ativo"
                            options={[{ id: 'Sim', label: 'Sim' }, { id: 'Não', label: 'Não' }]}
                            selected={filters.active}
                            onChange={(s) => setFilters(prev => ({ ...prev, active: s }))}
                            isOpen={activeFilter === 'active'}
                            onToggle={() => handleFilterToggle('active')}
                        />
                        <MultiSelectDropdown
                            title="Exibir"
                            options={[{ id: 'Selecionados', label: 'Selecionados' }, { id: 'Não Selecionados', label: 'Não Selecionados' }]}
                            selected={filters.show}
                            onChange={(s) => setFilters(prev => ({ ...prev, show: s }))}
                            isOpen={activeFilter === 'show'}
                            onToggle={() => handleFilterToggle('show')}
                        />
                    </div>
                    <div className="flex items-center justify-end gap-3">
                        <button onClick={handleClearFilters} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Limpar</button>
                        <button onClick={() => setShowFilterPanel(false)} className="px-6 py-2 bg-blue-900 text-white text-sm font-bold rounded-lg hover:bg-blue-800">Filtrar</button>
                    </div>
                </div>
            )}

            {/* Active Filters */}
            {hasActiveFilters && (
                <div className="bg-slate-100 px-8 py-3 border-b border-slate-200 flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-slate-600">Filtros ativos:</span>
                    {Object.entries(filters).map(([key, value]) => {
                        const list = value as string[];
                        if (list.length === 0) return null;
                        let label = key;
                        if (key === 'userTypes') label = 'Tipo Usuário';
                        if (key === 'vehicleTypes') label = 'Tipo Operação';
                        if (key === 'vehicles') label = 'Veículo';
                        if (key === 'checklists') label = 'Checklist';
                        if (key === 'active') label = 'Ativo';
                        if (key === 'show') label = 'Exibir';
                        return (
                            <span key={key} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs">
                                {label} ({list.length})
                                <button onClick={() => setFilters(prev => ({ ...prev, [key]: [] }))} className="hover:text-red-600"><X size={14} /></button>
                            </span>
                        );
                    })}
                </div>
            )}

            <div className="flex-1 overflow-y-auto px-8 py-8">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase rounded-t-lg">
                        <div className="col-span-6">Usuário</div>
                        <div className="col-span-4">Tipo de Usuário</div>
                        <div className="col-span-2 text-right relative group/header">
                            <span className="cursor-pointer group-hover/header:hidden">Vincular</span>
                            <div className="hidden group-hover/header:flex absolute right-0 top-1/2 -translate-y-1/2 items-center gap-2"
                                onMouseEnter={() => setShowSelectAll(true)}
                                onMouseLeave={() => setShowSelectAll(false)}>
                                <button onClick={handleSelectAll} className="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded shadow-sm hover:bg-blue-700 transition-all whitespace-nowrap">
                                    TODOS
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {filteredUsers.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">Nenhum usuário encontrado.</div>
                        ) : (
                            filteredUsers.map((user) => {
                                const isLinked = assignments.has(user.id);
                                return (
                                    <div key={user.id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors ${isLinked ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                                        <div className="col-span-6 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 text-xs font-bold">
                                                {user.full_name?.split(' ').slice(0, 2).map(n => n[0]).join('') || '?'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-700">{user.full_name}</div>
                                                {user.active === false && <span className="text-[10px] text-red-500 font-bold">Inativo</span>}
                                            </div>
                                        </div>
                                        <div className="col-span-4 text-sm">
                                            <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold uppercase tracking-wider text-slate-500">{user.role}</span>
                                        </div>
                                        <div className="col-span-2 flex justify-end">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={isLinked}
                                                    onChange={() => handleToggleLink(user.id, isLinked)}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                            </label>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        {loading && (
                            <div className="p-8 text-center text-slate-400">
                                <div className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mb-1"></div>
                                <p className="text-xs">Carregando...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FleetUsers;
