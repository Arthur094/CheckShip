
import React, { useState, useEffect } from 'react';
import { Plus, Search, Layers, Play, MoreVertical, Edit, Trash2, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Workflow {
    id: string;
    name: string;
    description: string;
    active: boolean;
    stages_count?: number;
}

interface WorkflowListProps {
    onNew: () => void;
    onEdit: (workflow: any) => void;
}

const WorkflowList: React.FC<WorkflowListProps> = ({ onNew, onEdit }) => {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('workflows')
                .select(`
          *,
          stages:workflow_stages(count)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formatted = (data || []).map((w: any) => ({
                ...w,
                stages_count: w.stages?.[0]?.count || 0
            }));

            setWorkflows(formatted);
        } catch (error) {
            console.error('Error fetching workflows:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (workflow: Workflow) => {
        try {
            const { error } = await supabase
                .from('workflows')
                .update({ active: !workflow.active })
                .eq('id', workflow.id);

            if (error) throw error;
            fetchWorkflows();
            setActiveMenuId(null);
        } catch (error: any) {
            alert('Erro ao atualizar status: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este fluxo?')) return;
        try {
            const { error } = await supabase.from('workflows').delete().eq('id', id);
            if (error) throw error;
            setWorkflows(prev => prev.filter(w => w.id !== id));
            setActiveMenuId(null);
        } catch (error: any) {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    return (
        <div className="p-8 space-y-6 animate-in slide-in-from-right duration-300" onClick={() => setActiveMenuId(null)}>
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Layers className="text-blue-900" />
                        Fluxos de Liberação
                    </h1>
                    <p className="text-slate-500">Crie pacotes de checklists para operações complexas.</p>
                </div>
                <button
                    onClick={onNew}
                    className="bg-blue-900 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-800 transition-colors flex items-center gap-2"
                >
                    <Plus size={18} />
                    NOVO FLUXO
                </button>
            </header>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse"></div>
                    ))
                ) : workflows.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                        <Layers className="mx-auto text-slate-300 mb-4" size={48} />
                        <h3 className="text-lg font-bold text-slate-600">Nenhum fluxo criado</h3>
                        <p className="text-slate-500 mb-6">Comece criando um pacote de checklists.</p>
                        <button
                            onClick={onNew}
                            className="text-blue-900 font-bold hover:underline"
                        >
                            Criar meu primeiro fluxo
                        </button>
                    </div>
                ) : (
                    workflows.map(wf => (
                        <div key={wf.id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                            {/* Header Card */}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${wf.active ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-400'}`}>
                                        <Layers size={24} />
                                    </div>

                                    {/* Menu */}
                                    <div className="relative">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === wf.id ? null : wf.id); }}
                                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {activeMenuId === wf.id && (
                                            <div className="absolute right-0 top-10 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-2 animate-in zoom-in-95 duration-200">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onEdit(wf); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                                >
                                                    <Edit size={14} /> Editar
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleActive(wf); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                                >
                                                    {wf.active ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                                                    {wf.active ? 'Desativar' : 'Ativar'}
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(wf.id); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100 mt-1 pt-2"
                                                >
                                                    <Trash2 size={14} /> Excluir
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-slate-800 mb-1">{wf.name}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2 h-10 mb-4">
                                    {wf.description || 'Sem descrição.'}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
                                        <CheckCircle2 size={14} />
                                        {wf.stages_count} etapas
                                    </div>
                                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${wf.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {wf.active ? 'Ativo' : 'Inativo'}
                                    </div>
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div
                                onClick={() => onEdit(wf)}
                                className="bg-slate-50 p-3 flex items-center justify-center gap-2 text-blue-900 text-xs font-bold uppercase tracking-wide cursor-pointer hover:bg-blue-50 transition-colors"
                            >
                                Configurar Fluxo <ChevronRight size={14} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WorkflowList;
