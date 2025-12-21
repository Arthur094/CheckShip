
import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ClipboardList, 
  TrendingUp, 
  Truck, 
  Clock 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell
} from 'recharts';

const data = [
  { name: 'Seg', checklists: 45, conformidade: 92 },
  { name: 'Ter', checklists: 52, conformidade: 88 },
  { name: 'Qua', checklists: 38, conformidade: 95 },
  { name: 'Qui', checklists: 65, conformidade: 84 },
  { name: 'Sex', checklists: 48, conformidade: 91 },
  { name: 'Sab', checklists: 22, conformidade: 98 },
  { name: 'Dom', checklists: 12, conformidade: 100 },
];

const maintenanceStatus = [
  { name: 'Operando', value: 85, color: '#10b981' },
  { name: 'Em Reparo', value: 10, color: '#f59e0b' },
  { name: 'Crítico', value: 5, color: '#ef4444' },
];

const Dashboard: React.FC = () => {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Operacional</h1>
        <p className="text-slate-500">Visão geral da frota e conformidade de inspeções.</p>
      </header>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-colors cursor-default">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Conformidade da Frota</p>
            <h3 className="text-3xl font-bold text-blue-900">92.4%</h3>
            <div className="mt-2 flex items-center gap-1 text-green-600 text-xs font-bold">
              <TrendingUp size={14} />
              <span>+2.1% vs mês anterior</span>
            </div>
          </div>
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <CheckCircle2 size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-amber-200 transition-colors cursor-default">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Documentos Vencendo</p>
            <h3 className="text-3xl font-bold text-slate-800">14</h3>
            <p className="mt-2 text-slate-400 text-xs font-medium uppercase tracking-wider">Alertas críticos</p>
          </div>
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
            <AlertTriangle size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-colors cursor-default">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Checklists Hoje</p>
            <h3 className="text-3xl font-bold text-slate-800">128</h3>
            <p className="mt-2 text-slate-400 text-xs font-medium uppercase tracking-wider">Último: há 5 min</p>
          </div>
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-900 group-hover:text-white transition-all">
            <ClipboardList size={32} />
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-bold text-slate-800">Produtividade Semanal</h4>
            <select className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="checklists" fill="#1e3a8a" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="font-bold text-slate-800 mb-6">Prontidão da Frota</h4>
          <div className="space-y-6">
            {maintenanceStatus.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-bold text-slate-800">{item.value}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${item.value}%`, backgroundColor: item.color }} 
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-blue-600"><Clock size={16} /></div>
              <div>
                <p className="text-xs font-bold text-slate-800">Manutenção Preventiva</p>
                <p className="text-[10px] text-slate-500">12 veículos agendados para revisão nas próximas 48h.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h4 className="font-bold text-slate-800">Alertas Recentes e Status</h4>
          <button className="text-xs font-bold text-blue-900 hover:underline">Ver tudo</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="px-6 py-4">Veículo</th>
                <th className="px-6 py-4">Motorista</th>
                <th className="px-6 py-4">Alerta / Evento</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Data/Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { plate: 'ABC-1234', driver: 'Ricardo Silva', event: 'CRLV Vencido', status: 'CRITICO', time: 'Há 10 min' },
                { plate: 'GHI-9012', driver: 'Carlos Ferreira', event: 'Checklist Reprovado (Freios)', status: 'MANUTENÇÃO', time: 'Há 45 min' },
                { plate: 'DEF-5678', driver: 'Ana Paula', event: 'Troca de óleo necessária', status: 'ALERTA', time: 'Há 2 horas' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                  <td className="px-6 py-4 font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Truck size={14} className="text-slate-400" />
                    {row.plate}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{row.driver}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{row.event}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      row.status === 'CRITICO' ? 'bg-red-100 text-red-700' :
                      row.status === 'MANUTENÇÃO' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
