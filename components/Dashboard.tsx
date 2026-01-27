import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import DriverRanking from '../src/features/analytics/DriverRanking';
import { supabase } from '../src/lib/supabase';

const Dashboard: React.FC = () => {
  const [stats, setStats] = React.useState({
    total: 0,
    approvalRate: 0,
    criticals: 0
  });

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Data de 30 dias atrás para garantir visualização (Temporário para debug)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const { data, error } = await supabase
      .from('checklist_inspections')
      .select('id, score, status, template:checklist_templates(min_score_to_pass)')
      .gte('started_at', startDate.toISOString());

    if (data) {
      const total = data.length;
      let approvedCount = 0;
      let criticalCount = 0;

      data.forEach((insp: any) => {
        const minScore = insp.template?.min_score_to_pass || 70;
        const score = insp.score || 0;

        // Se tiver score, valida aprovação
        if (insp.score !== null) {
          if (score >= minScore) approvedCount++;
          else criticalCount++; // Abaixo da meta = crítico/reprovado
        }

        // Também contar status 'rejected' como crítico
        if (insp.status === 'rejected') criticalCount++;
      });

      const rate = total > 0 ? Math.round((approvedCount / total) * 100) : 0;

      setStats({
        total,
        approvalRate: rate,
        criticals: criticalCount
      });
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-lg shadow-blue-900/20">
          <LayoutDashboard size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Operacional</h1>
          <p className="text-slate-500">Visão geral da frota e conformidade de inspeções.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Stats / Overview Area (Future) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Placeholder for future Charts */}
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl">
            <h2 className="text-xl font-bold mb-2">Resumo da Semana</h2>
            <p className="text-blue-200 text-sm mb-6">Acompanhamento geral das inspeções realizadas.</p>

            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-2xl font-black">{stats.total}</p>
                <p className="text-xs uppercase tracking-wider opacity-70">Total Inspeções</p>
              </div>
              <div className="bg-green-500/20 rounded-2xl p-4 backdrop-blur-sm border border-green-500/30">
                <p className="text-2xl font-black text-green-300">{stats.approvalRate}%</p>
                <p className="text-xs uppercase tracking-wider opacity-70 text-green-100">Aprovação</p>
              </div>
              <div className="bg-red-500/20 rounded-2xl p-4 backdrop-blur-sm border border-red-500/30">
                <p className="text-2xl font-black text-red-300">{stats.criticals}</p>
                <p className="text-xs uppercase tracking-wider opacity-70 text-red-100">Não Conformidades</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Ranking */}
        <div className="lg:col-span-1">
          <DriverRanking />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
