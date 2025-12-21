
import React from 'react';
import { Plus, User, FileBadge, Mail, ShieldCheck } from 'lucide-react';

const Drivers: React.FC = () => {
  return (
    <div className="p-8 space-y-6 animate-in slide-in-from-bottom duration-300">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Motoristas (Usuários)</h1>
          <p className="text-slate-500">Gestão de operadores e conformidade de CNH.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl font-bold shadow-lg hover:bg-blue-800 transition-all active:scale-95">
          <Plus size={20} />
          CADASTRAR MOTORISTA
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Ricardo Silva Mendes', cnh: '1234567890', expiry: '12/04/2026', email: 'ricardo@transporte.com', branch: 'Filial Sul', status: 'Aptos' },
          { name: 'Antonio Carlos Ferraz', cnh: '9876543210', expiry: '15/01/2025', email: 'antonio@transporte.com', branch: 'Filial SP', status: 'Atenção' },
          { name: 'Marcos Vinicius Rosa', cnh: '4567891230', expiry: '22/11/2025', email: 'marcos@transporte.com', branch: 'Filial Sul', status: 'Aptos' },
        ].map((driver, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:border-blue-200 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-900 group-hover:text-white transition-all">
                <User size={24} />
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                driver.status === 'Aptos' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {driver.status}
              </span>
            </div>
            
            <h3 className="font-bold text-slate-800 text-lg mb-1">{driver.name}</h3>
            <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
              <Mail size={12} />
              {driver.email}
            </p>

            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <FileBadge size={14} />
                  CNH
                </div>
                <span className="text-xs font-mono font-bold text-slate-800">{driver.cnh}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <Clock size={14} />
                  Vencimento CNH
                </div>
                <span className={`text-xs font-bold ${driver.status === 'Atenção' ? 'text-amber-600' : 'text-slate-800'}`}>
                  {driver.expiry}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <ShieldCheck size={14} />
                  Filial
                </div>
                <span className="text-xs font-bold text-blue-900">{driver.branch}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-colors">EDITAR</button>
              <button className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-colors">HISTÓRICO</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import { Clock } from 'lucide-react';
export default Drivers;
