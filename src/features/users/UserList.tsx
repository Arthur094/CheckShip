
import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Pencil,
    X,
    Trash2,
    Cloud,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import MultiSelectDropdown from '../../components/common/MultiSelectDropdown';

interface User {
    id: string;
    full_name: string;
    role: string;
    email: string;
    active: boolean;
    document?: string;
    phone?: string;
}

interface Vehicle {
    id: string;
    plate: string;
}

interface Checklist {
    id: string;
    name: string;
}

interface UserListProps {
    onNew: () => void;
    onEdit: (user: User) => void;
}

interface Filters {
    vehicles: string[];
    checklists: string[];
    userTypes: string[];
    active: string[];
}

const UserList: React.FC<UserListProps> = ({ onNew, onEdit }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    // Selection state
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [showSelectAll, setShowSelectAll] = useState(false);
    const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);

    // Filter data
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [userVehicles, setUserVehicles] = useState<Record<string, string[]>>({});
    const [userChecklists, setUserChecklists] = useState<Record<string, string[]>>({});

    // Filter selections
    const [filters, setFilters] = useState<Filters>({
        vehicles: [],
        checklists: [],
        userTypes: [],
        active: []
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name');

            if (error) throw error;
            setUsers(data || []);
        } catch (error: any) {
            console.error('Error fetching users:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicles = async () => {
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select('id, plate')
                .order('plate');

            if (error) throw error;
            setVehicles(data || []);
        } catch (error: any) {
            console.error('Error fetching vehicles:', error.message);
        }
    };

    const fetchChecklists = async () => {
        try {
            const { data, error } = await supabase
                .from('checklist_templates')
                .select('id, name')
                .order('name');

            if (error) throw error;
            setChecklists(data || []);
        } catch (error: any) {
            console.error('Error fetching checklists:', error.message);
        }
    };

    const fetchUserVehicles = async () => {
        try {
            const { data, error } = await supabase
                .from('vehicle_assignments')
                .select('profile_id, vehicle_id')
                .eq('active', true);

            if (error) throw error;

            const mapping: Record<string, string[]> = {};
            (data || []).forEach(item => {
                if (!mapping[item.profile_id]) {
                    mapping[item.profile_id] = [];
                }
                mapping[item.profile_id].push(item.vehicle_id);
            });

            setUserVehicles(mapping);
        } catch (error: any) {
            console.error('Error fetching user vehicles:', error.message);
        }
    };

    const fetchUserChecklists = async () => {
        try {
            const { data, error } = await supabase
                .from('profile_checklist_permissions')
                .select('profile_id, checklist_template_id');

            if (error) throw error;

            const mapping: Record<string, string[]> = {};
            (data || []).forEach(item => {
                if (!mapping[item.profile_id]) {
                    mapping[item.profile_id] = [];
                }
                mapping[item.profile_id].push(item.checklist_template_id);
            });

            setUserChecklists(mapping);
        } catch (error: any) {
            console.error('Error fetching user checklists:', error.message);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchVehicles();
        fetchChecklists();
        fetchUserVehicles();
        fetchUserChecklists();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            // Search filter
            const matchesSearch = searchTerm === '' ||
                user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase());

            // Vehicle filter
            const matchesVehicles = filters.vehicles.length === 0 ||
                (userVehicles[user.id] && filters.vehicles.some(v => userVehicles[user.id].includes(v)));

            // Checklist filter
            const matchesChecklists = filters.checklists.length === 0 ||
                (userChecklists[user.id] && filters.checklists.some(c => userChecklists[user.id].includes(c)));

            // User type filter
            const matchesUserType = filters.userTypes.length === 0 ||
                filters.userTypes.includes(user.role);

            // Active status filter
            const matchesActive = filters.active.length === 0 ||
                (filters.active.includes('Sim') && user.active) ||
                (filters.active.includes('Não') && !user.active);

            return matchesSearch && matchesVehicles && matchesChecklists && matchesUserType && matchesActive;
        });
    }, [users, searchTerm, filters, userVehicles, userChecklists]);

    const getInitials = (name: string) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const handleDelete = async (user: User) => {
        if (confirm(`Tem certeza que gostaria de excluir este usuário? (${user.full_name})`)) {
            try {
                setLoading(true);
                const { error } = await supabase.functions.invoke('admin-delete-user', {
                    body: { user_id: user.id }
                });

                if (error) throw error;

                alert('Usuário excluído com sucesso.');
                fetchUsers();
            } catch (error: any) {
                console.error('Erro ao excluir usuário:', error);
                alert('Erro ao excluir usuário: ' + error.message);
                setLoading(false);
            }
        }
        setOpenMenuUserId(null);
    };

    const handleDeactivate = async (user: User) => {
        const newStatus = !user.active;
        const action = newStatus ? 'ativar' : 'desativar';

        if (confirm(`Tem certeza que gostaria de ${action} este usuário? (${user.full_name})`)) {
            try {
                setLoading(true);
                const { error } = await supabase
                    .from('profiles')
                    .update({ active: newStatus })
                    .eq('id', user.id);

                if (error) throw error;

                alert(`Usuário ${action}do com sucesso.`);
                fetchUsers();
            } catch (error: any) {
                console.error(`Erro ao ${action} usuário:`, error);
                alert(`Erro ao ${action} usuário: ` + error.message);
                setLoading(false);
            }
        }
        setOpenMenuUserId(null);
    };

    const handleFilterToggle = (filterName: string) => {
        setActiveFilter(activeFilter === filterName ? null : filterName);
    };

    const handleClearFilters = () => {
        setFilters({
            vehicles: [],
            checklists: [],
            userTypes: [],
            active: []
        });
    };

    // Selection functions
    const handleSelectUser = (userId: string) => {
        const newSelection = new Set(selectedUsers);
        if (newSelection.has(userId)) {
            newSelection.delete(userId);
        } else {
            newSelection.add(userId);
        }
        setSelectedUsers(newSelection);
    };

    const handleSelectAll = () => {
        const allUserIds = filteredUsers.map(u => u.id);
        setSelectedUsers(new Set(allUserIds));
        setShowSelectAll(false);
    };

    const handleDeselectAll = () => {
        setSelectedUsers(new Set());
    };

    // Bulk actions
    const handleBulkDelete = async () => {
        if (selectedUsers.size === 0) return;

        const confirmed = window.confirm(
            `Tem certeza que deseja excluir ${selectedUsers.size} usuários selecionados?`
        );

        if (!confirmed) return;

        try {
            setLoading(true);

            // Delete each user
            const deletePromises = Array.from(selectedUsers).map(userId =>
                supabase.functions.invoke('admin-delete-user', {
                    body: { user_id: userId }
                })
            );

            await Promise.all(deletePromises);

            alert(`${selectedUsers.size} usuários excluídos com sucesso.`);
            setSelectedUsers(new Set());
            fetchUsers();
        } catch (error: any) {
            console.error('Erro ao excluir usuários:', error);
            alert('Erro ao excluir usuários: ' + error.message);
            setLoading(false);
        }
    };

    const handleBulkToggleActive = async () => {
        if (selectedUsers.size === 0) return;

        const selectedUsersData = users.filter(u => selectedUsers.has(u.id));
        const allActive = selectedUsersData.every(u => u.active);
        const action = allActive ? 'inativar' : 'ativar';
        const newStatus = !allActive;

        const confirmed = window.confirm(
            `Tem certeza que deseja ${action} ${selectedUsers.size} usuários selecionados?`
        );

        if (!confirmed) return;

        try {
            setLoading(true);

            // Update active status for all selected users
            const { error } = await supabase
                .from('profiles')
                .update({ active: newStatus })
                .in('id', Array.from(selectedUsers));

            if (error) throw error;

            alert(`${selectedUsers.size} usuários ${action}dos com sucesso.`);
            setSelectedUsers(new Set());
            fetchUsers();
        } catch (error: any) {
            console.error('Erro ao atualizar usuários:', error);
            alert('Erro ao atualizar usuários: ' + error.message);
            setLoading(false);
        }
    };

    const handleBulkExport = () => {
        if (selectedUsers.size === 0) return;

        const confirmed = window.confirm(
            `Exportar ${selectedUsers.size} usuários selecionados para planilha?`
        );

        if (!confirmed) return;

        try {
            const selectedUsersData = users.filter(u => selectedUsers.has(u.id));

            // Create CSV content
            const headers = ['Nome completo', 'E-mail', 'Cargo', 'Documento', 'Telefone'];
            const rows = selectedUsersData.map(user => [
                user.full_name || '',
                user.email || '',
                user.role || '',
                user.document || '',
                user.phone || ''
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert(`${selectedUsers.size} usuários exportados com sucesso.`);
        } catch (error: any) {
            console.error('Erro ao exportar usuários:', error);
            alert('Erro ao exportar usuários: ' + error.message);
        }
    };

    const hasActiveFilters = filters.vehicles.length > 0 ||
        filters.checklists.length > 0 ||
        filters.userTypes.length > 0 ||
        filters.active.length > 0;

    const vehicleOptions = vehicles.map(v => ({ id: v.id, label: v.plate }));
    const checklistOptions = checklists.map(c => ({ id: c.id, label: c.name }));
    const userTypeOptions = [
        { id: 'MOTORISTA', label: 'Motorista' },
        { id: 'GESTOR', label: 'Gestor' }
    ];
    const activeOptions = [
        { id: 'Sim', label: 'Sim' },
        { id: 'Não', label: 'Não' }
    ];

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="bg-white px-8 py-5 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-slate-800">Usuários</h1>
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
                        placeholder="Buscar por nome ou e-mail..."
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
                            title="Veículos"
                            options={vehicleOptions}
                            selected={filters.vehicles}
                            onChange={(selected) => setFilters({ ...filters, vehicles: selected })}
                            searchPlaceholder="Digite para pesquisar"
                            isOpen={activeFilter === 'vehicles'}
                            onToggle={() => handleFilterToggle('vehicles')}
                        />

                        <MultiSelectDropdown
                            title="Checklists"
                            options={checklistOptions}
                            selected={filters.checklists}
                            onChange={(selected) => setFilters({ ...filters, checklists: selected })}
                            searchPlaceholder="Digite para pesquisar"
                            isOpen={activeFilter === 'checklists'}
                            onToggle={() => handleFilterToggle('checklists')}
                        />

                        <MultiSelectDropdown
                            title="Tipo de Usuário"
                            options={userTypeOptions}
                            selected={filters.userTypes}
                            onChange={(selected) => setFilters({ ...filters, userTypes: selected })}
                            searchPlaceholder="Digite para pesquisar"
                            isOpen={activeFilter === 'userTypes'}
                            onToggle={() => handleFilterToggle('userTypes')}
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
                            <button onClick={() => setFilters({ ...filters, vehicles: [] })} className="hover:text-red-600">
                                <X size={14} />
                            </button>
                        </span>
                    )}
                    {filters.checklists.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs">
                            Checklists ({filters.checklists.length})
                            <button onClick={() => setFilters({ ...filters, checklists: [] })} className="hover:text-red-600">
                                <X size={14} />
                            </button>
                        </span>
                    )}
                    {filters.userTypes.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs">
                            Tipo ({filters.userTypes.length})
                            <button onClick={() => setFilters({ ...filters, userTypes: [] })} className="hover:text-red-600">
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
                </div>
            )}

            {/* List content */}
            <div className="flex-1 overflow-x-auto p-8">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden min-w-[800px]">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                        <div
                            className="col-span-4 flex items-center gap-2 relative"
                            onMouseEnter={() => setShowSelectAll(true)}
                            onMouseLeave={() => setShowSelectAll(false)}
                        >
                            {showSelectAll && selectedUsers.size === 0 && (
                                <button
                                    onClick={handleSelectAll}
                                    className="absolute -left-1 px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded shadow-sm hover:bg-blue-700 transition-all z-10"
                                >
                                    SELECIONAR TODOS
                                </button>
                            )}
                            {selectedUsers.size > 0 && (
                                <button
                                    onClick={handleDeselectAll}
                                    className="mr-2 text-blue-600 hover:text-blue-800"
                                    title="Desmarcar todos"
                                >
                                    <X size={16} />
                                </button>
                            )}
                            Nome
                        </div>
                        <div className="col-span-3">Cargo</div>
                        <div className="col-span-3">E-mail</div>
                        <div className="col-span-2 text-right">Status</div>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y divide-slate-100">
                        {loading ? (
                            <div className="p-12 text-center text-slate-400">
                                <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
                                <p className="text-sm">Carregando usuários...</p>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-12 text-center text-slate-400">
                                <p className="text-sm">Nenhum usuário encontrado.</p>
                            </div>
                        ) : (
                            filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="col-span-4 flex items-center gap-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.has(user.id)}
                                            onChange={() => handleSelectUser(user.id)}
                                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                        <div className={`w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 text-xs font-bold tracking-wide`}>
                                            {getInitials(user.full_name)}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">{user.full_name || 'Sem Nome'}</span>
                                    </div>

                                    <div className="col-span-3 text-sm text-slate-600">
                                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                            {user.role}
                                        </span>
                                    </div>

                                    <div className="col-span-3 text-sm text-slate-600 truncate">
                                        {user.email}
                                    </div>

                                    <div className="col-span-2 flex items-center justify-end gap-3 text-right">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {user.active ? 'Ativo' : 'Inativo'}
                                        </span>

                                        {/* Hover Actions */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                            <button
                                                onClick={() => onEdit(user)}
                                                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-blue-900 transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            {/* Dropdown Menu */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenMenuUserId(openMenuUserId === user.id ? null : user.id)}
                                                    className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                                                    title="Mais opções"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                {openMenuUserId === user.id && (
                                                    <>
                                                        {/* Backdrop */}
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setOpenMenuUserId(null)}
                                                        />

                                                        {/* Menu */}
                                                        <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden">
                                                            <button
                                                                onClick={() => handleDeactivate(user)}
                                                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                                                            >
                                                                {user.active ? (
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
                                                                onClick={() => handleDelete(user)}
                                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
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

            {/* Floating Action Bar */}
            {selectedUsers.size > 0 && (
                <div className="sticky bottom-0 bg-white border-t border-slate-200 px-8 py-4 flex items-center justify-between shadow-lg">
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
                            {users.filter(u => selectedUsers.has(u.id)).every(u => u.active) ? (
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
                        {selectedUsers.size} de {filteredUsers.length} selecionado{selectedUsers.size !== 1 ? 's' : ''}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;
