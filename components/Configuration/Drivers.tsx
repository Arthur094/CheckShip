
import React from 'react';
import { Plus, User, Search, Filter, Edit3, History, MoreVertical, Trash2, Mail, FileBadge, ShieldCheck, Clock } from 'lucide-react';

const Drivers: React.FC = () => {
  const drivers = [
    { id: '1', name: 'Ricardo Silva Mendes', cnh: '1234567890', expiry: '12/04/2026', email: 'ricardo@transporte.com', branch: 'Filial Sul', status: 'Aptos' },
    { id: '2', name: 'Antonio Carlos Ferraz', cnh: '9876543210', expiry: '15/01/2025', email: 'antonio@transporte.com', branch: 'Filial SP', status: 'Atenção' },
    { id: '3', name: 'Marcos Vinicius Rosa', cnh: '4567891230', expiry: '22/11/2025', email: 'marcos@transporte.com', branch: 'Filial Sul', status: 'Aptos' },
    { id: '4', name: 'Ana Paula Souza', cnh: '7788990011', expiry: '30/08/2027', email: 'ana.paula@transporte.com', branch: 'Filial RJ', status: 'Aptos' },
  ];

  return (
    <div className="p-8 space-y-6 animate-in slide-in-from-bottom duration-300">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Motoristas (Usuários)</h1>
          <p className="text-slate-500">Gestão de operadores e conformidade de habilitação.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl font-bold shadow-lg hover:bg-blue-800 transition-all active:scale-95">
          <Plus size={20} />
          CADASTRAR MOTORISTA
        </button>
      </header>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Tools bar */}
        <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome, e-mail ou CNH..." 
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-wider flex items-center gap-2">
              <Filter size={14} />
              Filtros
            </button>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-wider">Exportar</button>
          </div>
        </div>

        {/* List View (Table) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[10px] uppercase font-bold tracking-wider bg-slate-50/30">
                <th className="px-6 py-4">Motorista</th>
                <th className="px-6 py-4">E-mail</th>
                <th className="px-6 py-4">CNH</th>
                <th className="px-6 py-4">Venc. CNH</th>
                <th className="px-6 py-4">Filial</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-900 group-hover:text-white transition-all">
                        <User size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-slate-800 truncate">{driver.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <Mail size={14} className="text-slate-300" />
                      {driver.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600">
                      <FileBadge size={14} className="text-slate-300" />
                      {driver.cnh}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <Clock size={14} className={driver.status === 'Atenção' ? 'text-amber-500' : 'text-slate-300'} />
                      <span className={driver.status === 'Atenção' ? 'text-amber-600' : ''}>
                        {driver.expiry}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                      <ShieldCheck size={14} className="text-blue-200" />
                      {driver.branch}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                      driver.status === 'Aptos' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                        <Edit3 size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all" title="Histórico">
                        <History size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Excluir">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="p-4 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Exibindo {drivers.length} motoristas</span>
          <div className="flex items-center gap-2">
            <button className="p-1 px-2 border border-slate-200 rounded hover:bg-white disabled:opacity-50" disabled>Anterior</button>
            <button className="p-1 px-2 bg-blue-900 text-white border border-blue-900 rounded">1</button>
            <button className="p-1 px-2 border border-slate-200 rounded hover:bg-white">Próximo</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Drivers;
