
import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    MoreVertical,
    Trash2,
    ChevronDown,
    Loader2,
    Shield
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AccessProfile {
    id: string;
    name: string;
    is_admin: boolean;
    can_apply_checklists: boolean;
    can_approve_checklists: boolean;
    can_view_others_incomplete: boolean;
    can_reopen_completed: boolean;
    can_delete_checklists: boolean;
    can_comment_evaluations: boolean;
    can_view_history: boolean;
    created_at: string;
}

interface AccessProfileListProps {
    onNew: () => void;
    onEdit: (profile: AccessProfile) => void;
}

const AccessProfileList: React.FC<AccessProfileListProps> = ({ onNew, onEdit }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [profiles, setProfiles] = useState<AccessProfile[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch profiles from database
    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('access_profiles')
                .select('*')
                .order('name');

            if (error) throw error;
            setProfiles(data || []);
        } catch (error: any) {
            console.error('Erro ao carregar perfis:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const filteredProfiles = profiles.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setActiveMenuId(activeMenuId === id ? null : id);
    };

    const handleDelete = async (e: React.MouseEvent, profileId: string) => {
        e.stopPropagation();
        setActiveMenuId(null);

        if (!confirm('Tem certeza que deseja excluir este perfil?')) return;

        try {
            const { error } = await supabase
                .from('access_profiles')
                .delete()
                .eq('id', profileId);

            if (error) throw error;

            setProfiles(prev => prev.filter(p => p.id !== profileId));
        } catch (error: any) {
            console.error('Erro ao excluir perfil:', error);
            alert('Erro ao excluir perfil: ' + error.message);
        }
    };

    // Count active permissions
    const countPermissions = (profile: AccessProfile): number => {
        let count = 0;
        if (profile.can_apply_checklists) count++;
        if (profile.can_approve_checklists) count++;
        if (profile.can_view_others_incomplete) count++;
        if (profile.can_reopen_completed) count++;
        if (profile.can_delete_checklists) count++;
        if (profile.can_comment_evaluations) count++;
        if (profile.can_view_history) count++;
        return count;
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
                        placeholder="Buscar perfil..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* List Header */}
            <div className="px-8 py-3 bg-slate-50 border-y border-slate-200 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-5 flex items-center gap-1 text-xs font-bold text-slate-500 uppercase">
                    Nome
                    <ChevronDown size={14} />
                </div>
                <div className="col-span-3 text-xs font-bold text-slate-500 uppercase">
                    Tipo
                </div>
                <div className="col-span-3 text-xs font-bold text-slate-500 uppercase">
                    Permissões
                </div>
                <div className="col-span-1"></div>
            </div>

            {/* List Items */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-slate-400" size={32} />
                    </div>
                ) : filteredProfiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Shield size={48} className="mb-4 opacity-50" />
                        <p className="text-sm">Nenhum perfil encontrado</p>
                        <button onClick={onNew} className="mt-4 text-blue-900 font-bold text-sm hover:underline">
                            Criar primeiro perfil
                        </button>
                    </div>
                ) : (
                    filteredProfiles.map((profile) => (
                        <div
                            key={profile.id}
                            onClick={() => onEdit(profile)}
                            className="group px-8 py-4 border-b border-slate-100 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 cursor-pointer transition-colors relative"
                        >
                            <div className="col-span-5">
                                <span className="text-sm text-slate-800 font-medium">{profile.name}</span>
                            </div>
                            <div className="col-span-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${profile.is_admin
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {profile.is_admin ? 'Administrador' : 'Restrito'}
                                </span>
                            </div>
                            <div className="col-span-3">
                                <span className="text-sm text-slate-500">
                                    {countPermissions(profile)} permissões
                                </span>
                            </div>

                            {/* Hover Actions */}
                            <div className={`col-span-1 flex justify-end transition-opacity ${activeMenuId === profile.id ? 'opacity-100 z-20' : 'opacity-0 group-hover:opacity-100'}`}>
                                <div className="relative">
                                    <button
                                        onClick={(e) => toggleMenu(e, profile.id)}
                                        className={`p-2 rounded-full text-slate-500 hover:text-slate-700 transition-colors ${activeMenuId === profile.id ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-100'}`}
                                    >
                                        <MoreVertical size={18} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {activeMenuId === profile.id && (
                                        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                                            <button
                                                onClick={(e) => handleDelete(e, profile.id)}
                                                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <Trash2 size={14} />
                                                Excluir
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AccessProfileList;
