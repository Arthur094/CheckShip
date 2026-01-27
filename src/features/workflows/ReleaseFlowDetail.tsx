
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, CheckCircle2, Circle, Play, Truck, User, Calendar, AlertCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExecutionItem {
    id: string;
    checklist_template_id: string;
    status: 'pending' | 'completed';
    inspection_id?: string;
    template_name?: string;
}

interface ReleaseFlowDetailProps {
    executionId: string;
    onBack: () => void;
    onStartInspection: (templateId: string, vehicleId: string, itemExecutionId: string) => void;
}

const ReleaseFlowDetail: React.FC<ReleaseFlowDetailProps> = ({ executionId, onBack, onStartInspection }) => {
    const [execution, setExecution] = useState<any>(null);
    const [items, setItems] = useState<ExecutionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchExecutionDetails();
    }, [executionId]);

    const fetchExecutionDetails = async () => {
        setLoading(true);
        try {
            // 1. Fetch Execution Header (Without Profile Join)
            const { data: exc, error: excError } = await supabase
                .from('workflow_executions')
                .select(`
          *,
          vehicle:vehicles(id, plate, model),
          workflow:workflows(name, description)
        `)
                .eq('id', executionId)
                .single();

            if (excError) throw excError;

            // 1.5 Fetch Profile Manually
            let userData = null;
            if (exc.user_id) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', exc.user_id)
                    .single();
                userData = profile;
            }

            const executionWithUser = {
                ...exc,
                user: userData
            };
            setExecution(executionWithUser);

            // 2. Fetch Items with Template Names
            // We need to join manually or use a view, but for now let's fetch items and then templates
            const { data: itemsData, error: itemsError } = await supabase
                .from('workflow_execution_items')
                .select('*')
                .eq('execution_id', executionId);

            if (itemsError) throw itemsError;

            // 3. Fetch Template Names
            const templateIds = itemsData.map((i: any) => i.checklist_template_id);
            const { data: templates } = await supabase
                .from('checklist_templates')
                .select('id, name')
                .in('id', templateIds);

            const templatesMap = (templates || []).reduce((acc: any, t: any) => ({ ...acc, [t.id]: t.name }), {});

            const formattedItems = itemsData.map((i: any) => ({
                ...i,
                template_name: templatesMap[i.checklist_template_id] || 'Template Desconhecido'
            }));

            setItems(formattedItems);

        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false);
        }
    };

    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        fetchCurrentUserRole();
    }, []);

    const fetchCurrentUserRole = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            setUserRole(data?.role || null);
        }
    };

    const handleFinishFlow = async () => {
        if (items.some(i => i.status !== 'completed')) return alert('Complete todos os checklists antes de finalizar.');

        // Approver Check
        if (userRole !== 'ADMIN_MASTER' && userRole !== 'GESTOR') {
            return alert('Apenas gestores podem aprovar a liberação.');
        }

        try {
            // Update workflow status to approved
            const { error } = await supabase
                .from('workflow_executions')
                .update({ status: 'approved', completed_at: new Date().toISOString() })
                .eq('id', executionId);

            if (error) throw error;
            alert('Fluxo aprovado com sucesso!');
            onBack();
        } catch (error: any) {
            alert('Erro ao finalizar fluxo: ' + error.message);
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-400">Carregando detalhes...</div>;
    if (!execution) return <div className="p-12 text-center text-slate-400">Fluxo não encontrado.</div>;

    const progress = Math.round((items.filter(i => i.status === 'completed').length / items.length) * 100);
    const isApprover = userRole === 'ADMIN_MASTER' || userRole === 'GESTOR';

    return (
        <div className="p-4 md:p-8 space-y-6 animate-in slide-in-from-right duration-300 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                        {execution.workflow?.name}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-mono">
                        <span>#{execution.code}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className={execution.status === 'approved' ? 'text-green-600 font-bold' : 'text-amber-600 font-bold'}>
                            {execution.status === 'approved' ? 'LIBERADO' : 'EM ANDAMENTO'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-900">
                        <Truck size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Veículo</p>
                        <p className="font-bold text-slate-800 text-lg">{execution.vehicle?.plate}</p>
                        <p className="text-xs text-slate-500">{execution.vehicle?.model}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
                        <User size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Responsável</p>
                        <p className="font-bold text-slate-800">{execution.user?.full_name}</p>
                        <p className="text-xs text-slate-500">{new Date(execution.started_at).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
                        <div className="text-xs font-bold">{progress}%</div>
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-slate-400 uppercase font-bold">Progresso</p>
                        <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                            <div className="bg-blue-900 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    Checklists Obrigatórios
                </h3>

                {items.map((item, idx) => (
                    <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition-all flex items-center justify-between group ${item.status === 'completed'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            {item.status === 'completed' ? (
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                                    <CheckCircle2 size={18} />
                                </div>
                            ) : (
                                <div className="w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center text-slate-400 font-bold text-xs">
                                    {idx + 1}
                                </div>
                            )}

                            <div>
                                <h4 className={`font-bold ${item.status === 'completed' ? 'text-green-800' : 'text-slate-800'}`}>
                                    {item.template_name}
                                </h4>
                                {item.status === 'completed' && (
                                    <p className="text-xs text-green-600 font-medium">Concluído</p>
                                )}
                            </div>
                        </div>

                        {item.status === 'pending' && execution.status !== 'approved' && (
                            <button
                                onClick={() => onStartInspection(item.checklist_template_id, execution.vehicle.id, item.id)}
                                className="bg-blue-900 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-blue-800 flex items-center gap-2"
                            >
                                INICIAR <Play size={12} />
                            </button>
                        )}

                        {item.status === 'completed' && (
                            <button className="text-green-700 font-bold text-xs bg-green-100 px-3 py-1 rounded-full">
                                FEITO
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Finish Action */}
            <div className="pt-6 border-t border-slate-200">
                {progress === 100 ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                        <div className="w-12 h-12 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-blue-900 mb-1">Fluxo Finalizado</h3>
                        <p className="text-slate-600">Todos os checklists foram concluídos. Aguarde a análise da gestão.</p>
                    </div>
                ) : (
                    <>
                        <button
                            disabled={true}
                            className="w-full py-4 rounded-xl font-bold text-lg shadow-sm bg-slate-100 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <AlertCircle size={24} />
                            {execution.status === 'approved' ? 'FLUXO JÁ LIBERADO' : 'AGUARDANDO CONCLUSÃO'}
                        </button>
                        <p className="text-center text-xs text-slate-400 mt-2">
                            Complete todos os itens acima para habilitar a liberação.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReleaseFlowDetail;
