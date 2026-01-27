
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, GripVertical, Trash2, Plus, Info } from 'lucide-react';

interface Stage {
    id?: string;
    checklist_template_id: string;
    required: boolean;
    sequence_order: number;
}

interface WorkflowConfigProps {
    initialWorkflow?: any;
    onBack: () => void;
}

const WorkflowConfig: React.FC<WorkflowConfigProps> = ({ initialWorkflow, onBack }) => {
    const [name, setName] = useState(initialWorkflow?.name || '');
    const [description, setDescription] = useState(initialWorkflow?.description || '');
    const [stages, setStages] = useState<Stage[]>([]);
    const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchTemplates();
        if (initialWorkflow) {
            fetchStages(initialWorkflow.id);
        }
    }, [initialWorkflow]);

    const fetchTemplates = async () => {
        const { data } = await supabase
            .from('checklist_templates')
            .select('id, name')
            .eq('status', 'published') // Only published templates
            .order('name');
        setAvailableTemplates(data || []);
    };

    const fetchStages = async (workflowId: string) => {
        const { data } = await supabase
            .from('workflow_stages')
            .select('*')
            .eq('workflow_id', workflowId)
            .order('sequence_order');
        setStages(data || []);
    };

    const handleAddStage = () => {
        setStages([...stages, {
            checklist_template_id: '',
            required: true,
            sequence_order: stages.length + 1
        }]);
    };

    const handleRemoveStage = (index: number) => {
        const newStages = stages.filter((_, i) => i !== index);
        setStages(newStages.map((s, i) => ({ ...s, sequence_order: i + 1 })));
    };

    const handleUpdateStage = (index: number, field: string, value: any) => {
        const newStages = [...stages];
        newStages[index] = { ...newStages[index], [field]: value };
        setStages(newStages);
    };

    const handleMoveStage = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === stages.length - 1) return;

        const newStages = [...stages];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap
        [newStages[index], newStages[targetIndex]] = [newStages[targetIndex], newStages[index]];

        // Reorder
        const reordered = newStages.map((s, i) => ({ ...s, sequence_order: i + 1 }));
        setStages(reordered);
    };

    const handleSave = async () => {
        if (!name.trim()) return alert('Nome é obrigatório');
        if (stages.some(s => !s.checklist_template_id)) return alert('Selecione os checklists para todas as etapas');

        setSaving(true);
        try {
            let workflowId = initialWorkflow?.id;

            // 1. Save Workflow
            if (workflowId) {
                const { error } = await supabase
                    .from('workflows')
                    .update({ name, description, updated_at: new Date().toISOString() })
                    .eq('id', workflowId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase
                    .from('workflows')
                    .insert({ name, description })
                    .select('id')
                    .single();
                if (error) throw error;
                workflowId = data.id;
            }

            // 2. Save Stages (Full Replace Strategy for simplicity)
            // First delete all existing stages
            await supabase.from('workflow_stages').delete().eq('workflow_id', workflowId);

            // Then insert new ones
            const stagesToInsert = stages.map((s, idx) => ({
                workflow_id: workflowId,
                checklist_template_id: s.checklist_template_id,
                required: s.required,
                sequence_order: idx + 1
            }));

            const { error: stageError } = await supabase.from('workflow_stages').insert(stagesToInsert);
            if (stageError) throw stageError;

            alert('Fluxo salvo com sucesso!');
            onBack();
        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in slide-in-from-right duration-300 max-w-4xl mx-auto">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {initialWorkflow ? 'Editar Fluxo' : 'Novo Fluxo'}
                        </h1>
                        <p className="text-slate-500">Configure as etapas de liberação.</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <Save size={18} />
                    {saving ? 'SALVANDO...' : 'SALVAR FLUXO'}
                </button>
            </header>

            {/* Main Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nome do Fluxo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ex: Liberação de Viagem - Carreta"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none font-bold text-slate-800"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Descrição (Opcional)</label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Ex: Checklist completo para início de rota longa"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                    </div>
                </div>

                {/* Stages Builder */}
                <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            Etapas do Fluxo
                            <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{stages.length} etapas</span>
                        </h3>
                        <button
                            onClick={handleAddStage}
                            className="text-blue-900 text-xs font-bold uppercase hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                        >
                            <Plus size={16} /> Adicionar Etapa
                        </button>
                    </div>

                    <div className="space-y-3">
                        {stages.length === 0 ? (
                            <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-slate-400 text-sm">Nenhuma etapa definida.</p>
                                <button onClick={handleAddStage} className="text-blue-900 font-bold text-sm mt-2 hover:underline">Adicionar a primeira etapa</button>
                            </div>
                        ) : (
                            stages.map((stage, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 group animate-in slide-in-from-bottom-2 duration-300">
                                    {/* Drag Handle (Visual) */}
                                    <div className="flex flex-col gap-1 text-slate-300">
                                        <button
                                            onClick={() => handleMoveStage(idx, 'up')}
                                            disabled={idx === 0}
                                            className="hover:text-blue-900 disabled:opacity-20"
                                        >▲</button>
                                        <button
                                            onClick={() => handleMoveStage(idx, 'down')}
                                            disabled={idx === stages.length - 1}
                                            className="hover:text-blue-900 disabled:opacity-20"
                                        >▼</button>
                                    </div>

                                    <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center font-bold text-slate-400 text-xs shadow-sm">
                                        {idx + 1}
                                    </div>

                                    <div className="flex-1">
                                        <select
                                            value={stage.checklist_template_id}
                                            onChange={e => handleUpdateStage(idx, 'checklist_template_id', e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none font-medium"
                                        >
                                            <option value="">Selecione um checklist...</option>
                                            {availableTemplates.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                                            <input
                                                type="checkbox"
                                                checked={stage.required}
                                                onChange={e => handleUpdateStage(idx, 'required', e.target.checked)}
                                                className="rounded text-blue-900 focus:ring-blue-900"
                                            />
                                            <span className="text-xs font-bold text-slate-600 uppercase">Obrigatório</span>
                                        </label>
                                    </div>

                                    <button
                                        onClick={() => handleRemoveStage(idx)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg flex gap-3 border border-blue-100">
                    <Info className="text-blue-700 shrink-0" size={20} />
                    <p className="text-sm text-blue-800">
                        <strong>Nota:</strong> O motorista só conseguirá finalizar o fluxo de liberação quando todos os checklists marcados como
                        <span className="font-bold uppercase text-[10px] bg-white px-1.5 py-0.5 rounded border border-blue-200 mx-1">Obrigatório</span>
                        estiverem aprovados.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WorkflowConfig;
