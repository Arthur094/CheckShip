
import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Trash2, CheckCircle2, Eye, AlertTriangle, FileText, MoreVertical } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { useNavigate } from 'react-router-dom';
import ExportModal from './ExportModal';

interface HistoryItem {
  id: string;
  status: string;
  started_at: string;
  completed_at: string;
  user: { full_name: string } | null;
  vehicle: {
    plate: string;
    model: string;
    type?: string;
    vehicle_types?: { name: string }
  } | null;
  template: { name: string } | null;
  critical_count?: number;
}

const ChecklistHistory: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    plate: '',
    driver: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  // Action States
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('checklist_inspections')
        .select(`
          id,
          status,
          started_at,
          completed_at,
          answers,
          vehicle:vehicles!vehicle_id (
            plate,
            model,
            vehicle_types!vehicle_type_id (name)
          ),
          template:checklist_templates!checklist_template_id (name),
          user:profiles!inspector_id (full_name)
        `)
        .order('started_at', { ascending: false });

      if (error) throw error;

      // Post-process for issues count and filters
      const processed = (data || []).map((item: any) => {
        let issues = 0;
        if (item.answers) {
          Object.values(item.answers).forEach((ans: any) => {
            if (ans?.answer === 'nao_conforme' || ans?.answer === 'reprovado') issues++;
          });
        }

        return {
          id: item.id,
          status: item.status,
          started_at: item.started_at,
          completed_at: item.completed_at,
          user: item.user,
          vehicle: item.vehicle,
          template: item.template,
          critical_count: issues
        };
      }).filter(item => {
        if (filters.plate && !item.vehicle?.plate.toLowerCase().includes(filters.plate.toLowerCase())) return false;
        if (filters.driver && !item.user?.full_name.toLowerCase().includes(filters.driver.toLowerCase())) return false;
        // Status filter handled here for simplicity if select didn't filter in query
        if (filters.status && filters.status !== 'all' && item.status !== filters.status) return false;
        return true;
      });

      setHistory(processed);

    } catch (error: any) {
      console.error('Error fetching history:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filters]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ plate: '', driver: '', status: '', startDate: '', endDate: '' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro de inspeção?')) {
      try {
        const { error } = await supabase.from('checklist_inspections').delete().eq('id', id);
        if (error) throw error;

        // Immediate Frontend Update
        setHistory(prev => prev.filter(item => item.id !== id));
        setActiveMenuId(null);

      } catch (err: any) {
        alert('Erro ao excluir: ' + err.message);
      }
    }
  };

  const handleOpenExport = (id: string) => {
    setSelectedInspectionId(id);
    setShowExportModal(true);
    setActiveMenuId(null);
  };

  return (
    <div className="p-8 space-y-6 animate-in slide-in-from-right duration-300" onClick={() => setActiveMenuId(null)}>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Checklists Realizados</h1>
          <p className="text-slate-500">Histórico completo de inspeções de frota.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); setShowFilters(!showFilters); }}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Filter size={18} />
            {showFilters ? 'Esconder Filtros' : 'Mostrar Filtros'}
          </button>
        </div>
      </header>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Placa do Veículo</label>
            <input
              type="text"
              placeholder="Ex: ABC-1234"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all"
              value={filters.plate}
              onChange={(e) => handleFilterChange('plate', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Motorista</label>
            <input
              type="text"
              placeholder="Nome do condutor"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all"
              value={filters.driver}
              onChange={(e) => handleFilterChange('driver', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Todos os Status</option>
              <option value="completed">Finalizado</option>
              <option value="in_progress">Em Andamento</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={clearFilters}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-lg text-sm transition-colors"
            >
              LIMPAR
            </button>
            <button
              onClick={() => fetchHistory()}
              className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Search size={16} />
              FILTRAR
            </button>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible min-h-[400px]">
        <div className="overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Tipo Veículo</th>
                <th className="px-6 py-4">Veículo</th>
                <th className="px-6 py-4">Checklist</th>
                <th className="px-6 py-4">Início</th>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4 text-center">Avarias</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400">
                    <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
                    <p className="text-sm">Carregando histórico...</p>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400">
                    <p className="text-sm">Nenhuma inspeção encontrada.</p>
                  </td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group relative">
                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${row.status === 'completed' || row.status === 'Aprovado' ? 'bg-green-100 text-green-700' :
                          row.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-600'
                        }`}>
                        {row.status === 'completed' ? 'Finalizado' : row.status}
                      </span>
                    </td>

                    {/* Code */}
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                      #{row.id.slice(0, 8)}
                    </td>

                    {/* Vehicle Type */}
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {row.vehicle?.vehicle_types?.name || row.vehicle?.type || '-'}
                    </td>

                    {/* Vehicle */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{row.vehicle?.plate}</span>
                        <span className="text-[10px] text-slate-400">{row.vehicle?.model}</span>
                      </div>
                    </td>

                    {/* Template */}
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {row.template?.name || 'Modelo Excluído'}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(row.started_at).toLocaleString('pt-BR')}
                    </td>

                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                          {row.user?.full_name?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm text-slate-700">{row.user?.full_name || 'Desconhecido'}</span>
                      </div>
                    </td>

                    {/* Issues */}
                    <td className="px-6 py-4 text-center">
                      {(row.critical_count || 0) > 0 ? (
                        <span className="flex items-center justify-center gap-1 text-red-600 font-bold text-xs">
                          <AlertTriangle size={14} />
                          {row.critical_count}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1 text-green-600 font-bold text-xs">
                          <CheckCircle2 size={14} />
                          OK
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right relative">
                      <div className="flex justify-end gap-2 items-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenExport(row.id); }}
                          className="p-2 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all"
                          title="Exportar"
                        >
                          <FileText size={18} />
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/inspections/${row.id}`); }}
                          className="p-2 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all"
                          title="Ver Detalhes"
                        >
                          <Eye size={18} />
                        </button>

                        {/* Dropdown Trigger */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === row.id ? null : row.id);
                            }}
                            className={`p-2 rounded-lg transition-all ${activeMenuId === row.id ? 'bg-slate-100 text-blue-900' : 'text-slate-400 hover:text-blue-900 hover:bg-blue-50'}`}
                          >
                            <MoreVertical size={18} />
                          </button>

                          {/* Dropdown Menu */}
                          {activeMenuId === row.id && (
                            <div className="absolute right-0 top-10 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 animate-in zoom-in-95 duration-200 header-dropdown">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(row.id);
                                }}
                                className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                              >
                                <Trash2 size={16} /> Excluir Registro
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        inspectionId={selectedInspectionId || ''}
      />
    </div>
  );
};

export default ChecklistHistory;
