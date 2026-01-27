import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Star, User, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RankingItem {
    driver_id: string;
    driver_name: string;
    avatar_url?: string;
    average_score: number;
    total_inspections: number;
    rank: number;
}

const DriverRanking: React.FC = () => {
    const [ranking, setRanking] = useState<RankingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');

    useEffect(() => {
        fetchRanking();
    }, [period]);

    const fetchRanking = async () => {
        try {
            setLoading(true);

            // Definição de datas para filtro
            let startDate = new Date();
            if (period === 'week') startDate.setDate(startDate.getDate() - 7);
            if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);
            if (period === 'all') startDate = new Date(0); // Desde o início

            // Query bruta para calcular médias (Supabase não tem AVG fácil via client sem Views)
            // Vamos buscar todas as inspeções com score e calcular no front por enquanto (para MVP é OK)
            // Em produção com milhares de dados, ideal seria uma RPC ou View no banco.
            const { data, error } = await supabase
                .from('checklist_inspections')
                .select(`
                    score,
                    inspector_id,
                    user:profiles!inspector_id (full_name, avatar_url)
                `)
                .not('score', 'is', null) // Corrigido filtro de não nulo
                .gte('started_at', startDate.toISOString())
                .in('status', ['completed', 'approved']); // Aceitar completed e approved (caso exista legado)

            if (error) throw error;

            console.log('Dados para ranking:', data);

            // Agregação manual
            const agg: Record<string, { total: number; count: number; name: string; avatar?: string }> = {};

            data.forEach((item: any) => {
                const uid = item.inspector_id;
                if (!agg[uid]) {
                    agg[uid] = {
                        total: 0,
                        count: 0,
                        name: item.user?.full_name || 'Desconhecido',
                        avatar: item.user?.avatar_url
                    };
                }
                agg[uid].total += Number(item.score);
                agg[uid].count += 1;
            });

            // Converter para array e ordenar
            const sortedRanking: RankingItem[] = Object.entries(agg)
                .map(([id, info]) => ({
                    driver_id: id,
                    driver_name: info.name,
                    avatar_url: info.avatar,
                    average_score: info.total / info.count,
                    total_inspections: info.count,
                    rank: 0
                }))
                .sort((a, b) => b.average_score - a.average_score) // Maior média primeiro
                .map((item, index) => ({ ...item, rank: index + 1 }));

            setRanking(sortedRanking);

        } catch (error) {
            console.error('Erro ao carregar ranking:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg">
                        <Trophy size={20} />
                    </div>
                    <h3 className="font-bold text-slate-800">Ranking de Motoristas</h3>
                </div>

                <div className="flex bg-slate-100 rounded-lg p-1">
                    <button
                        onClick={() => setPeriod('week')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${period === 'week' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Semana
                    </button>
                    <button
                        onClick={() => setPeriod('month')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${period === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Mês
                    </button>
                    <button
                        onClick={() => setPeriod('all')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${period === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Geral
                    </button>
                </div>
            </div>

            <div className="p-0">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">
                        <div className="animate-spin w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full mx-auto mb-2"></div>
                        Carregando...
                    </div>
                ) : ranking.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                        <Star size={32} className="mb-2 opacity-20" />
                        <p className="text-sm">Nenhuma pontuação registrada neste período.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {ranking.slice(0, 5).map((item) => (
                            <div key={item.driver_id} className="p-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                                {/* Rank Batch */}
                                <div className={`w-8 h-8 flex items-center justify-center font-black rounded-full shadow-sm text-sm border-2 ${item.rank === 1 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                    item.rank === 2 ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                        item.rank === 3 ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                            'bg-white text-slate-400 border-slate-100'
                                    }`}>
                                    {item.rank <= 3 ? <Medal size={16} /> : item.rank}
                                </div>

                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                    {item.avatar_url ? (
                                        <img src={item.avatar_url} alt={item.driver_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={18} className="text-slate-400" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-slate-800 leading-tight">{item.driver_name}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">
                                            {item.total_inspections} Checklists
                                        </span>
                                    </div>
                                </div>

                                {/* Score */}
                                <div className="text-right">
                                    <div className="text-xl font-black text-slate-800 leading-none">
                                        {item.average_score.toFixed(1)}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Média</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
                <button className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center justify-center gap-1 transition-colors">
                    Ver Ranking Completo <TrendingUp size={14} />
                </button>
            </div>
        </div>
    );
};

export default DriverRanking;
