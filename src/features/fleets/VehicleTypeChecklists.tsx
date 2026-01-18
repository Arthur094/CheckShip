
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface VehicleTypeChecklistsProps {
    vehicleTypeId: string | null;
    onEnsureExists: () => Promise<boolean>;
}

const VehicleTypeChecklists: React.FC<VehicleTypeChecklistsProps> = ({ vehicleTypeId, onEnsureExists }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [templates, setTemplates] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!vehicleTypeId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // 1. Fetch all checklist templates
            const { data: templatesData, error: templatesError } = await supabase
                .from('checklist_templates')
                .select('id, name')
                .order('name');

            if (templatesError) throw templatesError;

            // 2. Fetch current assignments for this vehicle type
            const { data: assignmentsData, error: assignmentsError } = await supabase
                .from('vehicle_type_checklist_assignments')
                .select('checklist_template_id')
                .eq('vehicle_type_id', vehicleTypeId);

            if (assignmentsError) throw assignmentsError;

            setTemplates(templatesData || []);
            setAssignments(new Set((assignmentsData || []).map(a => a.checklist_template_id)));
        } catch (error: any) {
            console.error('Error fetching checklists/assignments:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [vehicleTypeId]);

    const handleToggleLink = async (templateId: string, isLinked: boolean) => {
        if (!vehicleTypeId) return;

        // Ensure vehicle type exists in DB before linking
        const exists = await onEnsureExists();
        if (!exists) return;

        try {
            if (isLinked) {
                // Remove assignment
                const { error } = await supabase
                    .from('vehicle_type_checklist_assignments')
                    .delete()
                    .match({ vehicle_type_id: vehicleTypeId, checklist_template_id: templateId });

                if (error) throw error;

                const newAssignments = new Set(assignments);
                newAssignments.delete(templateId);
                setAssignments(newAssignments);
            } else {
                // Add assignment - use upsert to avoid duplicate key errors
                const { error } = await supabase
                    .from('vehicle_type_checklist_assignments')
                    .upsert(
                        { vehicle_type_id: vehicleTypeId, checklist_template_id: templateId },
                        { onConflict: 'vehicle_type_id, checklist_template_id', ignoreDuplicates: true }
                    );

                if (error) throw error;

                const newAssignments = new Set(assignments);
                newAssignments.add(templateId);
                setAssignments(newAssignments);
            }
        } catch (error: any) {
            console.error('Error toggling assignment:', error.message);
            alert('Erro ao atualizar vínculo: ' + error.message);
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBulkToggle = async () => {
        if (!vehicleTypeId || filteredTemplates.length === 0) return;

        const exists = await onEnsureExists();
        if (!exists) return;

        const allLinked = filteredTemplates.every(t => assignments.has(t.id));
        const targetState = !allLinked;

        try {
            if (targetState) {
                // Link all
                const toAdd = filteredTemplates
                    .filter(t => !assignments.has(t.id))
                    .map(t => ({
                        vehicle_type_id: vehicleTypeId,
                        checklist_template_id: t.id
                    }));

                if (toAdd.length > 0) {
                    const { error } = await supabase
                        .from('vehicle_type_checklist_assignments')
                        .upsert(toAdd, { onConflict: 'vehicle_type_id, checklist_template_id', ignoreDuplicates: true });

                    if (error) throw error;
                }

                const newAssignments = new Set(assignments);
                filteredTemplates.forEach(t => newAssignments.add(t.id));
                setAssignments(newAssignments);

            } else {
                // Unlink all
                const idsToRemove = filteredTemplates.map(t => t.id);
                const { error } = await supabase
                    .from('vehicle_type_checklist_assignments')
                    .delete()
                    .eq('vehicle_type_id', vehicleTypeId)
                    .in('checklist_template_id', idsToRemove);

                if (error) throw error;

                const newAssignments = new Set(assignments);
                filteredTemplates.forEach(t => newAssignments.delete(t.id));
                setAssignments(newAssignments);
            }

            alert(`Ação em massa concluída: ${targetState ? 'Todos vinculados' : 'Todos desvinculados'}`);

        } catch (error: any) {
            console.error('Error bulk updating:', error.message);
            alert('Erro ao atualizar em massa: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center text-slate-400">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
                <p className="text-sm">Carregando checklists...</p>
            </div>
        );
    }

    if (!vehicleTypeId) {
        return (
            <div className="p-12 text-center text-slate-400 italic">
                Salve o tipo de veículo primeiro para vincular checklists.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="px-8 py-6">
                <div className="relative flex items-center bg-white rounded-lg border border-slate-200 shadow-sm">
                    <Search size={20} className="absolute left-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar checklist"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                        <div className="col-span-10">Checklist</div>
                        <div className="col-span-2 text-right group flex items-center justify-end gap-2 cursor-pointer" onClick={handleBulkToggle}>
                            <span className="group-hover:hidden">Vincular</span>
                            <span className="hidden group-hover:block text-blue-600 font-extrabold text-[10px] tracking-wide bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shadow-sm transition-all">MARCAR TODOS</span>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {filteredTemplates.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                Nenhum checklist encontrado.
                            </div>
                        ) : (
                            filteredTemplates.map((template) => {
                                const isLinked = assignments.has(template.id);
                                return (
                                    <div key={template.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
                                        <div className="col-span-10 text-sm text-slate-700 font-medium">
                                            {template.name}
                                        </div>
                                        <div className="col-span-2 flex justify-end">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={isLinked}
                                                    onChange={() => handleToggleLink(template.id, isLinked)}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                            </label>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleTypeChecklists;
