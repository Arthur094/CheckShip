import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, ChevronDown, ClipboardList } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ChecklistTemplate } from '../../../types';

interface ChecklistListProps {
  onNew: () => void;
  onEdit: (template: ChecklistTemplate) => void;
}

const ChecklistList: React.FC<ChecklistListProps> = ({ onNew, onEdit }) => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('checklist_templates')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar templates:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este checklist?')) return;

    try {
      const { error } = await supabase
        .from('checklist_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== id));
      setActiveMenuId(null);
    } catch (error: any) {
      console.error('Error deleting template:', error.message);
      alert('Erro ao excluir: ' + error.message);
    }
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500" onClick={() => setActiveMenuId(null)}>
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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-900 transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-blue-900">
          <Filter size={18} />
        </div>
      </div>

      {/* Checklist Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
            <p className="text-slate-400 animate-pulse">Carregando checklists...</p>
          </div>
        ) : filteredTemplates.length > 0 ? (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="px-6 py-4 w-10"><input type="checkbox" className="rounded" /></th>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Assunto</th>
                <th className="px-6 py-4 text-right">Última Atualização</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTemplates.map((template) => (
                <tr
                  key={template.id}
                  className="hover:bg-blue-50/20 transition-colors cursor-pointer group"
                  onClick={() => onEdit(template)}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700 group-hover:text-blue-900">{template.name}</span>
                      <span className="text-[10px] text-slate-400">{template.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{template.subject || '-'}</td>
                  <td className="px-6 py-4 text-xs font-bold text-blue-900 text-right">
                    {new Date(template.updated_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 text-slate-400 relative">
                    <button
                      className="p-1 hover:bg-slate-100 rounded-md transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === template.id ? null : template.id);
                      }}
                    >
                      <MoreVertical size={16} className="cursor-pointer hover:text-blue-900" />
                    </button>
                    {activeMenuId === template.id && (
                      <div className="absolute right-8 top-8 bg-white border border-slate-200 rounded-lg shadow-xl py-2 w-32 z-10 animate-in fade-in zoom-in-95 duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(template.id);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                        >
                          Excluir
                        </button>
                      </div>
                    )}
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
