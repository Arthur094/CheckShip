
import React, { useState } from 'react';
// Added missing AlertTriangle and CheckCircle2 to the imports
import { Search, Filter, Download, Trash2, Check, X, Camera, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ChecklistStatus } from '../types';

const ChecklistHistory: React.FC = () => {
  const [showFilters, setShowFilters] = useState(true);

  const mockHistory = [
    { id: '1', date: '21/11/2025 14:30', plate: 'BRA2E19', driver: 'Marcelo Oliveira', branch: 'Filial Sul', status: ChecklistStatus.APROVADO, km: 45600, cargo: 'Alimentos', issues: 0 },
    { id: '2', date: '21/11/2025 10:15', plate: 'KLP4902', driver: 'João Batista', branch: 'Filial SP', status: ChecklistStatus.REPROVADO, km: 125000, cargo: 'Químicos', issues: 2 },
    { id: '3', date: '20/11/2025 16:50', plate: 'JHG1A22', driver: 'Fernanda Lima', branch: 'Filial RJ', status: ChecklistStatus.EM_ANALISE, km: 89300, cargo: 'Geral', issues: 1 },
  ];

  return (
    <div className="p-8 space-y-6 animate-in slide-in-from-right duration-300">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Checklists Realizados</h1>
          <p className="text-slate-500">Histórico completo de inspeções de frota.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Filter size={18} />
            {showFilters ? 'Esconder Filtros' : 'Mostrar Filtros'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-800 transition-colors">
            <Download size={18} />
            GERAR RELATÓRIO PDF
          </button>
        </div>
      </header>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in zoom-in duration-200">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Placa do Veículo</label>
            <input type="text" placeholder="Ex: ABC-1234" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Motorista</label>
            <input type="text" placeholder="Nome do condutor" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Filial / Região</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none">
              <option>Todas as Filiais</option>
              <option>Filial Sul</option>
              <option>Filial SP</option>
              <option>Filial RJ</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none">
              <option>Todos os Status</option>
              <option>Aprovado</option>
              <option>Reprovado</option>
              <option>Em Análise</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo de Carga</label>
            <input type="text" placeholder="Ex: Químico, Alimento" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Faixa de KM (Início)</label>
            <input type="number" placeholder="KM Min" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Faixa de KM (Fim)</label>
            <input type="number" placeholder="KM Max" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
          <div className="flex items-end gap-2">
            <button className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-lg text-sm transition-colors">LIMPAR</button>
            <button className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
              <Search size={16} />
              FILTRAR
            </button>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="px-6 py-4">Data / Hora</th>
                <th className="px-6 py-4">Placa</th>
                <th className="px-6 py-4">Motorista</th>
                <th className="px-6 py-4">KM Atual</th>
                <th className="px-6 py-4">Itens Reprovados</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockHistory.map((row) => (
                <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{row.date}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-800 text-white rounded font-mono text-xs font-bold tracking-widest border border-slate-900 shadow-sm">
                      {row.plate}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">{row.driver}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{row.branch}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono">{row.km.toLocaleString()} km</td>
                  <td className="px-6 py-4">
                    {row.issues > 0 ? (
                      <span className="flex items-center gap-1 text-red-600 font-bold text-sm">
                        <AlertTriangle size={14} />
                        {row.issues} Itens Críticos
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-600 font-bold text-sm">
                        <CheckCircle2 size={14} />
                        Nenhum
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      row.status === ChecklistStatus.APROVADO ? 'bg-green-100 text-green-700' :
                      row.status === ChecklistStatus.REPROVADO ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all" title="Ver Detalhes">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all" title="Ver Evidências">
                        <Camera size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Excluir">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChecklistHistory;
