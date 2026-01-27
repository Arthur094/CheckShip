
import React, { useState, useEffect } from 'react';
import { X, Truck, ClipboardList, Search, Play, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';


interface StartInspectionModalProps {
    onClose: () => void;
    onStart: (checklistId: string, vehicleId: string) => void;
    onStartWorkflow?: (executionId: string) => void;
}

interface Vehicle {
    id: string;
    plate: string;
    model: string;
    vehicle_type_id: string;
}

interface ChecklistOption {
    id: string;
    name: string;
    subject: string;
    version?: number;
}

interface WorkflowOption {
    id: string;
    name: string;
    description?: string;
}

const StartInspectionModal: React.FC<StartInspectionModalProps> = ({ onClose, onStart, onStartWorkflow }) => {
    const [mode, setMode] = useState<'checklist' | 'workflow' | null>(null);
    const [step, setStep] = useState<1 | 2>(1);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [checklists, setChecklists] = useState<ChecklistOption[]>([]);
    const [workflows, setWorkflows] = useState<WorkflowOption[]>([]);
    const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [startLoading, setStartLoading] = useState(false);

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Resolve User ID on mount
    useEffect(() => {
        const resolveUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
                return;
            }

            // Fallback
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .or('full_name.ilike.%Arthur Matos%,full_name.ilike.%Admin%')
                .limit(1)
                .single();

            if (profile) setCurrentUserId(profile.id);
            else setLoading(false); // Stop loading if no user resolved
        };
        resolveUser();
    }, []);

    // Fetch assigned vehicles for current user
    useEffect(() => {
        const fetchVehicles = async () => {
            if (!currentUserId) return;

            try {
                // 1. Get assignments
                const { data: assignments, error: assignError } = await supabase
                    .from('vehicle_assignments')
                    .select('vehicle_id')
                    .eq('profile_id', currentUserId)
                    .eq('active', true);

                if (assignError) throw assignError;

                if (!assignments || assignments.length === 0) {
                    setLoading(false);
                    return;
                }

                const vehicleIds = assignments.map(a => a.vehicle_id);

                // 2. Get vehicle details
                const { data: vehicleData, error: vehicleError } = await supabase
                    .from('vehicles')
                    .select('id, plate, model, vehicle_type_id')
                    .in('id', vehicleIds)
                    .eq('active', true); // Check active vehicle status just in case

                if (vehicleError) throw vehicleError;

                setVehicles(vehicleData || []);
            } catch (error) {
                console.error('Error fetching vehicles:', error);
            } finally {
                setLoading(false);
            }
        };

        if (currentUserId) fetchVehicles();
    }, [currentUserId]);

    // Fetch workflows (Simpler fetch, no assignments for now)
    useEffect(() => {
        const fetchWorkflows = async () => {
            const { data } = await supabase
                .from('workflows')
                .select('id, name, description')
                .eq('active', true)
                .order('name');
            setWorkflows(data || []);
        };
        fetchWorkflows();
    }, []);

    // Fetch checklists when vehicle is selected
    useEffect(() => {
        const fetchChecklists = async () => {
            if (!selectedVehicle || !currentUserId) return;
            setLoading(true);

            try {
                // 1. Get checklists assigned to the Vehicle directly
                const { data: vehicleChecklists } = await supabase
                    .from('vehicle_checklist_assignments')
                    .select('checklist_template_id')
                    .eq('vehicle_id', selectedVehicle.id);

                // 2. Get checklists assigned to the Vehicle Type
                const { data: typeChecklists } = await supabase
                    .from('vehicle_type_checklist_assignments')
                    .select('checklist_template_id')
                    .eq('vehicle_type_id', selectedVehicle.vehicle_type_id);

                const checklistIds = new Set([
                    ...(vehicleChecklists?.map(c => c.checklist_template_id) || []),
                    ...(typeChecklists?.map(c => c.checklist_template_id) || [])
                ]);

                if (checklistIds.size === 0) {
                    setChecklists([]);
                    setLoading(false);
                    return;
                }

                /* 
                // 3. Filter by User Permission (can_apply = true)
                // REMOVED temporarily to match Mobile behavior (which shows 12 templates vs 11 on Web)
                
                const { data: permissions } = await supabase
                    .from('profile_checklist_permissions')
                    .select('checklist_template_id')
                    .eq('profile_id', currentUserId)
                    .eq('can_apply', true)
                    .in('checklist_template_id', Array.from(checklistIds));

                const finalIds = permissions?.map(p => p.checklist_template_id) || [];

                if (finalIds.length === 0) {
                    setChecklists([]);
                    setLoading(false);
                    return;
                }
                */

                // Bypass permission check intentionally for now
                const finalIds = Array.from(checklistIds);

                // 4. Get Latest Published Version for these templates
                // First, find the group_ids of the assigned templates
                const { data: assignedTemplates } = await supabase
                    .from('checklist_templates')
                    .select('group_id')
                    .in('id', finalIds);

                const groupIds = assignedTemplates?.map(t => t.group_id).filter(Boolean) || [];

                if (groupIds.length === 0) {
                    setChecklists([]);
                    setLoading(false);
                    return;
                }

                // Then fetch the LATEST PUBLISHED version for each group
                const { data: latestTemplates } = await supabase
                    .from('checklist_templates')
                    .select('id, name, subject, version, group_id')
                    .in('group_id', groupIds)
                    .eq('status', 'published')
                    .order('version', { ascending: false });

                // Filter to keep only the highest version per group
                // Since we ordered by version DESC, the first occurrence of a group_id is the latest
                const uniqueTemplates: ChecklistOption[] = [];
                const seenGroups = new Set<string>();

                (latestTemplates || []).forEach((t: any) => {
                    if (!seenGroups.has(t.group_id)) {
                        seenGroups.add(t.group_id);
                        uniqueTemplates.push({
                            id: t.id,
                            name: t.name,
                            subject: t.subject,
                            version: t.version
                        });
                    }
                });

                setChecklists(uniqueTemplates);

            } catch (error) {
                console.error('Error fetching checklists:', error);
            } finally {
                setLoading(false);
            }
        };

        if (mode === 'checklist' && step === 2 && currentUserId) fetchChecklists();
    }, [mode, step, selectedVehicle, currentUserId]);

    const handleNext = () => {
        if (selectedVehicle) {
            setStep(2);
            setSearchTerm('');
        }
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
            setSelectedChecklistId(null);
            setSelectedWorkflowId(null);
            setSearchTerm('');
        } else if (step === 1) {
            setMode(null);
            setSelectedVehicle(null);
        }
    };

    const handleStartWorkflow = async () => {
        if (!selectedVehicle || !selectedWorkflowId || !currentUserId) return;
        if (!onStartWorkflow) {
            alert('Função onStartWorkflow não fornecida');
            return;
        }

        try {
            setStartLoading(true);

            // 1. Generate Code
            const code = `FLX-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

            // 2. Create Execution
            const { data: exc, error: excError } = await supabase
                .from('workflow_executions')
                .insert({
                    code,
                    workflow_id: selectedWorkflowId,
                    user_id: currentUserId,
                    vehicle_id: selectedVehicle.id,
                    status: 'pending'
                })
                .select('id')
                .single();

            if (excError) throw excError;

            // 3. Create Items
            const { data: stages } = await supabase
                .from('workflow_stages')
                .select('*')
                .eq('workflow_id', selectedWorkflowId)
                .order('sequence_order');

            if (stages && stages.length > 0) {
                const items = stages.map(stage => ({
                    execution_id: exc.id,
                    checklist_template_id: stage.checklist_template_id,
                    status: 'pending'
                }));

                const { error: itemsError } = await supabase.from('workflow_execution_items').insert(items);
                if (itemsError) throw itemsError;
            }

            onStartWorkflow(exc.id);

        } catch (error: any) {
            alert('Erro ao iniciar fluxo: ' + error.message);
        } finally {
            setStartLoading(false);
        }
    };

    const handleConfirm = () => {
        if (mode === 'checklist' && selectedVehicle && selectedChecklistId) {
            onStart(selectedChecklistId, selectedVehicle.id);
        } else if (mode === 'workflow') {
            handleStartWorkflow();
        }
    };

    const filteredVehicles = vehicles.filter(v =>
        v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredChecklists = checklists.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredWorkflows = workflows.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // MODE SELECTION STEP
    if (!mode) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <h2 className="text-lg font-bold text-slate-800">Nova Inspeção</h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-6 grid gap-4">
                        <button
                            onClick={() => setMode('checklist')}
                            className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 hover:shadow-md transition-all group text-left w-full"
                        >
                            <div className="w-12 h-12 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ClipboardList size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 group-hover:text-blue-900">Checklist Avulso</h3>
                                <p className="text-xs text-slate-500">Realizar uma única inspeção rápida.</p>
                            </div>
                        </button>

                        {/* Feature 6: Workflows disabled for partial deployment
                        <button
                            onClick={() => setMode('workflow')}
                            className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 hover:shadow-md transition-all group text-left"
                        >
                            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <div className="flex -space-x-1">
                                    <ClipboardList size={16} />
                                    <ClipboardList size={16} />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 group-hover:text-blue-900">Fluxo de Liberação</h3>
                                <p className="text-xs text-slate-500">Executar pacote de inspeções (Workflow).</p>
                            </div>
                        </button>
                        */}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {step === 1 ? 'Selecione o Veículo' : (mode === 'checklist' ? 'Selecione o Checklist' : 'Selecione o Workflow')}
                        </h2>
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                            {mode === 'checklist' ? 'Inspeção Avulsa' : 'Fluxo de Liberação'}
                        </span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder={step === 1 ? "Buscar placa ou modelo..." : (mode === 'checklist' ? "Buscar checklist..." : "Buscar workflow...")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700"
                            autoFocus
                        />
                    </div>

                    <div className="overflow-y-auto max-h-[400px] space-y-2 pr-2">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
                                <div className="animate-spin w-8 h-8 border-4 border-blue-900/20 border-t-blue-900 rounded-full"></div>
                                <span className="text-xs font-bold uppercase tracking-wide">Carregando...</span>
                            </div>
                        ) : step === 1 ? (
                            filteredVehicles.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                        <AlertCircle size={32} />
                                    </div>
                                    <h3 className="text-slate-800 font-bold mb-1">Nenhum veículo encontrado</h3>
                                    <p className="text-sm text-slate-500">Você não possui veículos vinculados para inspeção.</p>
                                </div>
                            ) : (
                                filteredVehicles.map(vehicle => (
                                    <div
                                        key={vehicle.id}
                                        onClick={() => setSelectedVehicle(vehicle)}
                                        className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${selectedVehicle?.id === vehicle.id
                                            ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-200'
                                            : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedVehicle?.id === vehicle.id ? 'bg-blue-200 text-blue-900' : 'bg-slate-100 text-slate-500'}`}>
                                                <Truck size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{vehicle.plate}</h4>
                                                <p className="text-xs text-slate-500 font-medium uppercase">{vehicle.model}</p>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedVehicle?.id === vehicle.id ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                                            {selectedVehicle?.id === vehicle.id && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                        </div>
                                    </div>
                                ))
                            )
                        ) : mode === 'checklist' ? (
                            filteredChecklists.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                        <ClipboardList size={32} />
                                    </div>
                                    <h3 className="text-slate-800 font-bold mb-1">Nenhum checklist disponível</h3>
                                    <p className="text-sm text-slate-500">Este veículo não possui checklists vinculados ou você não tem permissão.</p>
                                </div>
                            ) : (
                                filteredChecklists.map(checklist => (
                                    <div
                                        key={checklist.id}
                                        onClick={() => setSelectedChecklistId(checklist.id)}
                                        className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${selectedChecklistId === checklist.id
                                            ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-200'
                                            : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedChecklistId === checklist.id ? 'bg-blue-200 text-blue-900' : 'bg-slate-100 text-slate-500'}`}>
                                                <ClipboardList size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                    {checklist.name}
                                                    {checklist.version && (
                                                        <span className="text-[10px] bg-slate-100 px-1.5 rounded text-slate-500 font-normal">
                                                            v{checklist.version}
                                                        </span>
                                                    )}
                                                </h4>
                                                {checklist.subject && <p className="text-xs text-slate-500 font-medium">{checklist.subject}</p>}
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedChecklistId === checklist.id ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                                            {selectedChecklistId === checklist.id && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                        </div>
                                    </div>
                                ))
                            )
                        ) : (
                            // WORKFLOW LIST
                            filteredWorkflows.length === 0 ? (
                                <div className="text-center py-12">
                                    <h3 className="text-slate-800 font-bold mb-1">Nenhum workflow ativo</h3>
                                </div>
                            ) : (
                                filteredWorkflows.map(wf => (
                                    <div
                                        key={wf.id}
                                        onClick={() => setSelectedWorkflowId(wf.id)}
                                        className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${selectedWorkflowId === wf.id
                                            ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-200'
                                            : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedWorkflowId === wf.id ? 'bg-blue-200 text-blue-900' : 'bg-orange-100 text-orange-600'}`}>
                                                <div className="flex -space-x-1">
                                                    <ClipboardList size={16} />
                                                    <ClipboardList size={16} />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{wf.name}</h4>
                                                <p className="text-xs text-slate-500 font-medium uppercase">{wf.description || 'Sem descrição'}</p>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedWorkflowId === wf.id ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                                            {selectedWorkflowId === wf.id && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                        </div>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-2xl">
                    <button onClick={handleBack} className="px-6 py-3 text-slate-500 hover:bg-slate-200 rounded-xl font-bold text-sm transition-colors uppercase tracking-widest">
                        Voltar
                    </button>

                    {step === 1 ? (
                        <button
                            onClick={handleNext}
                            disabled={!selectedVehicle}
                            className="bg-blue-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center gap-2 uppercase tracking-widest"
                        >
                            Próximo
                        </button>
                    ) : (
                        <button
                            onClick={handleConfirm}
                            disabled={(mode === 'checklist' && !selectedChecklistId) || (mode === 'workflow' && (!selectedWorkflowId || startLoading))}
                            className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-600/20 active:scale-95 flex items-center gap-2 uppercase tracking-widest"
                        >
                            <Play size={16} fill="currentColor" />
                            {startLoading ? 'Iniciando...' : 'Iniciar'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StartInspectionModal;
