
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface FleetUsersProps {
    vehicleId: string | null;
    onEnsureExists: () => Promise<boolean>;
}

const FleetUsers: React.FC<FleetUsersProps> = ({ vehicleId, onEnsureExists }) => {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!vehicleId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // 1. Fetch all drivers
            const { data: driversData, error: driversError } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .eq('role', 'MOTORISTA')
                .order('full_name');

            if (driversError) throw driversError;

            // 2. Fetch current assignments for this vehicle
            const { data: assignmentsData, error: assignmentsError } = await supabase
                .from('vehicle_assignments')
                .select('profile_id')
                .eq('vehicle_id', vehicleId);

            if (assignmentsError) throw assignmentsError;

            setDrivers(driversData || []);
            setAssignments(new Set((assignmentsData || []).map(a => a.profile_id)));
        } catch (error: any) {
            console.error('Error fetching drivers/assignments:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [vehicleId]);

    const handleToggleLink = async (profileId: string, isLinked: boolean) => {
        if (!vehicleId) return;

        // Ensure vehicle exists in DB before linking
        const exists = await onEnsureExists();
        if (!exists) return;

        try {
            if (isLinked) {
                // Remove assignment
                const { error } = await supabase
                    .from('vehicle_assignments')
                    .delete()
                    .match({ vehicle_id: vehicleId, profile_id: profileId });

                if (error) throw error;

                const newAssignments = new Set(assignments);
                newAssignments.delete(profileId);
                setAssignments(newAssignments);
            } else {
                // Add assignment
                const { error } = await supabase
                    .from('vehicle_assignments')
                    .insert({ vehicle_id: vehicleId, profile_id: profileId });

                if (error) throw error;

                const newAssignments = new Set(assignments);
                newAssignments.add(profileId);
                setAssignments(newAssignments);
            }
        } catch (error: any) {
            console.error('Error toggling assignment:', error.message);
            alert('Erro ao atualizar vínculo: ' + error.message);
        }
    };

    const handleBulkToggle = async () => {
        if (!vehicleId || drivers.length === 0) return;

        // Ensure vehicle exists in DB
        const exists = await onEnsureExists();
        if (!exists) return;

        // Determine target state
        const allLinked = drivers.every(d => assignments.has(d.id));
        const targetState = !allLinked;

        try {
            if (targetState) {
                // Link all drivers
                const toAdd = drivers
                    .filter(d => !assignments.has(d.id))
                    .map(d => ({
                        vehicle_id: vehicleId,
                        profile_id: d.id
                    }));

                if (toAdd.length > 0) {
                    const { error } = await supabase
                        .from('vehicle_assignments')
                        .upsert(toAdd, { onConflict: 'vehicle_id, profile_id', ignoreDuplicates: true });

                    if (error) throw error;
                }

                const newAssignments = new Set(assignments);
                drivers.forEach(d => newAssignments.add(d.id));
                setAssignments(newAssignments);

            } else {
                // Unlink all drivers
                const idsToRemove = drivers.map(d => d.id);

                const { error } = await supabase
                    .from('vehicle_assignments')
                    .delete()
                    .eq('vehicle_id', vehicleId)
                    .in('profile_id', idsToRemove);

                if (error) throw error;

                const newAssignments = new Set(assignments);
                drivers.forEach(d => newAssignments.delete(d.id));
                setAssignments(newAssignments);
            }

            alert(`Ação em massa concluída: ${targetState ? 'Todos vinculados' : 'Todos desvinculados'}`);

        } catch (error: any) {
            console.error('Error bulk updating assignments:', error.message);
            alert('Erro ao atualizar em massa: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center text-slate-400">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
                <p className="text-sm">Carregando motoristas...</p>
            </div>
        );
    }

    if (!vehicleId) {
        return (
            <div className="p-12 text-center text-slate-400 italic">
                Crie o veículo primeiro para vincular motoristas.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="flex-1 overflow-y-auto px-8 py-8">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                        <div className="col-span-6">Usuário</div>
                        <div className="col-span-4">Tipo de Usuário</div>
                        <div className="col-span-2 text-right group flex items-center justify-end gap-2 cursor-pointer" onClick={handleBulkToggle}>
                            <span className="group-hover:hidden">Vincular</span>
                            <span className="hidden group-hover:block text-blue-600 font-extrabold text-[10px] tracking-wide bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shadow-sm transition-all">MARCAR TODOS</span>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-slate-100">
                        {drivers.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                Nenhum motorista encontrado.
                            </div>
                        ) : (
                            drivers.map((driver) => {
                                const isLinked = assignments.has(driver.id);
                                return (
                                    <div key={driver.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
                                        <div className="col-span-6 text-sm text-slate-700 font-medium">
                                            {driver.full_name}
                                        </div>
                                        <div className="col-span-4 text-sm">
                                            <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                {driver.role}
                                            </span>
                                        </div>
                                        <div className="col-span-2 flex justify-end">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={isLinked}
                                                    onChange={() => handleToggleLink(driver.id, isLinked)}
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

export default FleetUsers;
