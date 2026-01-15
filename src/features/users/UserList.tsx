
import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Pencil,
    User as UserIcon
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface User {
    id: string;
    full_name: string;
    role: string;
    email: string;
    active: boolean;
}

interface UserListProps {
    onNew: () => void;
    onEdit: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ onNew, onEdit }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name');

            console.log('Fetched users:', data);
            console.log('Fetch error:', error);

            if (error) throw error;
            setUsers(data || []);
        } catch (error: any) {
            console.error('Error fetching users:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u =>
        (u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    );

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
    };

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
                    <button className="absolute right-4 text-slate-400 hover:text-blue-900 transition-colors">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* List content */}
            <div className="flex-1 overflow-x-auto p-8">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden min-w-[800px]">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                        <div className="col-span-4 flex items-center gap-2">
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
                                            <button
                                                onClick={() => handleDelete(user)}
                                                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-red-600 transition-colors"
                                                title="Excluir"
                                            >
                                                <MoreVertical size={16} className="hidden" /> {/* Mantendo alinhamento se necessário, ou usar Trash */}
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserList;
