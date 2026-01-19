
import React, { useState, useEffect } from 'react';
import {
    Save,
    X,
    Shield,
    CheckSquare,
    Settings,
    BarChart3,
    AlertTriangle,
    Info,
    Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AccessProfile {
    id?: string;
    name: string;
    is_admin: boolean;
    can_apply_checklists: boolean;
    can_approve_checklists: boolean;
    can_view_others_incomplete: boolean;
    can_reopen_completed: boolean;
    can_delete_checklists: boolean;
    can_comment_evaluations: boolean;
    can_view_history: boolean;
}

interface AccessProfileFormProps {
    onBack: () => void;
    initialData?: AccessProfile | null;
}

const AccessProfileForm: React.FC<AccessProfileFormProps> = ({ onBack, initialData }) => {
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<AccessProfile>({
        name: '',
        is_admin: false,
        can_apply_checklists: false,
        can_approve_checklists: false,
        can_view_others_incomplete: false,
        can_reopen_completed: false,
        can_delete_checklists: false,
        can_comment_evaluations: false,
        can_view_history: false,
    });

    useEffect(() => {
        if (initialData) {
            setProfile(initialData);
        }
    }, [initialData]);

    const handleChange = (field: keyof AccessProfile, value: boolean | string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!profile.name.trim()) {
            alert('Por favor, informe o nome do perfil.');
            return;
        }

        setSaving(true);
        try {
            if (initialData?.id) {
                // Update existing
                const { error } = await supabase
                    .from('access_profiles')
                    .update({
                        name: profile.name,
                        is_admin: profile.is_admin,
                        can_apply_checklists: profile.can_apply_checklists,
                        can_approve_checklists: profile.can_approve_checklists,
                        can_view_others_incomplete: profile.can_view_others_incomplete,
                        can_reopen_completed: profile.can_reopen_completed,
                        can_delete_checklists: profile.can_delete_checklists,
                        can_comment_evaluations: profile.can_comment_evaluations,
                        can_view_history: profile.can_view_history,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', initialData.id);

                if (error) throw error;
            } else {
                // Insert new
                const { error } = await supabase
                    .from('access_profiles')
                    .insert({
                        name: profile.name,
                        is_admin: profile.is_admin,
                        can_apply_checklists: profile.can_apply_checklists,
                        can_approve_checklists: profile.can_approve_checklists,
                        can_view_others_incomplete: profile.can_view_others_incomplete,
                        can_reopen_completed: profile.can_reopen_completed,
                        can_delete_checklists: profile.can_delete_checklists,
                        can_comment_evaluations: profile.can_comment_evaluations,
                        can_view_history: profile.can_view_history,
                    });

                if (error) throw error;
            }

            onBack();
        } catch (error: any) {
            console.error('Erro ao salvar perfil:', error);
            alert('Erro ao salvar perfil: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    // Checkbox com label helper
    const PermissionCheckbox = ({
        label,
        field,
        description
    }: {
        label: string;
        field: keyof AccessProfile;
        description?: string;
    }) => (
        <label className="flex items-start gap-3 cursor-pointer group">
            <input
                type="checkbox"
                checked={!!profile[field]}
                onChange={(e) => handleChange(field, e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-blue-900 border-slate-300 focus:ring-blue-900"
            />
            <div>
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
                {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
            </div>
        </label>
    );

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            {/* Header */}
            <div className="bg-white px-8 py-6 border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                {initialData ? 'Editar Perfil' : 'Novo Perfil de Acesso'}
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">Defina as permissões e níveis de acesso para este grupo de usuários.</p>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                            <button
                                onClick={() => handleChange('is_admin', false)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${!profile.is_admin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Acesso Restrito
                            </button>
                            <button
                                onClick={() => handleChange('is_admin', true)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${profile.is_admin ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Administrador
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nome do Perfil</label>
                        <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Ex: Gerente Regional, Operador de Frota..."
                            className="w-full max-w-md p-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-slate-800 placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content - Grid Layout */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">

                    {/* Group 1: Checklists Realizados */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                                <CheckSquare size={20} />
                            </div>
                            <h3 className="font-bold text-slate-800">Checklists Realizados</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Permissões Específicas</label>
                                <div className="grid grid-cols-1 gap-4">
                                    <PermissionCheckbox
                                        label="Aplicar novos checklists"
                                        field="can_apply_checklists"
                                    />
                                    <PermissionCheckbox
                                        label="Aprovar / Reprovar"
                                        field="can_approve_checklists"
                                        description="Permite analisar checklists que requerem aprovação"
                                    />
                                    <PermissionCheckbox
                                        label="Visualizar não concluídos (Terceiros)"
                                        field="can_view_others_incomplete"
                                    />
                                    <PermissionCheckbox
                                        label="Reabrir concluídos"
                                        field="can_reopen_completed"
                                    />
                                    <PermissionCheckbox
                                        label="Excluir próprios/terceiros"
                                        field="can_delete_checklists"
                                    />
                                    <PermissionCheckbox
                                        label="Comentar em avaliações"
                                        field="can_comment_evaluations"
                                    />
                                    <PermissionCheckbox
                                        label="Ver histórico de alterações"
                                        field="can_view_history"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Group 2: Global Config - Placeholder */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden md:col-span-2 opacity-50">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                            <div className="bg-slate-200 p-2 rounded-lg text-slate-700">
                                <Settings size={20} />
                            </div>
                            <h3 className="font-bold text-slate-800">Configurações Globais (Em Breve)</h3>
                        </div>
                        <div className="p-6 text-center text-slate-400 py-10">
                            <p className="text-sm">Configurações globais serão implementadas em breve.</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Floating Action Footer */}
            <div className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="max-w-6xl mx-auto flex items-center justify-end gap-3">
                    <button
                        onClick={onBack}
                        disabled={saving}
                        className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-bold text-sm tracking-wide hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        CANCELAR
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 rounded-lg bg-blue-900 text-white font-bold text-sm tracking-wide hover:bg-blue-800 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {saving ? 'SALVANDO...' : 'SALVAR PERFIL'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessProfileForm;
