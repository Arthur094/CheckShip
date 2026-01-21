
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
                const { data: { user } } = await supabase.auth.getUser();

                // Check for existing IN_PROGRESS inspection for this user/vehicle/template
                const { data: existingInsp } = await supabase
                    .from('checklist_inspections')
                    .select('id, responses')
                    .eq('checklist_template_id', checklistId)
                    .eq('vehicle_id', vehicleId)
                    .eq('inspector_id', user?.id)
                    .eq('status', 'in_progress')
                    .maybeSingle();

                if (existingInsp) {
                    console.log('🔄 Retomando inspeção existente:', existingInsp.id);
                    setInspectionId(existingInsp.id);
                    // Load existing answers if any
                    if (existingInsp.responses) {
                        setAnswers(existingInsp.responses);
                    }
                } else {
                    console.log('✨ Criando nova inspeção...');
                    const { data: insp, error: inspError } = await supabase
                        .from('checklist_inspections')
                        .insert({
                            company_id: user?.user_metadata?.company_id, // Garante que o RLS permita a inserção
                            checklist_template_id: checklistId,
                            vehicle_id: vehicleId,
                            inspector_id: user?.id,
                            status: 'in_progress',
                            started_at: new Date().toISOString(),
                            responses: {} // Initial empty JSON
                        })
                        .select()
                        .single();

                    if (inspError) throw inspError;
                    setInspectionId(insp.id);
                }

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
        setAnswers(prev => {
            const current = prev[itemId] || { item_id: itemId };

            // If value contains imageUrl, merge it
            if (typeof value === 'object' && value.imageUrl) {
                return {
                    ...prev,
                    [itemId]: {
                        ...current,
                        imageUrl: value.imageUrl
                    }
                };
            }

            // Otherwise, update answer normally
            return {
                ...prev,
                [itemId]: {
                    ...current,
                    answer: value
                }
            };
        });
    };

    const handleSave = async (complete: boolean = false) => {
        if (!inspectionId) return;
        setSaving(true);

        try {
            console.log('💾 Salvando inspeção...', { inspectionId, complete, answers });

            const payload = {
                responses: answers,
                updated_at: new Date().toISOString(),
                status: complete ? 'completed' : 'in_progress',
                completed_at: complete ? new Date().toISOString() : null
            };

            console.log('📦 Payload de envio:', payload);

            const { data, error } = await supabase
                .from('checklist_inspections')
                .update(payload)
                .eq('id', inspectionId)
                .select();

            if (error) throw error;

            console.log('✅ Sucesso no update:', data);

            if (complete) {
                alert('Inspeção finalizada com sucesso! Status atualizado para COMPLETED.');
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
                                    inspectionId={inspectionId}
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
                                                inspectionId={inspectionId}
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

const InspectionItem = ({ item, value, onChange, inspectionId }: {
    item: any,
    value: any,
    onChange: (val: any) => void,
    inspectionId: string | null
}) => {
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);

    console.log('🟡 InspectionItem renderizado. isMandatoryAttachment:', item.mandatory_attachment, 'ItemId:', item.id);

    // Load existing image if available
    useEffect(() => {
        if (value?.imageUrl) {
            setMediaPreview(value.imageUrl);
        }
    }, [value?.imageUrl]);

    // Helper to format values based on masks
    const formatValue = (val: string, type: string) => {
        const v = val.replace(/\D/g, '');
        switch (type) {
            case 'CPF': return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').substring(0, 14);
            case 'CNPJ': return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5').substring(0, 18);
            case 'CEP': return v.replace(/(\d{5})(\d{3})/, '$1-$2').substring(0, 9);
            case 'Telefone': return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').substring(0, 15);
            case 'Placa do Automóvel': return val.toUpperCase().substring(0, 8);
            default: return val;
        }
    };

    // Compress image using canvas
    const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Max dimensions
                    const MAX_WIDTH = 1920;
                    const MAX_HEIGHT = 1920;

                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) resolve(blob);
                            else reject(new Error('Falha ao comprimir imagem'));
                        },
                        'image/jpeg',
                        0.85 // Quality
                    );
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('🔵 handleFileChange chamado');

        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            console.log('📁 Arquivo selecionado:', file.name, file.type, file.size);

            // Show preview while uploading
            const previewUrl = URL.createObjectURL(file);
            setMediaPreview(previewUrl);
            console.log('👁️ Preview URL criada:', previewUrl);

            try {
                console.log('🔄 Iniciando compressão...');
                // Compress image
                const compressedBlob = await compressImage(file);
                console.log('✅ Compressão concluída. Tamanho:', compressedBlob.size);

                // Generate unique filename
                const fileExt = 'jpg'; // Always save as JPEG after compression
                const fileName = `${inspectionId}_${item.id}_${Date.now()}.${fileExt}`;
                console.log('📝 Nome do arquivo gerado:', fileName);
                console.log('🔑 InspectionId:', inspectionId);
                console.log('🔑 ItemId:', item.id);

                if (!inspectionId) {
                    throw new Error('InspectionId não está definido! Não é possível fazer upload.');
                }

                console.log('☁️ Enviando para Supabase Storage...');
                // Upload to Supabase Storage
                const { data, error: uploadError } = await supabase.storage
                    .from('checklist-photos')
                    .upload(fileName, compressedBlob, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: 'image/jpeg'
                    });

                console.log('📤 Resposta do upload:', { data, uploadError });

                if (uploadError) throw uploadError;

                console.log('🌐 Obtendo URL pública...');
                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('checklist-photos')
                    .getPublicUrl(fileName);

                console.log('✅ URL pública obtida:', publicUrl);

                // Update preview with public URL
                setMediaPreview(publicUrl);

                // Save URL in answer
                console.log('💾 Salvando URL no answer...');
                onChange({ imageUrl: publicUrl });

                alert('Imagem enviada com sucesso!');
                console.log('🎉 Upload completo!');
            } catch (error: any) {
                console.error('❌ ERRO no upload:', error);
                console.error('❌ Detalhes do erro:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                });
                alert('Erro ao enviar imagem: ' + error.message);
                setMediaPreview(null);
            }
        } else {
            console.log('⚠️ Nenhum arquivo selecionado');
        }
    };

    // Correctly access mandatory_attachment from root item properties
    const isMandatoryAttachment = item.mandatory_attachment || false;

    // Scale Type handling: faces_3 is the ID for Smile/Meh/Frown in Config
    const isSmileScale = item.config?.scale_type === 'faces_3' || item.config?.scale_type === 'faces_2';

    return (
        <div className="p-6 hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <label className="text-sm font-bold text-slate-700 leading-snug">{item.name}</label>
                    <div className="flex gap-2">
                        {item.mandatory && <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded font-bold uppercase">Obrigatório</span>}
                        {isMandatoryAttachment && <span className="text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded font-bold uppercase">Foto Obrigatória</span>}
                    </div>
                </div>

                {item.config?.hint && (
                    <p className="text-xs text-slate-500 italic bg-blue-50 p-2 rounded-lg border border-blue-100 flex items-start gap-2">
                        <span className="font-bold text-blue-400">i</span> {item.config.hint}
                    </p>
                )}

                <div className="mt-2">
                    {/* --- AVALIATIVO (Scales) --- */}
                    {item.type === 'Avaliativo' && (
                        <div className="flex gap-3">
                            {isSmileScale ? (
                                // Scale: Icons (Smile/Meh/Frown)
                                <>
                                    <button
                                        onClick={() => onChange('conforme')}
                                        className={`flex-1 py-3 rounded-lg border-2 font-bold text-xs transition-all flex flex-col items-center gap-1 ${value === 'conforme' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-lg shadow-sm">😊</div>
                                        Bom
                                    </button>
                                    <button
                                        onClick={() => onChange('regular')}
                                        className={`flex-1 py-3 rounded-lg border-2 font-bold text-xs transition-all flex flex-col items-center gap-1 ${value === 'regular' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-lg shadow-sm">😐</div>
                                        Regular
                                    </button>
                                    <button
                                        onClick={() => onChange('nao_conforme')}
                                        className={`flex-1 py-3 rounded-lg border-2 font-bold text-xs transition-all flex flex-col items-center gap-1 ${value === 'nao_conforme' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-lg shadow-sm">😟</div>
                                        Ruim
                                    </button>
                                </>
                            ) : (
                                // Scale: S/N/NA
                                <>
                                    <button
                                        onClick={() => onChange('conforme')}
                                        className={`flex-1 h-12 rounded-lg border-2 font-black text-lg transition-all flex items-center justify-center shadow-sm ${value === 'conforme' ? 'border-green-600 bg-green-600 text-white' : 'border-slate-200 text-slate-400 hover:border-slate-300 bg-white'}`}
                                    >
                                        S
                                    </button>
                                    <button
                                        onClick={() => onChange('nao_conforme')}
                                        className={`flex-1 h-12 rounded-lg border-2 font-black text-lg transition-all flex items-center justify-center shadow-sm ${value === 'nao_conforme' ? 'border-red-600 bg-red-600 text-white' : 'border-slate-200 text-slate-400 hover:border-slate-300 bg-white'}`}
                                    >
                                        N
                                    </button>
                                    <button
                                        onClick={() => onChange('na')}
                                        className={`flex-1 h-12 rounded-lg border-2 font-black text-sm transition-all flex items-center justify-center shadow-sm ${value === 'na' ? 'border-slate-400 bg-slate-400 text-white' : 'border-slate-200 text-slate-400 hover:border-slate-300 bg-white'}`}
                                    >
                                        N/A
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* --- TEXTO --- */}
                    {item.type === 'Texto' && (
                        <textarea
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700 min-h-[80px]"
                            placeholder="Descreva aqui..."
                        />
                    )}

                    {/* --- NUMÉRICO --- */}
                    {item.type === 'Numérico' && (
                        <div className="relative">
                            <input
                                type="number"
                                value={value || ''}
                                onChange={(e) => onChange(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700"
                                placeholder="0"
                            />
                            {item.config?.numeric_type === 'Porcentagem' && (
                                <span className="absolute right-4 top-3 text-slate-400 font-bold">%</span>
                            )}
                        </div>
                    )}

                    {/* --- DATA --- */}
                    {item.type === 'Data' && (
                        <input
                            type="date"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700"
                        />
                    )}

                    {/* --- CADASTRO --- */}
                    {item.type === 'Cadastro' && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.config?.registry_type || 'Campo de Cadastro'}</label>
                            <input
                                type="text"
                                value={value || ''}
                                onChange={(e) => onChange(formatValue(e.target.value, item.config?.registry_type))}
                                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700"
                                placeholder={`Informe ${item.config?.registry_type || ''}...`}
                            />
                        </div>
                    )}

                    {/* --- LISTA DE SELEÇÃO --- */}
                    {item.type === 'Lista de Seleção' && (
                        <div className="space-y-2">
                            {/* Support both legacy 'options' and new 'selection_options' */}
                            {(() => {
                                const opts = item.options || item.selection_options || item.config?.selection_options || item.config?.options || [];

                                if (!opts || opts.length === 0) {
                                    return <p className="text-xs text-red-400 italic">Nenhuma opção configurada.</p>;
                                }

                                return (
                                    <>
                                        {/* Single Selection - Select Dropdown */}
                                        {item.config.selection_type === 'single' && (
                                            <select
                                                value={value || ''}
                                                onChange={(e) => onChange(e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700"
                                            >
                                                <option value="" disabled>Selecione uma opção</option>
                                                {opts.map((opt: string, idx: number) => (
                                                    <option key={idx} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        )}

                                        {/* Multiple Selection - Checkboxes */}
                                        {item.config.selection_type === 'multiple' && (
                                            <div className="flex flex-col gap-2">
                                                {opts.map((opt: string, idx: number) => {
                                                    const current = Array.isArray(value) ? value : [];
                                                    const selected = current.includes(opt);
                                                    return (
                                                        <label key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selected ? 'bg-blue-900 border-blue-900' : 'border-slate-300 bg-white'}`}>
                                                                {selected && <CheckCircle size={12} className="text-white" />}
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={selected}
                                                                onChange={() => {
                                                                    if (selected) onChange(current.filter((v: string) => v !== opt));
                                                                    else onChange([...current, opt]);
                                                                }}
                                                            />
                                                            <span className={`text-sm font-medium ${selected ? 'text-blue-900' : 'text-slate-600'}`}>{opt}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    )}

                    {/* --- MEDIA ATTACHMENTS (STRICT RULE) --- */}
                    {/* ONLY SHOW if isMandatoryAttachment is TRUE. */}
                    {console.log('🔴 Verificando mandatory attachment. isMandatoryAttachment:', isMandatoryAttachment, 'item:', item.name)}
                    {isMandatoryAttachment && (
                        <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100 animate-in fade-in">
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Evidência Obrigatória</p>

                            {mediaPreview ? (
                                <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-slate-200 group">
                                    <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setMediaPreview(null)}
                                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                    <div className="absolute bottom-0 inset-x-0 bg-green-500 text-white text-[10px] font-bold text-center py-0.5">
                                        ANEXADO
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <label className="cursor-pointer bg-white border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-400 hover:text-blue-500 rounded-lg p-4 flex flex-col items-center gap-1 transition-all w-24 h-24 justify-center">
                                        <Camera size={20} />
                                        <span className="text-[10px] font-bold">Foto</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            className="hidden"
                                            onChange={(e) => {
                                                console.log('🟢 INPUT onChange disparado!');
                                                handleFileChange(e);
                                            }}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default InspectionForm;
