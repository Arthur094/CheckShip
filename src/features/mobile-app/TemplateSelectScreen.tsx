import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Template } from '../../types/mobile';

const MOCK_TEMPLATES: Template[] = [
  {
    id: '1',
    title: 'Pré-Viagem',
    description: 'Pneus, fluídos, luzes e carga.',
    duration: '15 min',
    icon: 'commute',
    iconColorClass: 'text-primary',
    iconBgClass: 'bg-blue-50 dark:bg-slate-700'
  },
  {
    id: '2',
    title: 'Manutenção Preventiva',
    description: 'Revisão mecânica detalhada.',
    duration: '30 min',
    icon: 'build',
    iconColorClass: 'text-indigo-600 dark:text-indigo-400',
    iconBgClass: 'bg-indigo-50 dark:bg-slate-700'
  },
  {
    id: '3',
    title: 'Relatório de Danos',
    description: 'Registrar avaria ou incidente específico.',
    duration: 'Varia',
    icon: 'minor_crash',
    iconColorClass: 'text-orange-600 dark:text-orange-400',
    iconBgClass: 'bg-orange-50 dark:bg-slate-700'
  },
  {
    id: '4',
    title: 'Inspeção de Pneus',
    description: 'Pressão, sulcos e danos.',
    duration: '10 min',
    icon: 'tire_repair',
    iconColorClass: 'text-slate-600 dark:text-slate-300',
    iconBgClass: 'bg-slate-100 dark:bg-slate-700'
  },
];

const TemplateSelectScreen: React.FC = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();

  const handleSelectTemplate = (templateId: string) => {
    // Navigate to the inspection screen with warning
    navigate(`/mobile/inspection/${templateId}`);
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col overflow-x-hidden antialiased">
      <div className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between transition-colors duration-200">
        <div className="w-10">
        </div>
        <h2 className="text-lg font-bold text-center flex-1 text-slate-900 dark:text-white">Selecionar Template</h2>
        <div className="flex items-center justify-end w-10">
          <button className="flex items-center justify-center w-10 h-10 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>
      </div>

      <main className="flex-1 w-full max-w-lg mx-auto pb-6">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-2xl">local_shipping</span>
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Inspecionando</p>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {/* Mock vehicle matching based on ID or just fallback if not found */}
                  {vehicleId && vehicleId.includes('-') ? vehicleId : 'Scania R450'}
                  <span className="font-normal text-slate-500 dark:text-slate-400 text-sm ml-1">#402</span>
                </h3>
              </div>
            </div>
            <button
              onClick={() => navigate('/mobile/vehicle-select')}
              className="text-primary hover:text-blue-600 dark:hover:text-blue-400 text-sm font-semibold py-1 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors self-end sm:self-center"
            >
              Trocar
            </button>
          </div>
        </div>

        <div className="px-4 pb-2">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
            </div>
            <input
              aria-label="Buscar templates"
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
              placeholder="Buscar templates..."
              type="text"
            />
          </div>
        </div>

        <div className="pt-6 px-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Todos os Modelos</h3>
          <div className="space-y-3">
            {MOCK_TEMPLATES.map((template) => (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 dark:hover:border-primary/30 active:scale-[0.98] transition-all cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-lg ${template.iconBgClass} ${template.iconColorClass} flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-2xl">{template.icon}</span>
                </div>
                <div className="flex-1 flex flex-col gap-0.5">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{template.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{template.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                    <span className="material-symbols-outlined text-sm mr-1">timer</span>
                    {template.duration}
                  </div>
                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors">chevron_right</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TemplateSelectScreen;