import React from 'react';
import { useNavigate } from 'react-router-dom';

const InspectionScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white font-display antialiased min-h-screen flex flex-col items-center justify-center relative">
      {/* Floating back button for usability */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <span className="material-symbols-outlined text-3xl">arrow_back</span>
      </button>

      <div className="flex flex-col items-center text-center p-8 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-center size-20 rounded-2xl bg-slate-100 text-slate-400">
          <span className="material-symbols-outlined text-5xl animate-pulse">hourglass_top</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-6">Aguardando template</h2>
        <p className="text-sm text-primary text-center max-w-xs">O modelo de inspeção está sendo carregado...</p>
      </div>
    </div>
  );
};

export default InspectionScreen;