
import React, { useState } from 'react';
import {
    Save,
    X,
    Shield,
    CheckSquare,
    Settings,
    BarChart3,
    AlertTriangle,
    Info
} from 'lucide-react';

interface AccessProfileFormProps {
    onBack: () => void;
    initialData?: any; // You can type this better later
}

const AccessProfileForm: React.FC<AccessProfileFormProps> = ({ onBack, initialData }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [profileName, setProfileName] = useState(initialData?.name || '');

    // Mock state for permissions
    const [permissions, setPermissions] = useState<Record<string, boolean>>({
        'checklist.apply': true,
        'checklist.view_others': false,
    });

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
                                onClick={() => setIsAdmin(false)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${!isAdmin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Acesso Restrito
                            </button>
                            <button
                                onClick={() => setIsAdmin(true)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${isAdmin ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Administrador
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nome do Perfil</label>
                        <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            placeholder="Ex: Gerente Regional, Operador de Frota..."
                            className="w-full max-w-md p-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-slate-800 placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content - Grid Layout */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">

                    {/* Group 1: Checklists */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                                <CheckSquare size={20} />
                            </div>
                            <h3 className="font-bold text-slate-800">Checklists Aplicados</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Permissões Específicas</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {['Aplicar novos checklists', 'Aprovar / Reprovar', 'Visualizar não concluídos (Terceiros)', 'Reabrir concluídos', 'Excluir próprios/terceiros', 'Comentar em avaliações', 'Ver histórico de alterações'].map((perm, idx) => (
                                        <label key={idx} className="flex items-center gap-3">
                                            <input type="checkbox" className="w-4 h-4 rounded text-blue-900 border-slate-300 focus:ring-blue-900" />
                                            <span className="text-sm text-slate-600 hover:text-slate-900 transition-colors">{perm}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Group 3: Global Config */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden md:col-span-2">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                            <div className="bg-slate-200 p-2 rounded-lg text-slate-700">
                                <Settings size={20} />
                            </div>
                            <h3 className="font-bold text-slate-800">Configurações Globais (Painel Administrativo)</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Cadastros Gerais</label>
                                <div className="space-y-3">
                                    {['Gestão de Workflows', 'Catálogos e Modelos', 'Unidades e Regiões', 'Tipos de Usuários', 'Departamentos', 'Planos de Ação'].map((perm, idx) => (
                                        <label key={idx} className="flex items-center gap-3">
                                            <input type="checkbox" className="w-4 h-4 rounded text-blue-900 border-slate-300 focus:ring-blue-900" />
                                            <span className="text-sm text-slate-600">{perm}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Sistema</label>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3">
                                        <input type="checkbox" className="w-4 h-4 rounded text-blue-900 border-slate-300 focus:ring-blue-900" />
                                        <span className="text-sm text-slate-600">Configurar Dashboard</span>
                                    </label>
                                    <label className="flex items-center gap-3">
                                        <input type="checkbox" className="w-4 h-4 rounded text-blue-900 border-slate-300 focus:ring-blue-900" />
                                        <span className="text-sm text-slate-600">Gestão de Notificações</span>
                                    </label>

                                    <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle size={16} className="text-orange-600 mt-0.5 shrink-0" />
                                            <div>
                                                <label className="flex items-center gap-2 font-bold text-orange-900 text-sm mb-1 cursor-pointer">
                                                    <input type="checkbox" className="w-4 h-4 rounded text-orange-600 focus:ring-orange-600" />
                                                    Acesso bloqueado por horário
                                                </label>
                                                <p className="text-xs text-orange-800">Impede o login fora do expediente configurado.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Group 4: Reports & Audit */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden md:col-span-2">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
                                <BarChart3 size={20} />
                            </div>
                            <h3 className="font-bold text-slate-800">Relatórios e Auditoria</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    {['Acesso a Indicadores (BI)', 'Auditoria de Usuários/Unidades', 'Arquivos e Mídias', 'Visualizar Reincidências', 'Ranking de Performance'].map((perm, idx) => (
                                        <label key={idx} className="flex items-center gap-3">
                                            <input type="checkbox" className="w-4 h-4 rounded text-blue-900 border-slate-300 focus:ring-blue-900" />
                                            <span className="text-sm text-slate-600">{perm}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Shield size={18} className="text-red-600" />
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">Visualizar todos os dados</p>
                                                <p className="text-xs text-slate-500">Ignorar vínculos de unidade/região</p>
                                            </div>
                                        </div>
                                        <input type="checkbox" className="w-5 h-5 rounded text-red-600 border-slate-300 focus:ring-red-600" />
                                    </div>

                                    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Info size={18} className="text-blue-600" />
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">Detalhes de Avaliações</p>
                                                <p className="text-xs text-slate-500">Visualizar respostas sensíveis</p>
                                            </div>
                                        </div>
                                        <input type="checkbox" className="w-5 h-5 rounded text-blue-900 border-slate-300 focus:ring-blue-900" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Floating Action Footer */}
            <div className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="max-w-6xl mx-auto flex items-center justify-end gap-3">
                    <button
                        onClick={onBack}
                        className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-bold text-sm tracking-wide hover:bg-slate-50 transition-colors"
                    >
                        CANCELAR
                    </button>
                    <button
                        onClick={onBack} // For now, save just goes back
                        className="px-6 py-2.5 rounded-lg bg-blue-900 text-white font-bold text-sm tracking-wide hover:bg-blue-800 transition-all shadow-md flex items-center gap-2"
                    >
                        <Save size={18} />
                        SALVAR PERFIL
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessProfileForm;
