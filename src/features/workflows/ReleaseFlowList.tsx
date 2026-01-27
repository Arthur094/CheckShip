
import React, { useState, useEffect } from 'react';
import { Layers, Plus, Search, CheckCircle2, XCircle, Clock, ChevronRight, Truck, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Execution {
    id: string;
    code: string;
    vehicle: { plate: string; model: string };
    user: { full_name: string };
    workflow: { name: string };
    status: string;
    started_at: string;
    completed_at?: string;
    progress_numerator: number;
    progress_denominator: number;
}

const ReleaseFlowList: React.FC = () => {
    const [executions, setExecutions] = useState<Execution[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchExecutions();
    }, []);

    const fetchExecutions = async () => {
        setLoading(true);
        try {
            // 1. Fetch executions (Without Profile Join)
            const { data, error } = await supabase
                .from('workflow_executions')
                .select(`
          *,
          vehicle:vehicles(plate, model),
          workflow:workflows(name),
          items:workflow_execution_items(status)
        `)
                .order('started_at', { ascending: false });

            if (error) throw error;

            // 1.5 Fetch Profiles Manually
            const userIds = [...new Set((data || []).map((e: any) => e.user_id).filter(Boolean))];
            let usersMap: Record<string, any> = {};

            if (userIds.length > 0) {
                const { data: users } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .in('id', userIds);

                (users || []).forEach((u: any) => { usersMap[u.id] = u; });
            }

            // 2. Process progress and merge user
            const processed = (data || []).map((exc: any) => ({
                ...exc,
                user: usersMap[exc.user_id] || { full_name: 'Desconhecido' },
                progress_numerator: exc.items?.filter((i: any) => i.status === 'completed').length || 0,
                progress_denominator: exc.items?.length || 0
            }));

            setExecutions(processed);
        } catch (error) {
            console.error('Error fetching executions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Liberado</span>;
            case 'rejected': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Reprovado</span>;
            default: return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Em Andamento</span>;
        }
    };

    // Feature disabled temporarily
    const isFeatureEnabled = false;

    if (!isFeatureEnabled) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[calc(100vh-200px)] animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <Layers size={32} className="text-slate-400" />
                </div>
                <h1 className="text-2xl font-bold text-slate-700 mb-2">Módulo em Breve</h1>
                <p className="text-slate-500 max-w-md">
                    O fluxo de liberação está sendo finalizado e estará disponível em breve para uso geral.
                </p>
            </div>
        );
    }

    const filteredExecutions = executions.filter(exc => {
        const searchLower = searchTerm.toLowerCase();
        const plate = exc.vehicle?.plate.toLowerCase() || '';
        const user = exc.user?.full_name?.toLowerCase() || '';
        const date = new Date(exc.started_at).toLocaleDateString('pt-BR');

        return plate.includes(searchLower) || user.includes(searchLower) || date.includes(searchLower);
    });

    return (
        <div className="p-8 space-y-6 animate-in slide-in-from-right duration-300">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Layers className="text-blue-900" />
                        Fluxo de Liberação
                    </h1>
                    <p className="text-slate-500">Acompanhe os processos de liberação de veículos.</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por placa, motorista ou data..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    />
                </div>
            </header>

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-400">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full mb-4"></div>
                        <p>Carregando fluxos...</p>
                    </div>
                ) : filteredExecutions.length === 0 ? (
                    <div className="p-20 text-center">
                        <Layers size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-600">Nenhum fluxo encontrado</h3>
                        <p className="text-slate-500 mb-6">Utilize o menu "Iniciar Inspeção" para criar um novo fluxo.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredExecutions.map(exc => (
                            <div
                                key={exc.id}
                                onClick={() => navigate(`/release-flows/${exc.id}`)}
                                className="p-6 hover:bg-slate-50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center justify-between">
                                    {/* Left Info */}
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${exc.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            exc.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {exc.status === 'approved' ? <CheckCircle2 /> : exc.status === 'rejected' ? <XCircle /> : <Clock />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="font-mono text-xs font-bold text-slate-400">#{exc.code}</span>
                                                {getStatusBadge(exc.status)}
                                            </div>

                                            {/* Main Title: Plate instead of Workflow Name */}
                                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                {exc.vehicle?.plate}
                                                <span className="text-sm font-normal text-slate-500 uppercase tracking-wide">
                                                    {exc.vehicle?.model}
                                                </span>
                                            </h3>

                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                                    <User size={14} /> {exc.user?.full_name}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(exc.started_at).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Info */}
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Progresso</p>
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-2xl font-black text-slate-800">
                                                {Math.round((exc.progress_numerator / (exc.progress_denominator || 1)) * 100)}%
                                            </span>
                                            <span className="text-xs text-slate-500 font-bold">
                                                ({exc.progress_numerator}/{exc.progress_denominator})
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReleaseFlowList;
