
import React, { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Pencil
} from 'lucide-react';

interface User {
    id: string;
    name: string;
    type: string;
    email: string;
    initials: string;
    bgColor: string;
}

interface UserListProps {
    onNew: () => void;
    onEdit: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ onNew, onEdit }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data
    const users: User[] = [
        { id: '1', name: 'Admin', type: 'Administrador', email: 'arthur.sousa@nativa.inf.br', initials: 'AA', bgColor: 'bg-emerald-500' },
        { id: '2', name: 'Arthur Matos Sousa', type: 'GM Transportadora | Logística', email: 'ArthurTeste', initials: 'AS', bgColor: 'bg-cyan-500' },
        { id: '3', name: 'Carolina Almeida', type: 'GM | Recursos Humanos', email: 'gestaodepessoas@grupomagnolia.com.br', initials: 'CA', bgColor: 'bg-emerald-500' },
        { id: '4', name: 'Diego Rodrigues', type: 'GM Transportadora | Manutenção', email: 'manutencaorolim@grupomagnolia.com.br', initials: 'DR', bgColor: 'bg-cyan-500' },
        { id: '5', name: 'Fagner Frazão', type: 'GM | TI', email: 'fagnerfrazao@grupomagnolia.com.br', initials: 'FF', bgColor: 'bg-cyan-500' },
        { id: '6', name: 'Fernando Rolim', type: 'GM Transportadora | Ger. Logística', email: 'fernandorolim@grupomagnolia.com.br', initials: 'FR', bgColor: 'bg-cyan-500' },
        { id: '7', name: 'Jeniffer dos Santos Luz', type: 'GM Transportadora | Téc. Segurança', email: 'ssmaq@grupomagnolia.com.br', initials: 'JL', bgColor: 'bg-cyan-500' },
        { id: '8', name: 'Laurenise Araujo Ferreira', type: 'GM Transportadora | Téc. Segurança', email: 'laurenise@grupomagnolia.com.br', initials: 'LF', bgColor: 'bg-cyan-500' },
    ];

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        placeholder="Buscar"
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
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900" />
                            Nome
                        </div>
                        <div className="col-span-4">Tipo de usuário</div>
                        <div className="col-span-4">Nome de usuário</div>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y divide-slate-100">
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors group"
                            >
                                <div className="col-span-4 flex items-center gap-4">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className={`w-8 h-8 rounded-full ${user.bgColor} flex items-center justify-center text-white text-xs font-bold tracking-wide`}>
                                        {user.initials}
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">{user.name}</span>
                                </div>

                                <div className="col-span-4 text-sm text-slate-600">
                                    {user.type}
                                </div>

                                <div className="col-span-4 text-sm text-slate-600 flex items-center justify-between">
                                    {user.email}
                                    {/* Hover Actions */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                        <button
                                            onClick={() => onEdit(user)}
                                            className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-blue-900 transition-colors"
                                            title="Editar"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700">
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserList;
