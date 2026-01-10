
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ChecklistUsersProps {
    checklistId: string | null;
    onEnsureExists: () => Promise<boolean>;
}

interface ChecklistPermission {
    profile_id: string;
    can_apply: boolean;
    view_report: boolean;
    receive_email: boolean;
}

const ChecklistUsers: React.FC<ChecklistUsersProps> = ({ checklistId, onEnsureExists }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [permissions, setPermissions] = useState<Record<string, ChecklistPermission>>({});
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!checklistId || checklistId.startsWith('chk_')) {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .order('full_name');

            if (!error) setUsers(data || []);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // 1. Fetch all users
            const { data: usersData, error: usersError } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .order('full_name');

            if (usersError) throw usersError;

            // 2. Fetch current permissions for this checklist
            const { data: permissionsData, error: permissionsError } = await supabase
                .from('profile_checklist_permissions')
                .select('*')
                .eq('checklist_template_id', checklistId);

            if (permissionsError) throw permissionsError;

            const permissionsMap: Record<string, ChecklistPermission> = {};
            (permissionsData || []).forEach(p => {
                permissionsMap[p.profile_id] = {
                    profile_id: p.profile_id,
                    can_apply: p.can_apply,
                    view_report: p.view_report,
                    receive_email: p.receive_email
                };
            });

            setUsers(usersData || []);
            setPermissions(permissionsMap);
        } catch (error: any) {
            console.error('Error fetching data:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [checklistId]);

    const handleToggle = async (profileId: string, field: keyof Omit<ChecklistPermission, 'profile_id'>) => {
        const exists = await onEnsureExists();
        if (!exists || !checklistId) return;

        const current = permissions[profileId] || {
            profile_id: profileId,
            can_apply: false,
            view_report: false,
            receive_email: false
        };

        const updated = {
            ...current,
            [field]: !current[field]
        };

        const shouldDelete = !updated.can_apply && !updated.view_report && !updated.receive_email;

        try {
            if (shouldDelete) {
                const { error } = await supabase
                    .from('profile_checklist_permissions')
                    .delete()
                    .match({ profile_id: profileId, checklist_template_id: checklistId });

                if (error) throw error;

                const newPermissions = { ...permissions };
                delete newPermissions[profileId];
                setPermissions(newPermissions);
            } else {
                const { error } = await supabase
                    .from('profile_checklist_permissions')
                    .upsert({
                        profile_id: profileId,
                        checklist_template_id: checklistId,
                        can_apply: updated.can_apply,
                        view_report: updated.view_report,
                        receive_email: updated.receive_email
                    }, { onConflict: 'profile_id, checklist_template_id' });

                if (error) throw error;

                setPermissions(prev => ({
                    ...prev,
                    [profileId]: updated
                }));
            }
        } catch (error: any) {
            console.error('Error updating permissions:', error.message);
            alert('Erro ao atualizar permissão: ' + error.message);
        }
    };

    const handleBulkToggle = async (field: keyof Omit<ChecklistPermission, 'profile_id'>) => {
        const exists = await onEnsureExists();
        if (!exists || !checklistId || filteredUsers.length === 0) return;

        const currentStates = filteredUsers.map(u => {
            const perm = permissions[u.id];
            return perm ? perm[field] : false;
        });

        const allAreTrue = currentStates.every(s => s === true);
        const targetValue = !allAreTrue;

        try {
            const updates = filteredUsers.map(user => {
                const current = permissions[user.id] || {
                    profile_id: user.id,
                    can_apply: false,
                    view_report: false,
                    receive_email: false
                };

                return {
                    profile_id: user.id,
                    checklist_template_id: checklistId,
                    can_apply: field === 'can_apply' ? targetValue : current.can_apply,
                    view_report: field === 'view_report' ? targetValue : current.view_report,
                    receive_email: field === 'receive_email' ? targetValue : current.receive_email
                };
            });

            const toDelete = updates.filter(u => !u.can_apply && !u.view_report && !u.receive_email);
            const toUpsert = updates.filter(u => u.can_apply || u.view_report || u.receive_email);

            if (toDelete.length > 0) {
                await Promise.all(toDelete.map(u =>
                    supabase.from('profile_checklist_permissions').delete().match({ profile_id: u.profile_id, checklist_template_id: checklistId })
                ));
            }

            if (toUpsert.length > 0) {
                const { error } = await supabase
                    .from('profile_checklist_permissions')
                    .upsert(toUpsert, { onConflict: 'profile_id, checklist_template_id' });

                if (error) throw error;
            }

            const newPermissions = { ...permissions };
            filteredUsers.forEach(u => {
                const current = permissions[u.id] || {
                    profile_id: u.id,
                    can_apply: false,
                    view_report: false,
                    receive_email: false
                };

                if (targetValue === false &&
                    ((field === 'can_apply' && !current.view_report && !current.receive_email) ||
                        (field === 'view_report' && !current.can_apply && !current.receive_email) ||
                        (field === 'receive_email' && !current.can_apply && !current.view_report))) {
                    delete newPermissions[u.id];
                } else {
                    newPermissions[u.id] = {
                        ...current,
                        [field]: targetValue
                    };
                }
            });

            setPermissions(newPermissions);
            alert(`Ação em massa concluída: ${targetValue ? 'Marcados' : 'Desmarcados'}`);

        } catch (error: any) {
            console.error('Error bulk updating:', error.message);
            alert('Erro ao atualizar em massa: ' + error.message);
        }
    };

    const filteredUsers = users.filter(u =>
        u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="p-12 text-center text-slate-400">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
                <p className="text-sm">Carregando usuários...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="px-8 py-6">
                <div className="relative flex items-center bg-white rounded-lg border border-slate-200 shadow-sm">
                    <Search size={20} className="absolute left-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar usuário"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                        <div className="col-span-6 text-left pl-2">Usuário</div>
                        <div className="col-span-2 text-center group flex items-center justify-center gap-2 cursor-pointer" onClick={() => handleBulkToggle('can_apply')}>
                            <span className="group-hover:hidden">Aplica</span>
                            <span className="hidden group-hover:block text-blue-600 font-extrabold text-[10px] tracking-wide bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shadow-sm transition-all">MARCAR TODOS</span>
                        </div>
                        <div className="col-span-2 text-center group flex items-center justify-center gap-2 cursor-pointer" onClick={() => handleBulkToggle('view_report')}>
                            <span className="group-hover:hidden">Relatório</span>
                            <span className="hidden group-hover:block text-blue-600 font-extrabold text-[10px] tracking-wide bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shadow-sm transition-all">MARCAR TODOS</span>
                        </div>
                        <div className="col-span-2 text-center group flex items-center justify-center gap-2 cursor-pointer" onClick={() => handleBulkToggle('receive_email')}>
                            <span className="group-hover:hidden">E-mail</span>
                            <span className="hidden group-hover:block text-blue-600 font-extrabold text-[10px] tracking-wide bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shadow-sm transition-all">MARCAR TODOS</span>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {filteredUsers.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                Nenhum usuário encontrado.
                            </div>
                        ) : (
                            filteredUsers.map((user) => {
                                const perm = permissions[user.id] || { can_apply: false, view_report: false, receive_email: false };
                                return (
                                    <div key={user.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
                                        <div className="col-span-6 text-sm text-slate-700 font-medium">
                                            {user.full_name}
                                            <div className="text-[10px] text-slate-400 font-normal">{user.role}</div>
                                        </div>
                                        <div className="col-span-2 flex justify-center">
                                            <Toggle
                                                checked={perm.can_apply}
                                                onChange={() => handleToggle(user.id, 'can_apply')}
                                            />
                                        </div>
                                        <div className="col-span-2 flex justify-center">
                                            <Toggle
                                                checked={perm.view_report}
                                                onChange={() => handleToggle(user.id, 'view_report')}
                                            />
                                        </div>
                                        <div className="col-span-2 flex justify-center">
                                            <Toggle
                                                checked={perm.receive_email}
                                                onChange={() => handleToggle(user.id, 'receive_email')}
                                            />
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

const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input
            type="checkbox"
            className="sr-only peer"
            checked={checked}
            onChange={onChange}
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
    </label>
);

export default ChecklistUsers;
