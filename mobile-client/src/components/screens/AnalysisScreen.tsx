import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { cacheService } from '../../services/cacheService';
import BottomNav from '../BottomNav';

interface AnalysisItem {
    id: string;
    status: string;
    analysis_status: string | null;
    analysis_current_step: number;
    analysis_total_steps: number;
    analysis_first_reason?: string | null;
    analysis_second_reason?: string | null;
    completed_at: string;
    vehicle: {
        plate: string;
        model: string;
    } | null;
    template: {
        name: string;
    } | null;
}

const AnalysisScreen: React.FC = () => {
    const [items, setItems] = useState<AnalysisItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<AnalysisItem | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);

    useEffect(() => {
        const sync = cacheService.getLastSync();
        setLastSync(sync);
        fetchAnalysisItems();
    }, []);

    const handleSync = async () => {
        if (syncing) return;
        setSyncing(true);
        try {
            const userId = cacheService.getUserId();
            if (userId) {
                await cacheService.downloadAllData(userId, supabase);
                const sync = cacheService.getLastSync();
                setLastSync(sync);
                await fetchAnalysisItems();
                alert('✅ Dados sincronizados com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao sincronizar:', error);
            alert('❌ Erro ao sincronizar dados');
        } finally {
            setSyncing(false);
        }
    };

    const fetchAnalysisItems = async () => {
        setLoading(true);
        try {
            const userId = cacheService.getUserId();

            // Fetch inspections that:
            // 1. Are pending analysis (current user is driver waiting for approval)
            // 2. Recently approved/rejected (last 7 days)
            const { data, error } = await supabase
                .from('checklist_inspections')
                .select(`
          id,
          status,
          analysis_status,
          analysis_current_step,
          analysis_total_steps,
          analysis_first_reason,
          analysis_second_reason,
          completed_at,
          vehicle:vehicles!vehicle_id (plate, model),
          template:checklist_templates!checklist_template_id (name)
        `)
                .eq('inspector_id', userId)
                .or('status.eq.pending,analysis_status.in.(approved,rejected)')
                .order('completed_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            // Map Supabase array results to single objects
            const mappedData = (data || []).map((item: any) => ({
                ...item,
                vehicle: Array.isArray(item.vehicle) ? item.vehicle[0] : item.vehicle,
                template: Array.isArray(item.template) ? item.template[0] : item.template,
            }));
            setItems(mappedData);
        } catch (error: any) {
            console.error('Erro ao carregar análises:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (item: AnalysisItem) => {
        if (item.analysis_status === 'approved') return 'bg-green-100 text-green-700 border-green-200';
        if (item.analysis_status === 'rejected') return 'bg-red-100 text-red-700 border-red-200';
        return 'bg-amber-100 text-amber-700 border-amber-200';
    };

    const getStatusLabel = (item: AnalysisItem) => {
        if (item.analysis_status === 'approved') return 'APROVADO';
        if (item.analysis_status === 'rejected') return 'REPROVADO';
        return `EM ANÁLISE (${item.analysis_current_step || 0}/${item.analysis_total_steps || 1})`;
    };

    const handleCardClick = (item: AnalysisItem) => {
        setSelectedItem(item);
    };

    const closeModal = () => {
        setSelectedItem(null);
    };

    return (
        <div className="min-h-screen bg-background-light pb-20">
            {/* Header with CheckShip logo and sync button */}
            <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 z-20 sticky top-0">
                <div className="flex items-center gap-3">
                    {/* CS Box Logo */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary shadow-sm">
                        <span className="text-lg font-bold text-white">CS</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 tracking-wide">CHECKSHIP</h1>
                        {lastSync && (
                            <p className="text-xs text-slate-500">
                                Sync: {new Date(lastSync).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="size-10 flex items-center justify-center disabled:opacity-50"
                    title="Sincronizar dados"
                >
                    <span className={`material-symbols-outlined ${syncing ? 'animate-spin' : ''}`}>sync</span>
                </button>
            </header>

            {/* Subtitle */}
            <div className="px-4 pt-4 pb-2">
                <h2 className="font-bold text-slate-800">Análise de Checklists</h2>
                <p className="text-xs text-slate-500">Acompanhe o status de aprovação das suas inspeções</p>
            </div>

            {/* Content */}
            <main className="p-4 space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <span className="material-symbols-outlined text-6xl mb-4 block opacity-50">assignment_turned_in</span>
                        <p className="font-medium">Nenhuma análise pendente</p>
                        <p className="text-sm mt-1">Suas inspeções concluídas aparecerão aqui</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleCardClick(item)}
                            className={`bg-white rounded-xl border p-4 cursor-pointer transition-all active:scale-[0.98] ${getStatusColor(item)}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 truncate">
                                        {item.vehicle?.plate || 'Veículo não encontrado'}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">
                                        {item.template?.name || 'Checklist'}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {new Date(item.completed_at).toLocaleDateString('pt-BR')} às{' '}
                                        {new Date(item.completed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className="shrink-0">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(item)}`}>
                                        {getStatusLabel(item)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </main>

            {/* Status Modal */}
            {selectedItem && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-t-2xl w-full max-w-lg p-6 animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {selectedItem.analysis_status === 'approved' ? (
                            <>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
                                    <h3 className="text-lg font-bold text-green-700">Checklist Aprovado</h3>
                                </div>
                                <p className="text-slate-600">
                                    ✅ <strong>Pode prosseguir com o início da viagem.</strong>
                                </p>
                                <p className="text-xs text-slate-400 mt-2">
                                    Aprovado em {new Date(selectedItem.completed_at).toLocaleString('pt-BR')}
                                </p>
                            </>
                        ) : selectedItem.analysis_status === 'rejected' ? (
                            <>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="material-symbols-outlined text-red-600 text-4xl">cancel</span>
                                    <h3 className="text-lg font-bold text-red-700">Checklist Reprovado</h3>
                                </div>
                                <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
                                    <p className="text-xs font-bold text-red-800 uppercase mb-2">Motivo da Reprovação:</p>
                                    <p className="text-sm text-red-700">
                                        {selectedItem.analysis_first_reason || selectedItem.analysis_second_reason || 'Nenhuma justificativa informada'}
                                    </p>
                                </div>
                                <p className="text-xs text-slate-400">
                                    ⚠️ Entre em contato com o gestor para mais informações.
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="material-symbols-outlined text-amber-600 text-4xl">hourglass_top</span>
                                    <h3 className="text-lg font-bold text-amber-700">Aguardando Análise</h3>
                                </div>
                                <p className="text-slate-600">
                                    Seu checklist está na fila para aprovação.
                                </p>
                                <div className="flex items-center gap-2 mt-4">
                                    <span className="text-sm text-slate-500">Etapa:</span>
                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
                                        {selectedItem.analysis_current_step || 0}/{selectedItem.analysis_total_steps || 1}
                                    </span>
                                </div>
                            </>
                        )}

                        <button
                            onClick={closeModal}
                            className="w-full mt-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
};

export default AnalysisScreen;
