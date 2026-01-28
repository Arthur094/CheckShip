
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Search, Filter, AlertCircle, CheckCircle2, Clock, X,
    FileText, User, Truck, Calendar, ArrowRight, ExternalLink,
    Edit2
} from 'lucide-react';
import { ManagementDocument, ManagementDocStatus } from '../../../types';
import EditDocumentModal from './EditDocumentModal';

const DocManagementDashboard: React.FC = () => {
    const [documents, setDocuments] = useState<ManagementDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [selectedDoc, setSelectedDoc] = useState<ManagementDocument | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('management_documents')
                .select('*, profiles(full_name), vehicles(plate), trailers(plate)')
                .order('expiry_date', { ascending: true });

            if (error) throw error;
            setDocuments(data || []);
        } catch (error: any) {
            console.error('Error fetching dashboard data:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const getEntityName = (doc: any) => {
        if (doc.profiles) return `Motorista: ${doc.profiles.full_name}`;
        if (doc.vehicles) return `Veículo: ${doc.vehicles.plate}`;
        if (doc.trailers) return `Carreta: ${doc.trailers.plate}`;
        return 'N/A';
    };

    const getEntityIcon = (doc: any) => {
        if (doc.profiles) return <User size={18} className="text-blue-500" />;
        if (doc.vehicles) return <Truck size={18} className="text-slate-500" />;
        if (doc.trailers) return <Truck size={18} className="text-amber-500" />;
        return <FileText size={18} />;
    };

    const filteredDocs = documents.filter(doc => {
        const matchesSearch =
            doc.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getEntityName(doc).toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;

        const matchesType = typeFilter === 'ALL' ||
            (typeFilter === 'driver' && doc.profile_id) ||
            (typeFilter === 'vehicle' && doc.vehicle_id) ||
            (typeFilter === 'trailer' && doc.trailer_id);

        return matchesSearch && matchesStatus && matchesType;
    });

    const stats = {
        total: documents.length,
        vencidos: documents.filter(d => d.status === 'VENCIDO').length,
        alerta: documents.filter(d => d.status === 'ALERTA').length,
        vigente: documents.filter(d => d.status === 'VIGENTE').length,
        renovacao: documents.filter(d => d.status === 'EM_RENOVACAO').length
    };

    const statusColors = {
        'VIGENTE': 'bg-green-50 text-green-700 border-green-200',
        'ALERTA': 'bg-amber-50 text-amber-700 border-amber-200',
        'VENCIDO': 'bg-red-50 text-red-700 border-red-200',
        'EM_RENOVACAO': 'bg-blue-50 text-blue-700 border-blue-200'
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Gestão de Documentos</h1>
                    <p className="text-sm text-slate-500 font-medium">Monitoramento centralizado de validades e conformidade.</p>
                </div>
                <button
                    onClick={fetchDocuments}
                    className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                    <Clock size={14} /> ATUALIZAR DADOS
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vencidos (Crítico)</p>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-red-600">{stats.vencidos}</span>
                        <div className="w-10 h-10 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <X size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Em Alerta</p>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-amber-500">{stats.alerta}</span>
                        <div className="w-10 h-10 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <AlertCircle size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Em Renovação</p>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-blue-600">{stats.renovacao}</span>
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <Clock size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vigentes</p>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-green-600">{stats.vigente}</span>
                        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por documento ou entidade..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="ALL">TODOS STATUS</option>
                            <option value="VENCIDO">VENCIDOS</option>
                            <option value="ALERTA">EM ALERTA</option>
                            <option value="EM_RENOVACAO">EM RENOVAÇÃO</option>
                            <option value="VIGENTE">VIGENTES</option>
                        </select>
                        <select
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="ALL">TODOS TIPOS</option>
                            <option value="driver">MOTORISTAS</option>
                            <option value="vehicle">VEÍCULOS</option>
                            <option value="trailer">CARRETAS</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-widest">Entidade / Beneficiário</th>
                            <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-widest">Documento</th>
                            <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-widest text-center">Vencimento</th>
                            <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-widest text-center">Status</th>
                            <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-widest text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="animate-spin w-8 h-8 border-4 border-blue-900/20 border-t-blue-900 rounded-full"></div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Carregando documentos...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredDocs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                                    Nenhum documento encontrado com os filtros aplicados.
                                </td>
                            </tr>
                        ) : filteredDocs.map(doc => (
                            <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-white transition-colors">
                                            {getEntityIcon(doc)}
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{getEntityName(doc)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800 uppercase">{doc.document_type.replace(/_/g, ' ')}</span>
                                        {doc.observation && <span className="text-[10px] text-slate-400 truncate max-w-[200px]">{doc.observation}</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className={`text-sm font-mono font-bold ${doc.status === 'VENCIDO' ? 'text-red-600' : 'text-slate-600'}`}>
                                            {new Date(doc.expiry_date).toLocaleDateString('pt-BR')}
                                        </span>
                                        <span className="text-[8px] text-slate-400 uppercase font-bold">Vence em {Math.ceil((new Date(doc.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black border uppercase ${statusColors[doc.status as keyof typeof statusColors]}`}>
                                        {doc.status.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {doc.file_url && (
                                            <a
                                                href={doc.file_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 text-slate-400 hover:text-blue-900 transition-colors bg-slate-50 rounded-lg hover:bg-white border border-transparent hover:border-slate-200"
                                                title="Ver documento atual"
                                            >
                                                <ExternalLink size={16} />
                                            </a>
                                        )}
                                        <button
                                            onClick={() => {
                                                setSelectedDoc(doc);
                                                setShowEditModal(true);
                                            }}
                                            className="p-2 text-slate-400 hover:text-amber-600 transition-colors bg-slate-50 rounded-lg hover:bg-white border border-transparent hover:border-slate-200"
                                            title="Editar e ver histórico"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {showEditModal && selectedDoc && (
                <EditDocumentModal
                    document={selectedDoc}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedDoc(null);
                    }}
                    onSave={() => {
                        setShowEditModal(false);
                        setSelectedDoc(null);
                        fetchDocuments();
                    }}
                />
            )}
        </div>
    );
};

export default DocManagementDashboard;
