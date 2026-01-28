
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    X, Save, Upload, Calendar, FileText, History,
    ExternalLink, AlertCircle, CheckCircle2, Clock, ArrowRight
} from 'lucide-react';
import { ManagementDocument, ManagementDocStatus } from '../../../types';

interface EditDocumentModalProps {
    document: ManagementDocument;
    onClose: () => void;
    onSave: () => void;
}

const EditDocumentModal: React.FC<EditDocumentModalProps> = ({ document, onClose, onSave }) => {
    const [issueDate, setIssueDate] = useState(document.issue_date || '');
    const [expiryDate, setExpiryDate] = useState(document.expiry_date || '');
    const [status, setStatus] = useState<ManagementDocStatus>(document.status);
    const [observation, setObservation] = useState(document.observation || '');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fileUrl, setFileUrl] = useState(document.file_url || '');
    const [history, setHistory] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, [document.id]);

    const getEntityName = (doc: any) => {
        if (doc.profiles) return `Motorista: ${doc.profiles.full_name}`;
        if (doc.vehicles) return `Veículo: ${doc.vehicles.plate}`;
        if (doc.trailers) return `Carreta: ${doc.trailers.plate}`;
        return 'N/A';
    };

    const entityName = getEntityName(document);

    const fetchHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('management_document_history')
                .select('*')
                .eq('document_id', document.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setHistory(data || []);
        } catch (error: any) {
            console.error('Error fetching history:', error.message);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${document.id}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('management-documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('management-documents')
                .getPublicUrl(filePath);

            setFileUrl(publicUrl);
        } catch (error: any) {
            alert('Erro ao fazer upload: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handlePerformSave = async () => {
        if (!expiryDate) {
            alert('A data de vencimento é obrigatória.');
            return;
        }

        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Create history record of CURRENT state before update
            await supabase.from('management_document_history').insert({
                document_id: document.id,
                issue_date: document.issue_date,
                expiry_date: document.expiry_date,
                file_url: document.file_url,
                status: document.status,
                observation: document.observation,
                changed_by: user?.id
            });

            // 2. Update the main document
            const { error } = await supabase
                .from('management_documents')
                .update({
                    issue_date: issueDate || null,
                    expiry_date: expiryDate,
                    status: status,
                    observation: observation,
                    file_url: fileUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', document.id);

            if (error) throw error;

            onSave();
        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const statusOptions: { label: string, value: ManagementDocStatus, color: string }[] = [
        { label: 'Vigente', value: 'VIGENTE', color: 'text-green-600' },
        { label: 'Em Alerta', value: 'ALERTA', color: 'text-amber-500' },
        { label: 'Vencido', value: 'VENCIDO', color: 'text-red-600' },
        { label: 'Em Renovação', value: 'EM_RENOVACAO', color: 'text-blue-600' },
    ];

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase leading-tight">
                            {entityName}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md uppercase tracking-wider">Documento</span>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{document.document_type.replace(/_/g, ' ')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200 shadow-sm hover:shadow">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Form Side */}
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Emissão</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="date"
                                            value={issueDate}
                                            onChange={e => setIssueDate(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Vencimento</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="date"
                                            value={expiryDate}
                                            onChange={e => setExpiryDate(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status do Documento</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {statusOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setStatus(opt.value)}
                                            className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all ${status === opt.value
                                                ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                                                : 'border-slate-100 bg-slate-50 hover:border-slate-200 text-slate-400'
                                                }`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${opt.value === 'VIGENTE' ? 'bg-green-500' : opt.value === 'ALERTA' ? 'bg-amber-500' : opt.value === 'VENCIDO' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                            <span className={`text-xs font-black uppercase tracking-widest ${status === opt.value ? 'text-blue-900' : 'text-slate-500'}`}>{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Anexo / Comprovante</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all cursor-pointer shadow-lg active:scale-[0.98]">
                                        <Upload size={18} />
                                        {uploading ? 'Enviando...' : 'Anexar Novo'}
                                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                    </label>
                                    {fileUrl && (
                                        <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-4 bg-white border border-slate-200 rounded-2xl text-blue-600 hover:text-blue-800 transition-all shadow-sm hover:shadow"
                                        >
                                            <ExternalLink size={20} />
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observações</label>
                                <textarea
                                    value={observation}
                                    onChange={e => setObservation(e.target.value)}
                                    rows={3}
                                    placeholder="Adicione observações relevantes..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700 resize-none"
                                />
                            </div>
                        </div>

                        {/* History Side */}
                        <div className="bg-slate-50/50 rounded-[32px] p-8 border border-slate-100 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <History size={18} className="text-slate-400" />
                                    <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest">Histórico de Versões</h3>
                                </div>
                                <span className="bg-white border border-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-400">{history.length} alterações</span>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                {history.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
                                        <FileText size={48} className="mb-4 text-slate-300" />
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sem registros anteriores</p>
                                    </div>
                                ) : history.map((h, i) => (
                                    <div key={h.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-50">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Atualizado em</span>
                                                <span className="text-[10px] font-bold text-slate-600">
                                                    {new Date(h.created_at).toLocaleDateString()} {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {h.file_url && (
                                                <a href={h.file_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest bg-blue-50 px-2.5 py-1.5 rounded-xl transition-colors border border-blue-100 hover:border-blue-200 shadow-sm">
                                                    Ver Arquivo <ArrowRight size={12} />
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2 items-center mb-2">
                                            <div className={`px-2 py-1 rounded-lg text-[9px] font-black border uppercase shadow-sm ${statusColors[h.status as keyof typeof statusColors]}`}>
                                                {h.status.replace(/_/g, ' ')}
                                            </div>
                                            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                                <Calendar size={10} className="text-slate-400" />
                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Venc:</span>
                                                <span className="text-[9px] font-bold text-slate-700">{new Date(h.expiry_date).toLocaleDateString()}</span>
                                            </div>
                                            {h.issue_date && (
                                                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 text-slate-400">
                                                    <span className="text-[9px] font-bold uppercase tracking-tighter">Emis:</span>
                                                    <span className="text-[9px] font-bold text-slate-500">{new Date(h.issue_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                        {h.observation && (
                                            <p className="text-[10px] text-slate-400 line-clamp-2 italic bg-slate-50/50 p-2 rounded-lg border border-dashed border-slate-200">
                                                "{h.observation}"
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handlePerformSave}
                        disabled={saving}
                        className="bg-blue-600 text-white px-10 py-5 rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center gap-3"
                    >
                        <Save size={20} />
                        {saving ? 'Gravando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const statusColors = {
    'VIGENTE': 'bg-green-50 text-green-700 border-green-200',
    'ALERTA': 'bg-amber-50 text-amber-700 border-amber-200',
    'VENCIDO': 'bg-red-50 text-red-700 border-red-200',
    'EM_RENOVACAO': 'bg-blue-50 text-blue-700 border-blue-200'
};

export default EditDocumentModal;
