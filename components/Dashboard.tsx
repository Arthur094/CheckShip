import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard, Users, Truck, ClipboardCheck, TrendingUp,
  CheckCircle2, XCircle, Trophy, Medal, Star, AlertTriangle,
  Loader2, Activity, BarChart3, Target, Gauge
} from 'lucide-react';
import { supabase } from '../src/lib/supabase';

interface DashboardData {
  // KPIs
  totalInspections: number;
  completedInspections: number;
  rejectedInspections: number;
  uniqueInspectors: number;
  uniqueVehicles: number;
  avgDaily: number;
  // Users
  totalUsers: number;
  activeUsers: number;
  motoristas: number;
  gestores: number;
  analistas: number;
  outros: number;
  // Fleet
  totalVehicles: number;
  activeVehicles: number;
  inactiveVehicles: number;
  totalTrailers: number;
  activeTrailers: number;
  inactiveTrailers: number;
  // Conformity
  conformItems: number;
  nonConformItems: number;
  conformityRate: number;
  conformityBreakdown: { answer: string; count: number; type: 'conforme' | 'nao_conforme' | 'info' }[];
  // Weekly
  weeklyData: { weekStart: string; inspections: number; inspectors: number; vehicles: number }[];
  // Daily
  dailyData: { day: string; inspections: number }[];
  // Rankings
  topInspectors: { name: string; inspections: number; completed: number }[];
  topVehicles: { plate: string; model: string; inspections: number }[];
  // Top Templates
  topTemplates: { name: string; uses: number; percent: number }[];
}

