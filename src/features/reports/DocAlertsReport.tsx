import React, { useState } from 'react';
import { FileWarning, Download, RefreshCw, AlertCircle, AlertTriangle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface DocRow {
  doc_id: string;
  entity_name: string;
  entity_type: string;
  document_type: string;
  expiry_date: string;
  days_remaining: number;
  doc_status: string;
}

const DocAlertsReport: React.FC = () => {
  const [daysAhead, setDaysAhead] = useState(90);
  const [data, setData] = useState<DocRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setHasGenerated(true);

    try {
      const { data: result, error: rpcError } = await supabase.rpc('get_doc_alerts', {
        p_days_ahead: daysAhead,
      });
      if (rpcError) throw rpcError;
      setData((result as DocRow[]) || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar relatório');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Alertas');

    ws.columns = [
      { header: '#', key: 'id', width: 5 },
      { header: 'Tipo', key: 'type', width: 10 },
      { header: 'Nome/Placa', key: 'name', width: 20 },
      { header: 'Documento', key: 'doc', width: 15 },
      { header: 'Vencimento', key: 'expiry', width: 12 },
      { header: 'Dias Restantes', key: 'days', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    data.forEach((r, i) => {
      ws.addRow({
        id: i + 1,
        type: r.entity_type,
        name: r.entity_name,
        doc: r.document_type,
        expiry: formatDate(r.expiry_date),
        days: r.days_remaining,
        status: r.doc_status,
      });
    });

    ws.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `alertas_documentos_${daysAhead}dias.xlsx`);
  };

  const formatDate = (d: string) => {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const getUrgencyStyle = (days: number) => {
    if (days < 0) return 'bg-red-100 text-red-800 border-red-200';
    if (days <= 30) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (days <= 60) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-yellow-50 text-yellow-800 border-yellow-200';
  };

  const getUrgencyLabel = (days: number) => {
    if (days < 0) return `Vencido há ${Math.abs(days)}d`;
    if (days === 0) return 'Vence hoje!';
    return `${days} dias`;
  };

  const getEntityBadge = (type: string) => {
    if (type === 'Veículo') return 'bg-blue-50 text-blue-700 border-blue-100';
    if (type === 'Motorista') return 'bg-purple-50 text-purple-700 border-purple-100';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const expired = data.filter(d => d.days_remaining < 0).length;
  const expiring30 = data.filter(d => d.days_remaining >= 0 && d.days_remaining <= 30).length;
  const expiring60 = data.filter(d => d.days_remaining > 30 && d.days_remaining <= 60).length;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-red-100 text-red-700 rounded-xl">
            <FileWarning size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Alertas de Documentação</h1>
            <p className="text-sm text-slate-500 mt-0.5">Documentos vencidos ou próximos do vencimento de veículos, motoristas e carretas.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="mb-5">
          <label className="block text-sm font-semibold text-slate-600 mb-2">
            <Clock size={14} className="inline mr-1" />
            Horizonte de Alerta
          </label>
          <div className="flex gap-2">
            {[30, 60, 90, 180].map(d => (
              <button key={d} onClick={() => setDaysAhead(d)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${daysAhead === d
                  ? 'bg-blue-900 text-white border-blue-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'}`}>
                {d} dias
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleGenerate} disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full py-3 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white rounded-xl font-bold transition-all active:scale-[0.98]">
          {isLoading ? <><RefreshCw size={16} className="animate-spin" />Gerando...</> : <><FileWarning size={16} />Verificar Documentos</>}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={16} />{error}
        </div>
      )}

      {hasGenerated && !isLoading && !error && (
        <>
          {/* Summary cards */}
          {data.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-red-700">{expired}</div>
                <div className="text-xs font-bold text-red-600 uppercase">Vencidos</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-orange-700">{expiring30}</div>
                <div className="text-xs font-bold text-orange-600 uppercase">Vence em 30d</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-amber-700">{expiring60}</div>
                <div className="text-xs font-bold text-amber-600 uppercase">Vence em 31-60d</div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Resultado</h3>
                <p className="text-xs text-slate-500 mt-0.5">{data.length === 0 ? 'Nenhum alerta.' : `${data.length} documento(s)`}</p>
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
                <AlertTriangle size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-semibold">Nenhum documento com alerta neste horizonte</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left text-xs font-bold text-slate-500 uppercase px-5 py-3 w-12">#</th>
                    <th className="text-left text-xs font-bold text-slate-500 uppercase px-5 py-3">Tipo</th>
                    <th className="text-left text-xs font-bold text-slate-500 uppercase px-5 py-3">Nome / Placa</th>
                    <th className="text-left text-xs font-bold text-slate-500 uppercase px-5 py-3">Documento</th>
                    <th className="text-left text-xs font-bold text-slate-500 uppercase px-5 py-3">Vencimento</th>
                    <th className="text-center text-xs font-bold text-slate-500 uppercase px-5 py-3">Prazo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.map((row, i) => (
                    <tr key={row.doc_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-slate-400 font-bold">{i + 1}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold border ${getEntityBadge(row.entity_type)}`}>
                          {row.entity_type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">{row.entity_name}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{row.document_type}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{formatDate(row.expiry_date)}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-black border ${getUrgencyStyle(row.days_remaining)}`}>
                          {getUrgencyLabel(row.days_remaining)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DocAlertsReport;
