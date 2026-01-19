import React from 'react';
import { AlertTriangle } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Operacional</h1>
        <p className="text-slate-500">Visão geral da frota e conformidade de inspeções.</p>
      </header>

      {/* Em Desenvolvimento */}
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6 border-2 border-amber-200">
          <AlertTriangle size={48} className="text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-700 mb-2">Módulo em Desenvolvimento</h2>
        <p className="text-slate-500 text-center max-w-md">
          Estamos trabalhando nesta funcionalidade. Em breve você terá acesso aos dashboards
          com visão geral da frota e conformidade de inspeções.
        </p>
        <div className="mt-6 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100">
          EM BREVE
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
