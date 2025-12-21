
import React from 'react';
import { Plus, Search, Filter, MoreVertical, ChevronDown, ClipboardList } from 'lucide-react';

interface ChecklistListProps {
  onNew: () => void;
}

const ChecklistList: React.FC<ChecklistListProps> = ({ onNew }) => {
  // Cleared the list as requested
  const mockChecklists: { name: string; updated: string }[] = [];

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Checklists</h1>
        <button 
          onClick={onNew}
          className="bg-blue-900 text-white px-8 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-blue-800 transition-all shadow-md flex items-center gap-2 active:scale-95"
        >
          Novo
        </button>
      </header>

      {/* Search and Filters */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Buscar" 
          className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-900 transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-blue-900">
          <Filter size={18} />
        </div>
      </div>

      {/* Checklist Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {mockChecklists.length > 0 ? (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="px-6 py-4 w-10"><input type="checkbox" className="rounded" /></th>
                <th className="px-6 py-4 flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                  Nome <ChevronDown size={14} className="mt-0.5" />
                </th>
                <th className="px-6 py-4 text-right">Última Atualização</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockChecklists.map((item, idx) => (
                <tr key={idx} className="hover:bg-blue-50/20 transition-colors cursor-pointer group">
                  <td className="px-6 py-4"><input type="checkbox" className="rounded" /></td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600 group-hover:text-blue-900">{item.name}</td>
                  <td className="px-6 py-4 text-xs font-bold text-blue-900 text-right hover:underline">{item.updated}</td>
                  <td className="px-6 py-4 text-slate-400">
                     <MoreVertical size={16} className="cursor-pointer hover:text-blue-900" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
              <ClipboardList size={32} />
            </div>
            <div>
              <p className="text-slate-800 font-bold">Nenhum checklist encontrado</p>
              <p className="text-slate-500 text-sm">Clique em "Novo" para criar o seu primeiro modelo de inspeção.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChecklistList;
