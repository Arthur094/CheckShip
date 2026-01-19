import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Truck, MapPin, CheckCircle, AlertTriangle, XCircle, ChevronRight, Camera, FileText, FileDown, CheckCircle2, XOctagon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const InspectionDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isAnalysisMode = searchParams.get('mode') === 'analysis';
    const [loading, setLoading] = useState(true);
    const [inspection, setInspection] = useState<any>(null);
    const [structure, setStructure] = useState<any>(null);
    const [activeAreaId, setActiveAreaId] = useState<string>('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchInspectionDetails();
    }, [id]);

    const fetchInspectionDetails = async () => {
        try {
            setLoading(true);
            // 1. Fetch Inspection with related data
            const { data: inspData, error: inspError } = await supabase
                .from('checklist_inspections')
                .select(`
                  *,
                  template:checklist_templates!checklist_template_id (*),
                  user:profiles!inspector_id (*),
                  vehicle:vehicles!vehicle_id (*)
                `)
                .eq('id', id)
                .single();

            if (inspError) throw inspError;

            console.log('🔍 FULL INSPECTION DATA:', JSON.stringify(inspData, null, 2));
            console.log('🔍 Responses field exists?', 'responses' in inspData);
            console.log('🔍 Responses value:', inspData.responses);
            console.log('🔍 Responses type:', typeof inspData.responses);

            if (inspData.responses) {
                console.log('🔍 Responses keys:', Object.keys(inspData.responses));
                console.log('🔍 First response:', Object.entries(inspData.responses)[0]);
            }

            setInspection(inspData);

            // 2. Parse Template Structure 
            // Ideally, the structure is in the template. If specific versioning was saved in inspection, use that.
            // For now, assuming template.structure is the source of truth for section ordering.
            const tmplStructure = inspData.template.structure;
            setStructure(tmplStructure);

            if (tmplStructure?.areas?.length > 0) {
                setActiveAreaId(tmplStructure.areas[0].id);
            }

        } catch (error) {
            console.error('Error fetching details:', error);
            console.error(error);
            alert('Erro ao carregar detalhes da inspeção.');
        } finally {
            setLoading(false);
        }
    };

    const getAnswer = (itemId: string) => {
        const answer = inspection?.responses?.[itemId];
        console.log(`🔍 getAnswer("${itemId}"):`, answer);
        return answer;
    };

    const scrollToArea = (areaId: string) => {
        setActiveAreaId(areaId);
        const element = document.getElementById(`area-${areaId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleExportPDF = () => {
        const element = document.getElementById('inspection-report');
        if (!element) return;

        const opt = {
            margin: [10, 10, 10, 10] as [number, number, number, number],
            filename: `inspecao-${inspection?.vehicle?.plate || 'checkship'}-${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
        };

        html2pdf().set(opt).from(element).save();
    };

    const handleApprove = async () => {
        if (!inspection || !id) return;
        if (!window.confirm('Confirma a aprovação deste checklist?')) return;

        setProcessing(true);
        try {
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData?.user?.id;

            const currentStep = (inspection.analysis_current_step || 0) + 1;
            const totalSteps = inspection.analysis_total_steps || 1;
            const isCompleted = currentStep >= totalSteps;

            const updateData: any = {
                analysis_current_step: currentStep,
                updated_at: new Date().toISOString(),
            };

            // First or second approval
            if (currentStep === 1) {
                updateData.analysis_first_result = 'approved';
                updateData.analysis_first_by = userId;
                updateData.analysis_first_at = new Date().toISOString();
            } else if (currentStep === 2) {
                updateData.analysis_second_result = 'approved';
                updateData.analysis_second_by = userId;
                updateData.analysis_second_at = new Date().toISOString();
            }

            // If all approvals done, mark as completed
            if (isCompleted) {
                updateData.analysis_status = 'approved';
                updateData.status = 'completed';
            }

            const { error } = await supabase
                .from('checklist_inspections')
                .update(updateData)
                .eq('id', id);

            if (error) throw error;

            alert('✅ Checklist aprovado com sucesso!');
            navigate(-1);
        } catch (error: any) {
            console.error('Erro ao aprovar:', error);
            alert('Erro ao aprovar: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!inspection || !id || !rejectReason.trim()) {
            alert('Por favor, informe uma justificativa para a reprovação.');
            return;
        }

        setProcessing(true);
        try {
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData?.user?.id;

            const currentStep = (inspection.analysis_current_step || 0) + 1;

            const updateData: any = {
                analysis_status: 'rejected',
                status: 'rejected',
                analysis_current_step: currentStep,
                updated_at: new Date().toISOString(),
            };

            // Record who rejected and why
            if (currentStep === 1) {
                updateData.analysis_first_result = 'rejected';
                updateData.analysis_first_by = userId;
                updateData.analysis_first_at = new Date().toISOString();
                updateData.analysis_first_reason = rejectReason;
            } else if (currentStep === 2) {
                updateData.analysis_second_result = 'rejected';
                updateData.analysis_second_by = userId;
                updateData.analysis_second_at = new Date().toISOString();
                updateData.analysis_second_reason = rejectReason;
            }

            const { error } = await supabase
                .from('checklist_inspections')
                .update(updateData)
                .eq('id', id);

            if (error) throw error;

            alert('❌ Checklist reprovado.');
            navigate(-1);
        } catch (error: any) {
            console.error('Erro ao reprovar:', error);
            alert('Erro ao reprovar: ' + error.message);
        } finally {
            setProcessing(false);
            setShowRejectModal(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    if (!inspection) return <div className="p-10 text-center">Inspeção não encontrada.</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* HEADER */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-slate-500 hover:text-blue-900 transition-colors text-sm font-bold uppercase tracking-wider"
                        >
                            <ArrowLeft size={18} />
                            Voltar ao Painel
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${inspection.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    inspection.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {inspection.status === 'completed' ? 'Concluído' : inspection.status === 'pending' ? 'Em Análise' : 'Em Andamento'}
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="text-sm font-bold text-slate-600">ID: {inspection.code || inspection.id.substr(0, 8)}</span>
                            </div>

                            <button
                                onClick={handleExportPDF}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
                            >
                                <FileDown size={18} />
                                Baixar PDF
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-bold overflow-hidden border-2 border-white shadow-sm">
                                {inspection.user?.avatar_url ? (
                                    <img src={inspection.user.avatar_url} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} />
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Inspetor</p>
                                <p className="text-sm font-bold text-slate-800">{inspection.user?.full_name || 'Desconhecido'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                                <Truck size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Veículo / Ativo</p>
                                <p className="text-sm font-bold text-slate-800">{inspection.vehicle?.plate || 'N/A'}</p>
                                <p className="text-xs text-slate-500">{inspection.vehicle?.model} • {inspection.vehicle?.vehicle_types?.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Data / Hora</p>
                                <p className="text-sm font-bold text-slate-800">
                                    {new Date(inspection.started_at).toLocaleDateString('pt-BR')}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {new Date(inspection.started_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    {' - '}
                                    {inspection.completed_at ? new Date(inspection.completed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '...'}
                                </p>
                            </div>
                        </div>

                        {/* Geolocation Skipped as requested */}
                        {/* 
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                <MapPin size={20} />
              </div>
              ...
            </div> 
            */}
                    </div>
                </div>
            </header>

            {/* ANALYSIS STATUS BANNER - Show for analyzed inspections */}
            {(inspection.analysis_status === 'approved' || inspection.analysis_status === 'rejected' || inspection.status === 'pending') && (
                <div className={`border-b ${inspection.analysis_status === 'approved' ? 'bg-green-50 border-green-100' :
                        inspection.analysis_status === 'rejected' ? 'bg-red-50 border-red-100' :
                            'bg-amber-50 border-amber-100'
                    }`}>
                    <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <span className={`material-symbols-outlined text-2xl ${inspection.analysis_status === 'approved' ? 'text-green-600' :
                                        inspection.analysis_status === 'rejected' ? 'text-red-600' :
                                            'text-amber-600'
                                    }`}>
                                    {inspection.analysis_status === 'approved' ? 'check_circle' :
                                        inspection.analysis_status === 'rejected' ? 'cancel' : 'hourglass_top'}
                                </span>
                                <div>
                                    <p className={`text-sm font-bold ${inspection.analysis_status === 'approved' ? 'text-green-700' :
                                            inspection.analysis_status === 'rejected' ? 'text-red-700' :
                                                'text-amber-700'
                                        }`}>
                                        {inspection.analysis_status === 'approved' ? 'Análise Aprovada' :
                                            inspection.analysis_status === 'rejected' ? 'Análise Reprovada' :
                                                `Em Análise (${inspection.analysis_current_step || 0}/${inspection.analysis_total_steps || 1})`}
                                    </p>
                                    {inspection.analysis_first_at && (
                                        <p className="text-xs text-slate-500">
                                            {new Date(inspection.analysis_first_at).toLocaleString('pt-BR')}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Show rejection reason if rejected */}
                            {inspection.analysis_status === 'rejected' && (inspection.analysis_first_reason || inspection.analysis_second_reason) && (
                                <div className="bg-red-100 border border-red-200 rounded-lg px-4 py-2 max-w-lg">
                                    <p className="text-[10px] font-bold text-red-800 uppercase mb-1">Motivo da Reprovação:</p>
                                    <p className="text-sm text-red-700">
                                        {inspection.analysis_first_reason || inspection.analysis_second_reason}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENT LAYOUT */}
            <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex gap-8">

                {/* SIDEBAR NAVIGATION */}
                <aside className="w-64 hidden md:block shrink-0">
                    <div className="sticky top-40 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-100">
                            <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Índice do Relatório</span>
                        </div>
                        <nav className="p-2 space-y-1">
                            {structure?.areas?.map((area: any) => (
                                <button
                                    key={area.id}
                                    onClick={() => scrollToArea(area.id)}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-between ${activeAreaId === area.id
                                        ? 'bg-blue-50 text-blue-900'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    {area.name}
                                    {activeAreaId === area.id && <ChevronRight size={14} />}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* MAIN REPORT */}
                <main id="inspection-report" className="flex-1 space-y-8 pb-20 bg-white p-6 md:p-10">

                    {/* PRINTED REPORT HEADER */}
                    <div className="pb-8 mb-8 border-b border-slate-200">
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">{inspection.template?.name || 'Relatório de Inspeção'}</h1>
                                <p className="text-slate-500">#{inspection.id}</p>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest ${inspection.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {inspection.status === 'completed' ? 'Concluído' : 'Em Andamento'}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-bold overflow-hidden">
                                    {inspection.user?.avatar_url ? (
                                        <img src={inspection.user.avatar_url} alt="User" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={18} />
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Inspetor</p>
                                    <p className="text-sm font-bold text-slate-800">{inspection.user?.full_name || 'Desconhecido'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-500 shadow-sm">
                                    <Truck size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Veículo</p>
                                    <p className="text-sm font-bold text-slate-800">{inspection.vehicle?.plate || 'N/A'}</p>
                                    <p className="text-xs text-slate-500">{inspection.vehicle?.model}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-500 shadow-sm">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Data</p>
                                    <p className="text-sm font-bold text-slate-800">{new Date(inspection.started_at).toLocaleDateString('pt-BR')}</p>
                                    <p className="text-xs text-slate-500">{new Date(inspection.started_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {structure?.areas?.map((area: any, idx: number) => (
                        <section id={`area-${area.id}`} key={area.id} className="scroll-mt-44 animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-blue-900 rounded-full"></div>
                                    <h2 className="text-lg font-bold text-slate-800">{area.name}</h2>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {/* Render Area Items */}
                                    {area.items?.map((item: any) => renderReportItem(item, getAnswer(item.id)))}

                                    {/* Render SubAreas */}
                                    {area.subAreas?.map((sub: any) => (
                                        <div key={sub.id} className="bg-slate-50/30">
                                            <div className="px-6 py-3 bg-slate-100/50 border-y border-slate-100">
                                                <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Sub-área: {sub.name}</span>
                                            </div>
                                            <div className="divide-y divide-slate-100">
                                                {sub.items?.map((sitem: any) => renderReportItem(sitem, getAnswer(sitem.id)))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    ))}
                </main>


            </div>

            {/* Analysis Footer - Only show in analysis mode with pending status */}
            {isAnalysisMode && inspection.status === 'pending' && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
                    <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-600">Etapa</span>
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-black">
                                {inspection.analysis_current_step || 0}/{inspection.analysis_total_steps || 1}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowRejectModal(true)}
                                disabled={processing}
                                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                            >
                                <XOctagon size={18} />
                                REPROVAR
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={processing}
                                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                            >
                                <CheckCircle2 size={18} />
                                APROVAR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setShowRejectModal(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Justificativa da Reprovação</h3>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Informe o motivo da reprovação..."
                            className="w-full h-32 p-4 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none"
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-bold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={processing || !rejectReason.trim()}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                            >
                                {processing ? 'Processando...' : 'Confirmar Reprovação'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DEBUG INFO */}
            <div className="max-w-7xl mx-auto px-8 pb-10">
                <details className="bg-slate-100 p-4 rounded-lg cursor-pointer">
                    <summary className="text-xs font-bold text-slate-500 uppercase">Debug Info (Dados Brutos)</summary>
                    <pre className="mt-4 text-xs font-mono bg-slate-800 text-green-400 p-4 rounded overflow-auto max-h-96">
                        {JSON.stringify(inspection?.responses, null, 2)}
                    </pre>
                </details>
            </div>
        </div>
    );
};

// Helper to render individual item report
function renderReportItem(item: any, answerData: any) {
    const answer = answerData?.answer;
    const observation = answerData?.observation;
    const photos = answerData?.photos || [];
    const imageUrl = answerData?.imageUrl; // ← Nova linha

    return (
        <div key={item.id} className="p-6 hover:bg-slate-50/50 transition-colors">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                        <span className="mt-1 text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase border border-slate-200 shrink-0">
                            {item.type}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 leading-snug">{item.name}</h4>
                    </div>

                    {/* Observation */}
                    {observation && (
                        <div className="mt-3 flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                            <FileText size={14} className="text-yellow-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-yellow-800 italic">"{observation}"</p>
                        </div>
                    )}

                    {/* Photos */}
                    {photos.length > 0 && (
                        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                            {photos.map((photo: string, pIdx: number) => (
                                <div key={pIdx} className="w-20 h-20 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative group shrink-0">
                                    <img src={photo} alt="Evidência" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                        <Camera size={16} className="text-white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Single Image URL (from mandatory attachment) */}
                    {imageUrl && (
                        <div className="mt-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Evidência Fotográfica</p>
                            <div className="w-40 h-40 rounded-lg bg-slate-100 border-2 border-slate-200 overflow-hidden relative group shadow-sm">
                                <img src={imageUrl} alt="Evidência obrigatória" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                    <Camera size={20} className="text-white" />
                                </div>
                                <div className="absolute bottom-0 inset-x-0 bg-green-500 text-white text-[10px] font-bold text-center py-1">
                                    ANEXADA
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Answer Display */}
                <div className="w-full md:w-48 shrink-0 flex flex-col items-end md:justify-center">
                    {renderAnswerValue(item, answer)}
                </div>
            </div>
        </div>
    );
}

function renderAnswerValue(item: any, answer: any) {
    if (answer === undefined || answer === null || answer === '') {
        return <span className="text-xs text-slate-400 italic font-medium">Não respondido</span>;
    }

    // Smileys / Evaluative
    if (item.type === 'Avaliativo') {
        // Faces logic consistent with InspectionForm
        if (answer === 'conforme' || answer === 'bom' || answer === 'otimo') {
            return <div className="flex flex-col items-center"><CheckCircle className="text-green-500 mb-1" size={28} /><span className="text-xs font-bold text-green-600 uppercase">Aprovado</span></div>;
        }
        if (answer === 'nao_conforme' || answer === 'ruim' || answer === 'pessimo') {
            return <div className="flex flex-col items-center"><XCircle className="text-red-500 mb-1" size={28} /><span className="text-xs font-bold text-red-600 uppercase">Reprovado</span></div>;
        }
        if (answer === 'regular' || answer === 'meh') {
            return <div className="flex flex-col items-center"><AlertTriangle className="text-yellow-500 mb-1" size={28} /><span className="text-xs font-bold text-yellow-600 uppercase">Regular</span></div>;
        }
        return <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold uppercase">{answer}</span>;
    }

    // Arrays (Multiple Selection)
    if (Array.isArray(answer)) {
        return (
            <div className="flex flex-col gap-1 items-end">
                {answer.map((a: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded text-xs font-bold border border-blue-100">{a}</span>
                ))}
            </div>
        );
    }

    // Default Text Display
    return (
        <span className="text-sm font-semibold text-slate-700 text-right">{answer.toString()}</span>
    );
}

export default InspectionDetails;