const INITIAL_DATA: DashboardData = {
  totalInspections: 0, completedInspections: 0, rejectedInspections: 0,
  uniqueInspectors: 0, uniqueVehicles: 0, avgDaily: 0,
  totalUsers: 0, activeUsers: 0, motoristas: 0, gestores: 0, analistas: 0, outros: 0,
  totalVehicles: 0, activeVehicles: 0, inactiveVehicles: 0,
  totalTrailers: 0, activeTrailers: 0, inactiveTrailers: 0,
  conformItems: 0, nonConformItems: 0, conformityRate: 0, conformityBreakdown: [],
  weeklyData: [], dailyData: [],
  topInspectors: [], topVehicles: [], topTemplates: [],
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const since = thirtyDaysAgo.toISOString();

      const [
        profilesRes,
        vehiclesRes,
        trailersRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id, role, active'),
        supabase.from('vehicles').select('id, active'),
        supabase.from('trailers').select('id, active'),
      ]);

      // --- Fetch ALL inspections (paginating past the 1000-row Supabase limit) ---
      const BATCH_SIZE = 1000;
      let allInspections: any[] = [];
      let from = 0;
      let hasMore = true;

      while (hasMore) {
        const { data: batch, error: batchErr } = await supabase
          .from('checklist_inspections')
          .select('id, status, started_at, inspector_id, vehicle_id, responses, template_id, checklist_template_id')
          .gte('started_at', since)
          .order('started_at', { ascending: true })
          .range(from, from + BATCH_SIZE - 1);

        if (batchErr) throw batchErr;

        const rows = batch || [];
        allInspections = allInspections.concat(rows);

        if (rows.length < BATCH_SIZE) {
          hasMore = false;
        } else {
          from += BATCH_SIZE;
        }
      }

      // --- Profiles ---
      const profiles = profilesRes.data || [];
      const motoristas = profiles.filter(p => p.role === 'MOTORISTA').length;
      const gestores = profiles.filter(p => p.role === 'GESTOR').length;
      const analistas = profiles.filter(p => p.role === 'ANALISTA').length;

      // --- Vehicles ---
      const vehicles = vehiclesRes.data || [];
      const activeVehicles = vehicles.filter(v => v.active).length;

      // --- Trailers ---
      const trailers = trailersRes.data || [];
      const activeTrailers = trailers.filter(t => t.active).length;

      // --- Inspections (all fetched via pagination) ---
      const inspections = allInspections;
      const total = inspections.length;
      const completed = inspections.filter(i => i.status === 'completed').length;
      const rejected = inspections.filter(i => i.status === 'rejected').length;
      const uniqueInspectors = new Set(inspections.map(i => i.inspector_id).filter(Boolean)).size;
      const uniqueVehicles = new Set(inspections.map(i => i.vehicle_id).filter(Boolean)).size;

      // Days count for average
      const daysWithData = new Set(inspections.map(i => i.started_at?.substring(0, 10))).size;
      const avgDaily = daysWithData > 0 ? Math.round(total / daysWithData) : 0;

      // --- Conformity from responses JSONB ---
      let conformCount = 0;
      let nonConformCount = 0;
      const answerCounts: Record<string, number> = {};

      inspections.forEach(insp => {
        if (insp.responses && typeof insp.responses === 'object' && !Array.isArray(insp.responses)) {
          Object.values(insp.responses as Record<string, any>).forEach((resp: any) => {
            const answer = resp?.answer;
            if (!answer || answer === '[]') return;
            const key = String(answer).trim();
            answerCounts[key] = (answerCounts[key] || 0) + 1;
          });
        }
      });

      const CONFORME_ANSWERS = ['Bom', 'Sim', 'Conforme', 'Negativo'];
      const NON_CONFORME_ANSWERS = ['Não'];

      Object.entries(answerCounts).forEach(([answer, count]) => {
        if (CONFORME_ANSWERS.includes(answer)) conformCount += count;
        else if (NON_CONFORME_ANSWERS.includes(answer)) nonConformCount += count;
      });

      const totalEvaluable = conformCount + nonConformCount;
      const conformityRate = totalEvaluable > 0 ? parseFloat(((conformCount / totalEvaluable) * 100).toFixed(1)) : 0;

      const conformityBreakdown = [
        ...CONFORME_ANSWERS.filter(a => answerCounts[a]).map(a => ({ answer: a, count: answerCounts[a], type: 'conforme' as const })),
        ...NON_CONFORME_ANSWERS.filter(a => answerCounts[a]).map(a => ({ answer: a, count: answerCounts[a], type: 'nao_conforme' as const })),
      ];

      // --- Daily data ---
      const dailyMap: Record<string, number> = {};
      inspections.forEach(insp => {
        const day = insp.started_at?.substring(0, 10);
        if (day) dailyMap[day] = (dailyMap[day] || 0) + 1;
      });
      const dailyData = Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, inspections]) => ({ day, inspections }));

      // --- Weekly data ---
      const weeklyMap: Record<string, { inspections: number; inspectors: Set<string>; vehicles: Set<string> }> = {};
      inspections.forEach(insp => {
        const d = new Date(insp.started_at);
        const dayOfWeek = d.getUTCDay();
        const monday = new Date(d);
        monday.setUTCDate(d.getUTCDate() - ((dayOfWeek + 6) % 7));
        const weekKey = monday.toISOString().substring(0, 10);
        if (!weeklyMap[weekKey]) weeklyMap[weekKey] = { inspections: 0, inspectors: new Set(), vehicles: new Set() };
        weeklyMap[weekKey].inspections++;
        if (insp.inspector_id) weeklyMap[weekKey].inspectors.add(insp.inspector_id);
        if (insp.vehicle_id) weeklyMap[weekKey].vehicles.add(insp.vehicle_id);
      });
      const weeklyData = Object.entries(weeklyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([weekStart, v]) => ({
          weekStart,
          inspections: v.inspections,
          inspectors: v.inspectors.size,
          vehicles: v.vehicles.size,
        }));

      // --- Top Inspectors ---
      const inspectorMap: Record<string, { count: number; completed: number }> = {};
      inspections.forEach(insp => {
        if (!insp.inspector_id) return;
        if (!inspectorMap[insp.inspector_id]) inspectorMap[insp.inspector_id] = { count: 0, completed: 0 };
        inspectorMap[insp.inspector_id].count++;
        if (insp.status === 'completed') inspectorMap[insp.inspector_id].completed++;
      });

      const topInspectorIds = Object.entries(inspectorMap)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 10)
        .map(([id]) => id);

      // Fetch names
      const { data: inspectorProfiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', topInspectorIds);

      const nameMap: Record<string, string> = {};
      (inspectorProfiles || []).forEach(p => { nameMap[p.id] = p.full_name; });

      const topInspectors = topInspectorIds.map(id => ({
        name: nameMap[id] || 'Desconhecido',
        inspections: inspectorMap[id].count,
        completed: inspectorMap[id].completed,
      }));

      // --- Top Vehicles ---
      const vehicleMap: Record<string, number> = {};
      inspections.forEach(insp => {
        if (!insp.vehicle_id) return;
        vehicleMap[insp.vehicle_id] = (vehicleMap[insp.vehicle_id] || 0) + 1;
      });

      const topVehicleIds = Object.entries(vehicleMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([id]) => id);

      const { data: vehicleDetails } = await supabase
        .from('vehicles')
        .select('id, plate, model')
        .in('id', topVehicleIds);

      const vehicleDetailMap: Record<string, { plate: string; model: string }> = {};
      (vehicleDetails || []).forEach(v => { vehicleDetailMap[v.id] = { plate: v.plate, model: v.model || '' }; });

      const topVehicles = topVehicleIds.map(id => ({
        plate: vehicleDetailMap[id]?.plate || '???',
        model: vehicleDetailMap[id]?.model || '',
        inspections: vehicleMap[id],
      }));

      // --- Top Templates ---
      const templateMap: Record<string, number> = {};
      inspections.forEach(insp => {
        const tid = insp.template_id || insp.checklist_template_id;
        if (tid) templateMap[tid] = (templateMap[tid] || 0) + 1;
      });

      const topTemplateIds = Object.entries(templateMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 7)
        .map(([id]) => id);

      const { data: templateDetails } = await supabase
        .from('checklist_templates')
        .select('id, name')
        .in('id', topTemplateIds);

      const templateNameMap: Record<string, string> = {};
      (templateDetails || []).forEach(t => { templateNameMap[t.id] = t.name; });

      const topTemplates = topTemplateIds.map(id => ({
        name: templateNameMap[id] || id,
        uses: templateMap[id],
        percent: total > 0 ? parseFloat(((templateMap[id] / total) * 100).toFixed(1)) : 0,
      }));

      // --- Growth ---
      setData({
        totalInspections: total,
        completedInspections: completed,
        rejectedInspections: rejected,
        uniqueInspectors,
        uniqueVehicles,
        avgDaily,
        totalUsers: profiles.length,
        activeUsers: profiles.filter(p => p.active).length,
        motoristas,
        gestores,
        analistas,
        outros: profiles.length - motoristas - gestores - analistas,
        totalVehicles: vehicles.length,
        activeVehicles,
        inactiveVehicles: vehicles.length - activeVehicles,
        totalTrailers: trailers.length,
        activeTrailers,
        inactiveTrailers: trailers.length - activeTrailers,
        conformItems: conformCount,
        nonConformItems: nonConformCount,
        conformityRate,
        conformityBreakdown,
        weeklyData,
        dailyData,
        topInspectors,
        topVehicles,
        topTemplates,
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Growth calc
  const weeklyGrowth = (() => {
    if (data.weeklyData.length < 2) return null;
    const first = data.weeklyData[0].inspections;
    const last = data.weeklyData[data.weeklyData.length - 1].inspections;
    if (first === 0) return null;
    return Math.round(((last - first) / first) * 100);
  })();

  const maxDaily = Math.max(...data.dailyData.map(d => d.inspections), 1);

  const formatDate = (iso: string) => {
    const [, m, d] = iso.split('-');
    return `${d}/${m}`;
  };

  const isWeekend = (iso: string) => {
    const d = new Date(iso + 'T12:00:00Z');
    return d.getUTCDay() === 0 || d.getUTCDay() === 6;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[80vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-900 animate-spin mx-auto" />
          <p className="text-slate-500 text-sm font-medium">Carregando dashboard operacional...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-lg shadow-blue-900/20">
          <LayoutDashboard size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Operacional</h1>
          <p className="text-slate-500 text-sm">Últimos 30 dias • Dados em tempo real</p>
        </div>
      </header>

      {/* ========== KPI CARDS ========== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard icon={<ClipboardCheck size={18} />} value={data.totalInspections.toLocaleString('pt-BR')} label="Inspeções" sub={`${((data.completedInspections / Math.max(data.totalInspections, 1)) * 100).toFixed(0)}% concluídas`} color="blue" />
        <KpiCard icon={<Users size={18} />} value={data.uniqueInspectors.toString()} label="Inspetores Ativos" sub={`de ${data.motoristas} motoristas`} color="dark" />
        <KpiCard icon={<Gauge size={18} />} value={`${data.conformityRate}%`} label="Conformidade" sub={`${data.conformItems.toLocaleString('pt-BR')} itens`} color="green" />
        <KpiCard icon={<Activity size={18} />} value={`~${data.avgDaily}`} label="Média Diária" sub="inspeções/dia" color="orange" />
        <KpiCard icon={<Truck size={18} />} value={data.uniqueVehicles.toString()} label="Veículos Inspecionados" sub={`de ${data.activeVehicles} ativos`} color="blue" />
        <KpiCard icon={<TrendingUp size={18} />} value={weeklyGrowth !== null ? `${weeklyGrowth > 0 ? '+' : ''}${weeklyGrowth}%` : 'N/A'} label="Crescimento Semanal" sub={`${data.weeklyData[0]?.inspections || 0} → ${data.weeklyData[data.weeklyData.length - 1]?.inspections || 0}`} color={weeklyGrowth !== null && weeklyGrowth > 0 ? 'green' : 'orange'} />
      </div>

      {/* ========== USERS & FLEET ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Users size={18} className="text-blue-900" />
            <h3 className="font-bold text-slate-800">Usuários</h3>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <th className="px-5 py-2.5 text-left">Perfil</th>
              <th className="px-5 py-2.5 text-right">Qtd</th>
              <th className="px-5 py-2.5 text-right">%</th>
            </tr></thead>
            <tbody>
              <TableRow label="Motoristas" value={data.motoristas} pct={data.totalUsers > 0 ? ((data.motoristas / data.totalUsers) * 100).toFixed(1) : '0'} />
              <TableRow label="Gestores" value={data.gestores} pct={data.totalUsers > 0 ? ((data.gestores / data.totalUsers) * 100).toFixed(1) : '0'} />
              <TableRow label="Outros" value={data.outros} pct={data.totalUsers > 0 ? ((data.outros / data.totalUsers) * 100).toFixed(1) : '0'} />
              <tr className="bg-blue-50 font-bold">
                <td className="px-5 py-2.5">Total</td>
                <td className="px-5 py-2.5 text-right">{data.totalUsers}</td>
                <td className="px-5 py-2.5 text-right"><span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">{data.activeUsers}/{data.totalUsers} ativos</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Fleet Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Truck size={18} className="text-blue-900" />
            <h3 className="font-bold text-slate-800">Frota</h3>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <th className="px-5 py-2.5 text-left">Ativo</th>
              <th className="px-5 py-2.5 text-right">Total</th>
              <th className="px-5 py-2.5 text-right">Ativos</th>
              <th className="px-5 py-2.5 text-right">Inativos</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-slate-50">
                <td className="px-5 py-2.5">Veículos</td>
                <td className="px-5 py-2.5 text-right">{data.totalVehicles}</td>
                <td className="px-5 py-2.5 text-right"><Badge type="success">{data.activeVehicles}</Badge></td>
                <td className="px-5 py-2.5 text-right">{data.inactiveVehicles > 0 ? <Badge type="warning">{data.inactiveVehicles}</Badge> : '0'}</td>
              </tr>
              <tr className="border-b border-slate-50">
                <td className="px-5 py-2.5">Carretas</td>
                <td className="px-5 py-2.5 text-right">{data.totalTrailers}</td>
                <td className="px-5 py-2.5 text-right"><Badge type="success">{data.activeTrailers}</Badge></td>
                <td className="px-5 py-2.5 text-right">{data.inactiveTrailers > 0 ? <Badge type="warning">{data.inactiveTrailers}</Badge> : '0'}</td>
              </tr>
              <tr className="bg-blue-50 font-bold">
                <td className="px-5 py-2.5">Total Frota</td>
                <td className="px-5 py-2.5 text-right">{data.totalVehicles + data.totalTrailers}</td>
                <td className="px-5 py-2.5 text-right">{data.activeVehicles + data.activeTrailers}</td>
                <td className="px-5 py-2.5 text-right">{data.inactiveVehicles + data.inactiveTrailers}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== CONFORMITY ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gauge */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-6 flex flex-col items-center justify-center shadow-sm">
          <div className="text-6xl font-black text-emerald-600 tracking-tighter">{data.conformityRate}%</div>
          <div className="text-sm font-bold text-emerald-800 mt-1">Taxa de Conformidade Geral</div>
          <div className="w-full h-3 bg-red-100 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${data.conformityRate}%` }} />
          </div>
          <div className="text-xs text-slate-500 mt-3 flex gap-4">
            <span>✅ {data.conformItems.toLocaleString('pt-BR')} conformes</span>
            <span>⚠️ {data.nonConformItems.toLocaleString('pt-BR')} não conformes</span>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Target size={18} className="text-blue-900" />
            <h3 className="font-bold text-slate-800">Detalhamento de Respostas</h3>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <th className="px-5 py-2.5 text-left">Resposta</th>
              <th className="px-5 py-2.5 text-right">Contagem</th>
              <th className="px-5 py-2.5 text-center">Status</th>
            </tr></thead>
            <tbody>
              {data.conformityBreakdown.map((item, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td className="px-5 py-2.5">{item.answer === 'Negativo' ? 'Negativo (Bafômetro)' : item.answer}</td>
                  <td className="px-5 py-2.5 text-right font-medium">{item.count.toLocaleString('pt-BR')}</td>
                  <td className="px-5 py-2.5 text-center">
                    <Badge type={item.type === 'conforme' ? 'success' : 'danger'}>
                      {item.type === 'conforme' ? 'Conforme' : 'Não Conforme'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== WEEKLY EVOLUTION ========== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-900" />
          <h3 className="font-bold text-slate-800">Evolução Semanal</h3>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {data.weeklyData.map((week, i) => {
            const prevWeek = i > 0 ? data.weeklyData[i - 1] : null;
            const growth = prevWeek && prevWeek.inspections > 0
              ? Math.round(((week.inspections - prevWeek.inspections) / prevWeek.inspections) * 100)
              : null;
            const isLast = i === data.weeklyData.length - 1;
            return (
              <div key={week.weekStart} className={`rounded-xl p-4 text-center border ${isLast ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Semana {i + 1}</div>
                <div className={`text-2xl font-black mt-1 ${isLast ? 'text-blue-700' : 'text-slate-800'}`}>{week.inspections}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{week.inspectors} inspetores • {week.vehicles} veículos</div>
                {growth !== null && (
                  <div className={`text-xs font-bold mt-1 ${growth >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {growth >= 0 ? '▲' : '▼'} {growth > 0 ? '+' : ''}{growth}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========== DAILY BAR CHART ========== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-900" />
          <h3 className="font-bold text-slate-800">Volume Diário de Inspeções</h3>
        </div>
        <div className="p-5 space-y-1">
          {data.dailyData.map(d => {
            const pct = (d.inspections / maxDaily) * 100;
            const isPeak = d.inspections === maxDaily;
            const weekend = isWeekend(d.day);
            return (
              <div key={d.day} className="flex items-center gap-2">
                <span className="w-12 text-right text-[10px] text-slate-400 font-medium shrink-0">{formatDate(d.day)}</span>
                <div className="flex-1 h-4 bg-slate-100 rounded overflow-hidden">
                  <div
                    className={`h-full rounded flex items-center justify-end pr-1.5 transition-all duration-700 ${isPeak ? 'bg-gradient-to-r from-blue-900 to-blue-700' :
                      weekend ? 'bg-gradient-to-r from-slate-300 to-slate-400' :
                        'bg-gradient-to-r from-blue-500 to-blue-400'
                      }`}
                    style={{ width: `${Math.max(pct, 3)}%` }}
                  >
                    <span className="text-[8px] font-bold text-white">{d.inspections}</span>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="flex gap-4 pt-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gradient-to-r from-blue-500 to-blue-400"></span> Dia útil</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gradient-to-r from-slate-300 to-slate-400"></span> Fim de semana</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gradient-to-r from-blue-900 to-blue-700"></span> Pico</span>
          </div>
        </div>
      </div>

      {/* ========== CHECKLISTS TABLE ========== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <ClipboardCheck size={18} className="text-blue-900" />
          <h3 className="font-bold text-slate-800">Checklists Mais Utilizados</h3>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
            <th className="px-5 py-2.5 text-left w-8">#</th>
            <th className="px-5 py-2.5 text-left">Template</th>
            <th className="px-5 py-2.5 text-right">Aplicações</th>
            <th className="px-5 py-2.5 text-right">% do Total</th>
          </tr></thead>
          <tbody>
            {data.topTemplates.map((tpl, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-blue-50/50 transition-colors">
                <td className="px-5 py-2.5 text-slate-400">{i + 1}</td>
                <td className="px-5 py-2.5 font-medium">{tpl.name}</td>
                <td className="px-5 py-2.5 text-right font-bold">{tpl.uses.toLocaleString('pt-BR')}</td>
                <td className="px-5 py-2.5 text-right text-slate-500">{tpl.percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ========== RANKINGS ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Inspectors */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" />
            <h3 className="font-bold text-slate-800">Top 10 Inspetores</h3>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <th className="px-5 py-2.5 text-left w-10">#</th>
              <th className="px-5 py-2.5 text-left">Inspetor</th>
              <th className="px-5 py-2.5 text-right">Insp.</th>
              <th className="px-5 py-2.5 text-center">Conclusão</th>
            </tr></thead>
            <tbody>
              {data.topInspectors.map((ins, i) => {
                const rate = ins.inspections > 0 ? Math.round((ins.completed / ins.inspections) * 100) : 0;
                return (
                  <tr key={i} className="border-b border-slate-50 hover:bg-blue-50/50 transition-colors">
                    <td className="px-5 py-2"><RankBadge rank={i + 1} /></td>
                    <td className="px-5 py-2 font-medium text-xs">{formatName(ins.name)}</td>
                    <td className="px-5 py-2 text-right font-bold">{ins.inspections}</td>
                    <td className="px-5 py-2 text-center"><Badge type="success">{rate}%</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Top Vehicles */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Truck size={18} className="text-blue-900" />
            <h3 className="font-bold text-slate-800">Top 10 Veículos</h3>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <th className="px-5 py-2.5 text-left w-10">#</th>
              <th className="px-5 py-2.5 text-left">Placa</th>
              <th className="px-5 py-2.5 text-right">Inspeções</th>
            </tr></thead>
            <tbody>
              {data.topVehicles.map((v, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-blue-50/50 transition-colors">
                  <td className="px-5 py-2"><RankBadge rank={i + 1} /></td>
                  <td className="px-5 py-2 font-bold tracking-wide">{v.plate}</td>
                  <td className="px-5 py-2 text-right font-bold">{v.inspections}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== INSIGHTS ========== */}
      <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={18} className="text-blue-900" />
          <h3 className="font-bold text-blue-900">Insights e Recomendações</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {weeklyGrowth !== null && weeklyGrowth > 0 && (
            <InsightItem icon="📈" text={`Adoção crescente: crescimento de ${weeklyGrowth}% no volume semanal de inspeções.`} />
          )}
          <InsightItem icon="✅" text={`Conformidade de ${data.conformityRate}% — ${data.conformityRate >= 95 ? 'excelente padrão de qualidade' : 'atenção necessária para itens não conformes'}.`} />
          {data.inactiveVehicles > 0 && (
            <InsightItem icon="🔧" text={`${data.inactiveVehicles} veículos inativos — verificar se estão em manutenção ou devem ser reativados.`} />
          )}
          {data.motoristas > data.uniqueInspectors && (
            <InsightItem icon="👤" text={`${data.motoristas - data.uniqueInspectors} motoristas sem inspeções nos últimos 30 dias — avaliar necessidade de treinamento.`} />
          )}
          {data.nonConformItems > 0 && (
            <InsightItem icon="⚠️" text={`${data.nonConformItems.toLocaleString('pt-BR')} itens não conformes registrados — rastrear para identificar padrões recorrentes.`} />
          )}
          {data.rejectedInspections > 0 && (
            <InsightItem icon="🚫" text={`${data.rejectedInspections} inspeções rejeitadas no período — investigar motivos.`} />
          )}
        </div>
      </div>
    </div>
  );
};

// ============ Sub-Components ============

const KpiCard: React.FC<{
  icon: React.ReactNode;
  value: string;
  label: string;
  sub: string;
  color: 'blue' | 'green' | 'orange' | 'dark';
}> = ({ icon, value, label, sub, color }) => {
  const borderColors = {
    blue: 'border-t-blue-500',
    green: 'border-t-emerald-500',
    orange: 'border-t-amber-500',
    dark: 'border-t-slate-800',
  };
  return (
    <div className={`bg-white rounded-xl border border-slate-200 border-t-[3px] ${borderColors[color]} p-4 text-center shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">{icon}</div>
      <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">{label}</div>
      <div className="text-[9px] text-slate-400 mt-0.5">{sub}</div>
    </div>
  );
};

const Badge: React.FC<{ type: 'success' | 'warning' | 'danger'; children: React.ReactNode }> = ({ type, children }) => {
  const styles = {
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${styles[type]}`}>{children}</span>;
};

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  const colors = {
    1: 'bg-amber-100 text-amber-700',
    2: 'bg-slate-200 text-slate-600',
    3: 'bg-orange-100 text-orange-700',
  } as Record<number, string>;
  const icons = { 1: '🥇', 2: '🥈', 3: '🥉' } as Record<number, string>;
  if (rank <= 3) {
    return <span className="text-sm">{icons[rank]}</span>;
  }
  return <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-400`}>{rank}</span>;
};

const TableRow: React.FC<{ label: string; value: number; pct: string }> = ({ label, value, pct }) => (
  <tr className="border-b border-slate-50 hover:bg-blue-50/50 transition-colors">
    <td className="px-5 py-2.5">{label}</td>
    <td className="px-5 py-2.5 text-right font-bold">{value}</td>
    <td className="px-5 py-2.5 text-right text-slate-500">{pct}%</td>
  </tr>
);

const InsightItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <div className="flex gap-2 text-sm text-slate-700 leading-relaxed">
    <span className="text-base shrink-0">{icon}</span>
    <span>{text}</span>
  </div>
);

const formatName = (name: string) => {
  return name.split(' ').map((w, i) => {
    if (i === 0 || i === name.split(' ').length - 1) return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    if (w.length <= 3) return w.toLowerCase();
    return w.charAt(0).toUpperCase() + '.';
  }).join(' ');
};

export default Dashboard;
