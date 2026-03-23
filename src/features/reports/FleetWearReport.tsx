import React, { useState } from 'react';
import { Truck, Calendar, Download, RefreshCw, AlertCircle, BarChart3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import * as XLSX from 'xlsx';

interface FleetRow {
  vehicle_id: string;
  vehicle_plate: string;
  vehicle_model: string | null;
  total_inspections: number;
  avg_score: number | null;
  rejected_count: number;
}

const FleetWearReport: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState<FleetRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      setValidationError('Defina o período completo (data início e fim).');
      return;
    }
    setValidationError(null);
    setIsLoading(true);
    setError(null);
    setHasGenerated(true);

    try {
      const { data: result, error: rpcError } = await supabase.rpc('get_fleet_wear', {
        p_start_date: startDate,
        p_end_date: endDate,
      });
      if (rpcError) throw rpcError;
      setData((result as FleetRow[]) || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar relatório');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data.map((r, i) => ({
      '#': i + 1,
      'Placa': r.vehicle_plate,
      'Modelo': r.vehicle_model || '-',
      'Total Inspeções': r.total_inspections,
      'Score Médio': r.avg_score ?? '-',
      'Rejeitados': r.rejected_count,
    })));
    ws['!cols'] = [{ wch: 5 }, { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Frota');
    XLSX.writeFile(wb, `desgaste_frota_${startDate}_${endDate}.xlsx`);
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-slate-400';
    if (score >= 80) return 'text-emerald-600 bg-emerald-50';
    if (score >= 60) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-orange-100 text-orange-700 rounded-xl">
            <Truck size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Desgaste de Frota</h1>
            <p className="text-sm text-slate-500 mt-0.5">Veículos ranqueados por score médio das inspeções (menor → maior). Identifique os que precisam de atenção.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2"><Calendar size={14} className="inline mr-1" />Data Início</label>
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setValidationError(null); }}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2"><Calendar size={14} className="inline mr-1" />Data Fim</label>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setValidationError(null); }}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" />
          </div>
        </div>

        {validationError && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle size={16} />{validationError}
          </div>
        )}

        <button onClick={handleGenerate} disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full py-3 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white rounded-xl font-bold transition-all active:scale-[0.98]">
          {isLoading ? <><RefreshCw size={16} className="animate-spin" />Gerando...</> : <><BarChart3 size={16} />Gerar Relatório</>}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={16} />{error}
        </div>
      )}

      {hasGenerated && !isLoading && !error && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Resultado</h3>
              <p className="text-xs text-slate-500 mt-0.5">{data.length === 0 ? 'Nenhum dado encontrado.' : `${data.length} veículo(s)`}</p>
            </div>
            {data.length > 0 && (
              <button onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-colors active:scale-95">
                <Download size={14} />Exportar Excel
              </button>
            )}
          </div>

          {data.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <Truck size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-semibold">Sem resultados para este período</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-bold text-slate-500 uppercase px-5 py-3 w-12">#</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase px-5 py-3">Placa</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase px-5 py-3">Modelo</th>
                  <th className="text-center text-xs font-bold text-slate-500 uppercase px-5 py-3">Inspeções</th>
                  <th className="text-center text-xs font-bold text-slate-500 uppercase px-5 py-3">Score Médio</th>
                  <th className="text-center text-xs font-bold text-slate-500 uppercase px-5 py-3">Rejeitados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((row, i) => (
                  <tr key={row.vehicle_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-slate-400 font-bold">{i + 1}</td>
                    <td className="px-5 py-3.5 text-sm font-black text-slate-800 tracking-wider">{row.vehicle_plate}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{row.vehicle_model || '—'}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 bg-blue-50 text-blue-900 rounded-lg text-sm font-black">{row.total_inspections}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-black ${getScoreColor(row.avg_score)}`}>
                        {row.avg_score !== null ? row.avg_score : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {row.rejected_count > 0 ? (
                        <span className="inline-flex items-center justify-center px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm font-black">{row.rejected_count}</span>
                      ) : (
                        <span className="text-sm text-slate-300 font-bold">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default FleetWearReport;
