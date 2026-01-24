import React from 'react';
import { AlertTriangle } from 'lucide-react';

const DuckIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.5,4.5h-0.8c0.3-0.5,0.4-1,0.2-1.6c-0.2-0.6-0.8-1-1.4-1.2c-0.6-0.1-1.2,0.1-1.7,0.5L14,3.8C13.2,3.3,12.1,3,11,3
    c-3.3,0-6,2.7-6,6c0,2.1,1.1,3.9,2.8,5c-0.3,0.3-0.7,0.7-1,1.1l-2.4-0.8c-0.6-0.2-1.2,0.1-1.5,0.7s0,1.3,0.6,1.7l3,1.6
    c1.4,0.7,3,0.8,4.5,0.2c1.5-0.6,2.6-1.8,3.1-3.3c3.8-0.9,6.5-4.4,6.5-8.4C20.5,5.9,20.1,5.1,19.5,4.5z M16.5,8c-0.6,0-1-0.4-1-1
    s0.4-1,1-1s1,0.4,1,1S17.1,8,16.5,8z"/>
  </svg>
);

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
          <DuckIcon size={48} className="text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-700 mb-2">Em desenvolvimento.</h2>
        <p className="text-slate-500 text-center max-w-md">
          Estamos trabalhando nesta funcionalidade.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
