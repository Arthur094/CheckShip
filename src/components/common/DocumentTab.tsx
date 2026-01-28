
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    FileText,
    Upload,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Clock,
    Trash2,
    Plus,
    X,
    ExternalLink
} from 'lucide-react';
import { ManagementDocument, ManagementDocStatus } from '../../../types';

interface DocumentTabProps {
    entityType: 'driver' | 'vehicle' | 'trailer';
    entityId: string | null;
    requiredDocs: string[];
    onEnsureExists?: () => Promise<string | null>;
}

const DocumentTab: React.FC<DocumentTabProps> = ({ entityType, entityId, requiredDocs, onEnsureExists }) => {
    const [documents, setDocuments] = useState<ManagementDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<string | null>(null); // doc_type being uploaded
    const [editingDoc, setEditingDoc] = useState<Partial<ManagementDocument> | null>(null);

    useEffect(() => {
        // Sanitize entityId: some parent components might pass the string "null" 
        // which causes UUID syntax errors in Supabase.
        const safeId = (entityId === 'null' || !entityId) ? null : entityId;

        if (safeId && safeId !== '') {
            fetchDocuments();
        } else {
            setDocuments([]);
            setLoading(false);
        }
    }, [entityId, entityType]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            let query = supabase.from('management_documents').select('*');

            if (entityType === 'driver') query = query.eq('profile_id', entityId);
            else if (entityType === 'vehicle') query = query.eq('vehicle_id', entityId);
            else if (entityType === 'trailer') query = query.eq('trailer_id', entityId);

            const { data, error } = await query;
            if (error) throw error;
            setDocuments(data || []);
        } catch (error: any) {
            console.error('Error fetching documents:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatus = (expiryDate: string): ManagementDocStatus => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'VENCIDO';
        if (diffDays <= 30) return 'ALERTA';
        return 'VIGENTE';
    };

    const handleFileUpload = async (docType: string, file: File) => {
        try {
            setUploading(docType);
            const fileExt = file.name.split('.').pop();
            const fileName = `${entityType}/${entityId}/${docType}_${Date.now()}.${fileExt}`;
            const filePath = `documents/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('management-documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('management-documents')
                .getPublicUrl(filePath);

            setEditingDoc(prev => ({
                ...prev,
                document_type: docType,
                file_url: publicUrl
            }));

        } catch (error: any) {
            alert('Erro no upload: ' + error.message);
        } finally {
            setUploading(null);
        }
    };

    const handleSaveDoc = async () => {
        if (!editingDoc?.expiry_date || !editingDoc?.document_type) {
            alert('Preencha ao menos a data de vencimento.');
            return;
        }

        try {
            setLoading(true);

            // Ensure the parent entity exists in the database
            let validEntityId = entityId;
            if (!validEntityId && onEnsureExists) {
                validEntityId = await onEnsureExists();
                if (!validEntityId) {
                    alert('Erro: Não foi possível salvar o registro principal. Verifique os campos obrigatórios.');
                    return;
                }
            }

            if (!validEntityId) {
                alert('Erro: ID da entidade não disponível. Salve o cadastro principal primeiro.');
                return;
            }

            const status = getStatus(editingDoc.expiry_date);

            const payload: any = {
                document_type: editingDoc.document_type,
                expiry_date: editingDoc.expiry_date,
                issue_date: editingDoc.issue_date || null,
                file_url: editingDoc.file_url || null,
                status: editingDoc.status || status,
                observation: editingDoc.observation,
                renewal_anticipation_days: editingDoc.renewal_anticipation_days || 30
            };

            // Check if document already exists to use ID for update
            const existing = documents.find(d => d.document_type === editingDoc.document_type);
            if (existing?.id) {
                payload.id = existing.id;
            }

            // Defensive: ensure only the target entity ID is present in payload
            payload.profile_id = null;
            payload.vehicle_id = null;
            payload.trailer_id = null;

            if (entityType === 'driver') payload.profile_id = validEntityId;
            else if (entityType === 'vehicle') payload.vehicle_id = validEntityId;
            else if (entityType === 'trailer') payload.trailer_id = validEntityId;

            const { error } = await supabase
                .from('management_documents')
                .upsert([payload]); // ID-based upsert (if id exists) or Insert (if not)

            if (error) throw error;

            setEditingDoc(null);
            fetchDocuments();
        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, fileUrl?: string | null) => {
        if (!confirm('Deseja excluir este documento?')) return;

        try {
            setLoading(true);
            const { error } = await supabase.from('management_documents').delete().eq('id', id);
            if (error) throw error;
            fetchDocuments();
        } catch (error: any) {
            alert('Erro ao excluir: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderDocCard = (type: string) => {
        const doc = documents.find(d => d.document_type === type);
        const isEditing = editingDoc?.document_type === type;

        const statusColors = {
            'VIGENTE': 'bg-green-50 text-green-700 border-green-200',
            'ALERTA': 'bg-amber-50 text-amber-700 border-amber-200',
            'VENCIDO': 'bg-red-50 text-red-700 border-red-200',
            'EM_RENOVACAO': 'bg-blue-50 text-blue-700 border-blue-200'
        };

        const StatusIcon = {
            'VIGENTE': CheckCircle2,
            'ALERTA': AlertCircle,
            'VENCIDO': X,
            'EM_RENOVACAO': Clock
        }[doc?.status || 'PENDENTE'] || Clock;

        return (
            <div key={type} className={`p-4 rounded-xl border transition-all ${doc ? 'bg-white' : 'bg-slate-50 border-dashed hover:border-blue-300'}`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${doc ? 'bg-blue-50 text-blue-900' : 'bg-slate-200 text-slate-400'}`}>
                            <FileText size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm uppercase">{type.replace(/_/g, ' ')}</h4>
                            {doc && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${statusColors[doc.status as keyof typeof statusColors]}`}>
                                    {doc.status}
                                </span>
                            )}
                        </div>
                    </div>
                    {doc && (
                        <div className="flex items-center gap-2">
                            {doc.file_url && (
                                <a href={doc.file_url} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-blue-900 transition-colors">
                                    <ExternalLink size={16} />
                                </a>
                            )}
                            <button onClick={() => setEditingDoc(doc)} className="p-1.5 text-slate-400 hover:text-blue-900 transition-colors">
                                <Clock size={16} />
                            </button>
                            <button onClick={() => handleDelete(doc.id, doc.file_url)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {doc ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase text-slate-400 font-bold block">Vencimento</span>
                            <div className="flex items-center gap-1.5 text-slate-700 text-sm font-medium">
                                <Calendar size={14} className="text-slate-400" />
                                {new Date(doc.expiry_date).toLocaleDateString('pt-BR')}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase text-slate-400 font-bold block">Emissão</span>
                            <div className="text-slate-500 text-sm">
                                {doc.issue_date ? new Date(doc.issue_date).toLocaleDateString('pt-BR') : '-'}
                            </div>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setEditingDoc({ document_type: type })}
                        className="w-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-blue-900 hover:text-blue-800 transition-colors"
                    >
                        <Plus size={16} />
                        CONFIGURAR DOCUMENTO
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requiredDocs.map(renderDocCard)}
            </div>

            {/* Edit Modal */}
            {editingDoc && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-bold text-slate-800 uppercase text-sm">Configurar: {editingDoc.document_type?.replace(/_/g, ' ')}</h3>
                            <button onClick={() => setEditingDoc(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Data Emissão</label>
                                    <input
                                        type="date"
                                        value={editingDoc.issue_date || ''}
                                        onChange={e => setEditingDoc(prev => ({ ...prev, issue_date: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Data Vencimento *</label>
                                    <input
                                        type="date"
                                        value={editingDoc.expiry_date || ''}
                                        onChange={e => setEditingDoc(prev => ({ ...prev, expiry_date: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase text-blue-900">Status Especial</label>
                                <select
                                    value={editingDoc.status || ''}
                                    onChange={e => setEditingDoc(prev => ({ ...prev, status: e.target.value as ManagementDocStatus }))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">Automático (Baseado em data)</option>
                                    <option value="EM_RENOVACAO">Em Renovação (Permite Checklist)</option>
                                    <option value="VIGENTE">Vigente (Forçar)</option>
                                    <option value="VENCIDO">Vencido (Bloqueia)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Arquivo (PDF/Img)</label>
                                <div className="flex items-center gap-3">
                                    <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg transition-all cursor-pointer ${editingDoc.file_url ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 hover:border-blue-300 text-slate-500'}`}>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={e => e.target.files?.[0] && handleFileUpload(editingDoc.document_type!, e.target.files[0])}
                                            disabled={uploading === editingDoc.document_type}
                                        />
                                        {uploading === editingDoc.document_type ? (
                                            <div className="flex items-center gap-2 animate-pulse">
                                                <Clock size={16} /> Enviando...
                                            </div>
                                        ) : editingDoc.file_url ? (
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 size={16} /> Arquivo Pronto
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Upload size={16} /> Selecionar Arquivo
                                            </div>
                                        )}
                                    </label>
                                    {editingDoc.file_url && (
                                        <button
                                            onClick={() => setEditingDoc(prev => ({ ...prev, file_url: null }))}
                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button onClick={() => setEditingDoc(null)} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Cancelar</button>
                            <button onClick={handleSaveDoc} className="bg-blue-900 text-white px-8 py-2 rounded-lg font-bold text-sm shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition-all uppercase tracking-widest">Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentTab;
