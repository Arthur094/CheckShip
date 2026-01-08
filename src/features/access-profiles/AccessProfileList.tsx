
import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    MoreVertical,
    Trash2,
    Ban,
    ChevronDown
} from 'lucide-react';

interface AccessProfile {
    id: string;
    name: string;
}

interface AccessProfileListProps {
    onNew: () => void;
    onEdit: (profile: AccessProfile) => void;
}

const AccessProfileList: React.FC<AccessProfileListProps> = ({ onNew, onEdit }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    // Mock data
    const profiles: AccessProfile[] = [
        { id: '1', name: 'Administrador' },
        { id: '2', name: 'GM - Diretor Financeiro' },
        { id: '3', name: 'GM Green | Consultor de Vendas' },
        { id: '4', name: 'GM Green | Faturamento' },
        { id: '5', name: 'GM Green | Logística' },
        { id: '6', name: 'GM Postos | Gerente de Pista' },
        { id: '7', name: 'GM Postos | Gerente de Posto' },
        { id: '8', name: 'GM Postos | Monitoramento' },
    ];

    const filteredProfiles = profiles.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setActiveMenuId(activeMenuId === id ? null : id);
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-800">Perfis de Acesso</h1>
                <button
                    onClick={onNew}
                    className="bg-blue-900 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-blue-800 transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    NOVO
                </button>
            </div>

            {/* Search Bar */}
            <div className="px-8 py-4">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder:text-slate-400"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <div className="flex flex-col gap-[2px]">
                            <div className="w-4 h-[1px] bg-current"></div>
                            <div className="w-3 h-[1px] bg-current"></div>
                            <div className="w-2 h-[1px] bg-current"></div>
                        </div>
                    </button>
                </div>
            </div>

            {/* List Header */}
            <div className="px-8 py-3 bg-slate-50 border-y border-slate-200 flex items-center">
                <div className="w-8 flex items-center justify-center mr-4">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900" />
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:text-slate-700">
                    Nome
                    <ChevronDown size={14} />
                </div>
            </div>

            {/* List Items */}
            <div className="flex-1 overflow-y-auto">
                {filteredProfiles.map((profile) => (
                    <div
                        key={profile.id}
                        onClick={() => onEdit(profile)}
                        className="group px-8 py-4 border-b border-slate-100 flex items-center hover:bg-slate-50 cursor-pointer transition-colors relative"
                    >
                        <div className="w-8 flex items-center justify-center mr-4" onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900" />
                        </div>
                        <span className="text-sm text-slate-700 font-medium flex-1">{profile.name}</span>

                        {/* Hover Actions */}
                        <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-opacity ${activeMenuId === profile.id ? 'opacity-100 z-20' : 'opacity-0 group-hover:opacity-100'}`}>
                            <div className="relative">
                                <button
                                    onClick={(e) => toggleMenu(e, profile.id)}
                                    className={`p-2 rounded-full text-slate-500 hover:text-slate-700 transition-colors ${activeMenuId === profile.id ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-100'}`}
                                >
                                    <MoreVertical size={18} />
                                </button>

                                {/* Dropdown Menu */}
                                {activeMenuId === profile.id && (
                                    <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}
                                            className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                        >
                                            <Trash2 size={14} />
                                            Excluir
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}
                                            className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                        >
                                            <Ban size={14} />
                                            Desativar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AccessProfileList;
