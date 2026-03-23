import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Search, Download, RefreshCw, AlertCircle, X, CheckSquare, ChevronDown, List } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useRoutineCompliance, RoutineDetailRow } from './useRoutineCompliance';
import { exportComplianceToExcel } from './reportExport';

interface TemplateOption {
  id: string;
  name: string;
}

const RoutineComplianceReport: React.FC = () => {
  // Filter state
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');

  // Report state
  const { data, isLoading, error, run, fetchDetails } = useRoutineCompliance();
  const [hasGenerated, setHasGenerated] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Modal state
  const [selectedDriver, setSelectedDriver] = useState<{ id: string; name: string } | null>(null);
  const [driverDetails, setDriverDetails] = useState<RoutineDetailRow[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data: tpls } = await supabase
      .from('checklist_templates')
      .select('id, name')
      .eq('status', 'published')
      .order('name');

    if (tpls) setTemplates(tpls);
  };

  const toggleTemplate = (id: string) => {
    setSelectedTemplateIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
    setValidationError(null);
  };

  const removeTemplate = (id: string) => {
    setSelectedTemplateIds(prev => prev.filter(t => t !== id));
  };

  const handleGenerate = () => {
    if (selectedTemplateIds.length < 2) {
      setValidationError('Selecione pelo menos 2 checklists para compor a rotina.');
      return;
    }
    if (!startDate || !endDate) {
      setValidationError('Defina o período completo (data início e fim).');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setValidationError('A data de início não pode ser posterior à data final.');
      return;
    }

    setValidationError(null);
    setHasGenerated(true);
    run({ templateIds: selectedTemplateIds, startDate, endDate });
  };

  const handleExport = () => {
    if (data.length === 0) return;
    const periodLabel = `${startDate.replace(/-/g, '')}_${endDate.replace(/-/g, '')}`;
    exportComplianceToExcel(data, `conformidade_rotina_${periodLabel}`);
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(templateSearch.toLowerCase())
  );

  const selectedTemplateNames = templates.filter(t => selectedTemplateIds.includes(t.id));

  const handleRowClick = async (driverId: string, driverName: string) => {
    setSelectedDriver({ id: driverId, name: driverName });
    setIsLoadingDetails(true);
    setDriverDetails([]);
    try {
      const details = await fetchDetails({
        driverId,
        templateIds: selectedTemplateIds,
        startDate,
        endDate
      });
      setDriverDetails(details);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-blue-100 text-blue-900 rounded-xl">
            <BarChart3 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Conformidade por Rotina</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Verifique quantas vezes cada motorista completou todos os checklists selecionados no período.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Search size={14} />
          Filtros do Relatório
        </h2>

        {/* Template Multi-select */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-slate-600 mb-2">
            Checklists da Rotina
          </label>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-blue-300 transition-colors"
            >
              <span className="text-slate-400">
                {selectedTemplateIds.length === 0
                  ? 'Selecione os checklists...'
                  : `${selectedTemplateIds.length} checklist(s) selecionado(s)`}
              </span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 border-b border-slate-100">
                  <input
                    type="text"
                    placeholder="Buscar checklist..."
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                  />
                </div>
                {filteredTemplates.length === 0 ? (
                  <div className="p-4 text-sm text-slate-400 text-center">Nenhum checklist encontrado</div>
                ) : (
                  filteredTemplates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => toggleTemplate(t.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                        selectedTemplateIds.includes(t.id)
                          ? 'bg-blue-50 text-blue-900 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CheckSquare
                        size={16}
                        className={selectedTemplateIds.includes(t.id) ? 'text-blue-600' : 'text-slate-300'}
                      />
                      {t.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected tags */}
          {selectedTemplateNames.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedTemplateNames.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg text-xs font-bold border border-blue-100"
                >
                  {t.name}
                  <button onClick={() => removeTemplate(t.id)} className="hover:text-red-600 transition-colors">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">
              <Calendar size={14} className="inline mr-1" />
              Data Início
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setValidationError(null); }}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">
              <Calendar size={14} className="inline mr-1" />
              Data Fim
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setValidationError(null); }}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>
        </div>

        {/* Validation error */}
        {validationError && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle size={16} />
            {validationError}
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full py-3 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white rounded-xl font-bold transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <BarChart3 size={16} />
              Gerar Relatório
            </>
          )}
        </button>
      </div>

      {/* RPC Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Results */}
      {hasGenerated && !isLoading && !error && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Results header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Resultado</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {data.length === 0
                  ? 'Nenhum motorista completou todos os checklists no período.'
                  : `${data.length} motorista(s) encontrado(s)`}
              </p>
            </div>
            {data.length > 0 && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-colors active:scale-95"
              >
                <Download size={14} />
                Exportar Excel
              </button>
            )}
          </div>

          {data.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <BarChart3 size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-semibold">Sem resultados para este período</p>
              <p className="text-xs mt-1">Tente ampliar as datas ou verificar se os checklists possuem registros.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3 w-16">#</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Motorista</th>
                  <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3 w-40">Ocorrências</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((row, index) => (
                  <tr 
                    key={row.driver_id} 
                    onClick={() => handleRowClick(row.driver_id, row.driver_name)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3.5 text-sm text-slate-400 font-bold">{index + 1}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">{row.driver_name}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex items-center justify-center px-3 py-1 bg-blue-50 text-blue-900 rounded-lg text-sm font-black min-w-[40px]">
                        {row.occurrences}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modais de Detalhes */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-900 rounded-lg">
                  <List size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight">Detalhes Consolidados</h3>
                  <p className="text-sm text-slate-500">{selectedDriver.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDriver(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto bg-slate-50 flex-1">
              {isLoadingDetails ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <RefreshCw size={24} className="animate-spin mb-3 text-blue-600" />
                  <p className="text-sm">Buscando detalhes...</p>
                </div>
              ) : driverDetails.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">Nenhum detalhe encontrado.</div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-left text-slate-500 font-bold uppercase tracking-wider text-xs">
                        <th className="px-5 py-3">Data da Rotina</th>
                        <th className="px-5 py-3">Checklist(s)</th>
                        <th className="px-5 py-3">Veículo(s)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {driverDetails.map((detail, idx) => {
                        const [, month, day] = detail.inspection_date.split('-');
                        const formattedDate = `${day}/${month}/2026`; // Simplification assuming 2026 as per data
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-5 py-3.5 font-semibold text-slate-700 align-top whitespace-nowrap">{formattedDate}</td>
                            <td className="px-5 py-3.5 text-slate-600 align-top">
                              <div className="flex flex-col gap-1">
                                {detail.checklist_names.split(';;;').map((name, i) => (
                                  <span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded-md border border-slate-200 inline-block w-fit">
                                    {name}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-600 align-top">
                              {detail.vehicle_plates ? (
                                <span className="inline-flex px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-mono font-bold text-slate-700">
                                  {detail.vehicle_plates}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic text-xs">N/A</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineComplianceReport;
