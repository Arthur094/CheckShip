
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface UserChecklistsProps {
    profileId: string | null;
    onEnsureExists: () => Promise<string | null>;
}

interface ChecklistPermission {
    checklist_template_id: string;
    can_apply: boolean;
    view_report: boolean;
    receive_email: boolean;
}

const UserChecklists: React.FC<UserChecklistsProps> = ({ profileId, onEnsureExists }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [templates, setTemplates] = useState<any[]>([]);
    const [permissions, setPermissions] = useState<Record<string, ChecklistPermission>>({});
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch all checklist templates
            const { data: templatesData, error: templatesError } = await supabase
                .from('checklist_templates')
                .select('id, name')
                .eq('status', 'published')
                .order('name');

            if (templatesError) throw templatesError;
            setTemplates(templatesData || []);

            // 2. Fetch current permissions for this profile (if it exists)
            if (profileId) {
                const { data: permissionsData, error: permissionsError } = await supabase
                    .from('profile_checklist_permissions')
                    .select('*')
                    .eq('profile_id', profileId);

                if (permissionsError) throw permissionsError;

                const permissionsMap: Record<string, ChecklistPermission> = {};
                (permissionsData || []).forEach(p => {
                    permissionsMap[p.checklist_template_id] = {
                        checklist_template_id: p.checklist_template_id,
                        can_apply: p.can_apply,
                        view_report: p.view_report,
                        receive_email: p.receive_email
                    };
                });
                setPermissions(permissionsMap);
            } else {
                setPermissions({});
            }
        } catch (error: any) {
            console.error('Error fetching data:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [profileId]);

    const handleToggle = async (templateId: string, field: keyof Omit<ChecklistPermission, 'checklist_template_id'>) => {
        let currentProfileId = profileId;
        if (!currentProfileId) {
            currentProfileId = await onEnsureExists();
            if (!currentProfileId) return;
        }

        const current = permissions[templateId] || {
            checklist_template_id: templateId,
            can_apply: false,
            view_report: false,
            receive_email: false
        };

        const updated = {
            ...current,
            [field]: !current[field]
        };

        // Cleanup: If all are false, delete. Otherwise, upsert.
        const shouldDelete = !updated.can_apply && !updated.view_report && !updated.receive_email;

        try {
            if (shouldDelete) {
                const { error } = await supabase
                    .from('profile_checklist_permissions')
                    .delete()
                    .match({ profile_id: currentProfileId, checklist_template_id: templateId });

                if (error) throw error;

                const newPermissions = { ...permissions };
                delete newPermissions[templateId];
                setPermissions(newPermissions);
            } else {
                const { error } = await supabase
                    .from('profile_checklist_permissions')
                    .upsert({
                        profile_id: currentProfileId,
                        checklist_template_id: templateId,
                        can_apply: updated.can_apply,
                        view_report: updated.view_report,
                        receive_email: updated.receive_email
                    }, { onConflict: 'profile_id, checklist_template_id' });

                if (error) throw error;

                setPermissions(prev => ({
                    ...prev,
                    [templateId]: updated
                }));
            }
        } catch (error: any) {
            console.error('Error updating permissions:', error.message);
            alert('Erro ao atualizar permissão: ' + error.message);
        }
    };

    const handleBulkToggle = async (field: keyof Omit<ChecklistPermission, 'checklist_template_id'>) => {
        if (filteredTemplates.length === 0) return;

        let currentProfileId = profileId;
        if (!currentProfileId) {
            currentProfileId = await onEnsureExists();
            if (!currentProfileId) return;
        }

        // Determine target state: if any is false, toggle all to true. If all true, toggle to false.
        const currentStates = filteredTemplates.map(t => {
            const perm = permissions[t.id];
            return perm ? perm[field] : false;
        });

        const allAreTrue = currentStates.every(s => s === true);
        const targetValue = !allAreTrue;

        try {
            const updates = filteredTemplates.map(template => {
                const current = permissions[template.id] || {
                    checklist_template_id: template.id,
                    can_apply: false,
                    view_report: false,
                    receive_email: false
                };

                return {
                    profile_id: currentProfileId,
                    checklist_template_id: template.id,
                    can_apply: field === 'can_apply' ? targetValue : current.can_apply,
                    view_report: field === 'view_report' ? targetValue : current.view_report,
                    receive_email: field === 'receive_email' ? targetValue : current.receive_email
                };
            });

            // Filter out items that should be deleted (all false) vs upserted
            const toDelete = updates.filter(u => !u.can_apply && !u.view_report && !u.receive_email);
            const toUpsert = updates.filter(u => u.can_apply || u.view_report || u.receive_email);

            // Perform batch operations
            if (toDelete.length > 0) {
                await Promise.all(toDelete.map(u =>
                    supabase.from('profile_checklist_permissions').delete().match({ profile_id: currentProfileId, checklist_template_id: u.checklist_template_id })
                ));
            }

            if (toUpsert.length > 0) {
                const { error } = await supabase
                    .from('profile_checklist_permissions')
                    .upsert(toUpsert, { onConflict: 'profile_id, checklist_template_id' });

                if (error) throw error;
            }

            // Optimistic Update
            const newPermissions = { ...permissions };
            filteredTemplates.forEach(t => {
                const current = permissions[t.id] || {
                    checklist_template_id: t.id,
                    can_apply: false,
                    view_report: false,
                    receive_email: false
                };

                if (targetValue === false &&
                    ((field === 'can_apply' && !current.view_report && !current.receive_email) ||
                        (field === 'view_report' && !current.can_apply && !current.receive_email) ||
                        (field === 'receive_email' && !current.can_apply && !current.view_report))) {
                    delete newPermissions[t.id];
                } else {
                    newPermissions[t.id] = {
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
    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-12 text-center text-slate-400">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
                <p className="text-sm">Carregando permissões...</p>
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
                        placeholder="Buscar checklist por nome"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                        <div className="col-span-6 text-left pl-2">Checklist</div>
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
                        {filteredTemplates.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                Nenhum checklist encontrado.
                            </div>
                        ) : (
                            filteredTemplates.map((template) => {
                                const perm = permissions[template.id] || { can_apply: false, view_report: false, receive_email: false };
                                return (
                                    <div key={template.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
                                        <div className="col-span-6 text-sm text-slate-700 font-medium">
                                            {template.name}
                                        </div>
                                        <div className="col-span-2 flex justify-center">
                                            <Toggle
                                                checked={perm.can_apply}
                                                onChange={() => handleToggle(template.id, 'can_apply')}
                                            />
                                        </div>
                                        <div className="col-span-2 flex justify-center">
                                            <Toggle
                                                checked={perm.view_report}
                                                onChange={() => handleToggle(template.id, 'view_report')}
                                            />
                                        </div>
                                        <div className="col-span-2 flex justify-center">
                                            <Toggle
                                                checked={perm.receive_email}
                                                onChange={() => handleToggle(template.id, 'receive_email')}
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

export default UserChecklists;
