
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, CheckCircle, Camera, Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ChecklistTemplate, ItemType } from '../../../types';

interface InspectionFormProps {
    checklistId: string;
    vehicleId: string;
    onClose: () => void;
}

interface InspectionAnswer {
    item_id: string;
    answer: any;
    comment?: string;
    photos?: string[];
}

const InspectionForm: React.FC<InspectionFormProps> = ({ checklistId, vehicleId, onClose }) => {
    const [template, setTemplate] = useState<ChecklistTemplate | null>(null);
    const [vehicle, setVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, InspectionAnswer>>({});
    const [saving, setSaving] = useState(false);
    const [inspectionId, setInspectionId] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                // 1. Fetch Template
                const { data: tmpl, error: tmplError } = await supabase
                    .from('checklist_templates')
                    .select('*')
                    .eq('id', checklistId)
                    .single();

                if (tmplError) throw tmplError;
                setTemplate(tmpl);

                // 2. Fetch Vehicle
                const { data: vhc, error: vhcError } = await supabase
                    .from('vehicles')
                    .select('*')
                    .eq('id', vehicleId)
                    .single();

                if (vhcError) throw vhcError;
                setVehicle(vhc);

                // 3. Create or Resume Inspection
                // For now, let's always create a new one for simplicity, or we could check for drafts.
                // Let's create a draft status inspection.
                const { data: { user } } = await supabase.auth.getUser();

                const { data: insp, error: inspError } = await supabase
                    .from('checklist_inspections')
                    .insert({
                        checklist_template_id: checklistId,
                        vehicle_id: vehicleId,
                        user_id: user?.id,
                        status: 'in_progress',
                        started_at: new Date().toISOString(),
                        answers: {} // Initial empty JSON
                    })
                    .select()
                    .single();

                if (inspError) throw inspError;
                setInspectionId(insp.id);

            } catch (error: any) {
                console.error('Error initializing inspection:', error);
                alert('Erro ao iniciar inspeção: ' + error.message);
                onClose();
            } finally {
                setLoading(false);
            }
        };

        if (checklistId && vehicleId) init();
    }, [checklistId, vehicleId]);

    const handleAnswerChange = (itemId: string, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], item_id: itemId, answer: value }
        }));
    };

    const handleSave = async (complete: boolean = false) => {
        if (!inspectionId) return;
        setSaving(true);

        try {
            const payload = {
                answers: answers, // Save the whole JSON object
                updated_at: new Date().toISOString(),
                status: complete ? 'completed' : 'in_progress',
                completed_at: complete ? new Date().toISOString() : null
            };

            const { error } = await supabase
                .from('checklist_inspections')
                .update(payload)
                .eq('id', inspectionId);

            if (error) throw error;

            if (complete) {
                alert('Inspeção finalizada com sucesso!');
                onClose();
            } else {
                // Just silent save or small toast could go here
            }
        } catch (error: any) {
            console.error('Error saving:', error);
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading || !template || !vehicle) {
        return (
            <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-900/20 border-t-blue-900 rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800">{template.name}</h1>
                        <p className="text-xs text-slate-500 font-medium">{vehicle.plate} • {vehicle.model}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleSave(false)}
                        className="px-4 py-2 text-blue-900 font-bold text-sm hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                        disabled={saving}
                    >
                        <Save size={18} />
                        {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        className="px-6 py-2 bg-blue-900 text-white font-bold text-sm rounded-lg hover:bg-blue-800 shadow-lg shadow-blue-900/20 transition-all active:scale-95 flex items-center gap-2"
                        disabled={saving}
                    >
                        <CheckCircle size={18} />
                        Finalizar
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-8 pb-24 animate-in slide-in-from-bottom-4 duration-500">
                {/* Introduction Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-slate-600 text-sm leading-relaxed">{template.description || 'Preencha o checklist abaixo com atenção.'}</p>
                </div>

                {/* Areas Loop */}
                {template.structure?.areas?.map((area: any, areaIdx: number) => (
                    <div key={area.id} className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm shadow-md">
                                {areaIdx + 1}
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">{area.name}</h2>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            {/* Items directly in Area */}
                            {area.items?.map((item: any) => (
                                <InspectionItem
                                    key={item.id}
                                    item={item}
                                    value={answers[item.id]?.answer}
                                    onChange={(val) => handleAnswerChange(item.id, val)}
                                />
                            ))}

                            {/* Subareas */}
                            {area.subAreas?.map((subArea: any) => (
                                <div key={subArea.id} className="border-t border-slate-100">
                                    <div className="bg-slate-50/50 px-6 py-3 border-b border-slate-100">
                                        <h3 className="font-bold text-sm text-slate-600 uppercase tracking-wide">{subArea.name}</h3>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {subArea.items?.map((item: any) => (
                                            <InspectionItem
                                                key={item.id}
                                                item={item}
                                                value={answers[item.id]?.answer}
                                                onChange={(val) => handleAnswerChange(item.id, val)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const InspectionItem = ({ item, value, onChange }: { item: any, value: any, onChange: (val: any) => void }) => {
    return (
        <div className="p-6 hover:bg-slate-50/50 transition-colors">
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <label className="text-sm font-bold text-slate-700 leading-snug">{item.name}</label>
                    {item.mandatory && <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded font-bold uppercase">Obrigatório</span>}
                </div>

                {item.config?.hint && (
                    <p className="text-xs text-slate-500 italic bg-blue-50 p-2 rounded-lg border border-blue-100">{item.config.hint}</p>
                )}

                <div className="mt-1">
                    {/* Render inputs based on type */}
                    {item.type === 'Avaliativo' && (
                        <div className="flex gap-4">
                            {/* Simplified evaluation rendering for now */}
                            <button
                                onClick={() => onChange('conforme')}
                                className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${value === 'conforme' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}
                            >
                                Conforme
                            </button>
                            <button
                                onClick={() => onChange('nao_conforme')}
                                className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${value === 'nao_conforme' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}
                            >
                                Não Conforme
                            </button>
                            <button
                                onClick={() => onChange('na')}
                                className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${value === 'na' ? 'border-slate-400 bg-slate-50 text-slate-600' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}
                            >
                                N/A
                            </button>
                        </div>
                    )}

                    {item.type === 'Texto' && (
                        <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700"
                            placeholder="Digite sua resposta..."
                        />
                    )}

                    {item.type === 'Numérico' && (
                        <input
                            type="number"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700"
                            placeholder="0"
                        />
                    )}

                    {/* Add Photo Button (Mockup functionality) */}
                    <div className="mt-3 flex gap-2">
                        <button className="text-xs font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors">
                            <Camera size={14} /> Adicionar Foto
                        </button>
                        <button className="text-xs font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors">
                            <Upload size={14} /> Anexar Arquivo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InspectionForm;
