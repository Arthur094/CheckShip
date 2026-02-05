import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cacheService } from '../../services/cacheService';

const TemplateSelectScreen: React.FC = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const [templates, setTemplates] = useState<any[]>([]);
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [checkingDocs, setCheckingDocs] = useState(false);
  const [violations, setViolations] = useState<{ doc: string; status: 'VENCIDO' | 'AUSENTE'; expiry?: string }[] | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!vehicleId) return;
      setLoading(true);
      try {
        // Load templates from cache
        const templatesData = cacheService.getTemplates();
        setTemplates(templatesData || []);
        console.log('✅ Templates carregados do cache:', templatesData?.length);

        // Load vehicle from cache
        const cachedVehicles = cacheService.getVehicles();
        const vehicleData = cachedVehicles.find(v => v.id === vehicleId);
        if (vehicleData) {
          setVehicle(vehicleData);
        }
      } catch (error) {
        console.error('Erro ao carregar templates:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [vehicleId]);

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectTemplate = async (template: any) => {
    if (!vehicleId) return;

    setCheckingDocs(true);
    setViolations(null);

    try {
      // Skip document check - allow offline inspection
      navigate(`/inspection/${vehicleId}/${template.id}`);
    } finally {
      setCheckingDocs(false);
    }
  };

  return (
    <div className="bg-background-light min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate('/vehicles')} className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold text-center flex-1">Selecionar Template</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto pb-6">
        <div className="p-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">local_shipping</span>
              </div>
              <div className="flex flex-col">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Veículo Selecionado</p>
                <h3 className="text-slate-900 text-lg font-bold leading-tight">
                  {vehicle ? `${vehicle.plate} - ${vehicle.model}` : `ID: ${vehicleId?.substring(0, 8)}...`}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-2">
          <input
            className="block w-full px-4 py-3 border border-slate-100 rounded-xl bg-white text-slate-900 shadow-sm"
            placeholder="Buscar modelos..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="pt-6 px-4">
          <h3 className="text-slate-900 text-lg font-bold mb-4">Modelos Disponíveis</h3>
          <div className="space-y-3">
            {loading ? (
              <p className="text-center py-10 text-slate-500">Carregando templates...</p>
            ) : filteredTemplates.length === 0 ? (
              <p className="text-center py-10 text-slate-500">Nenhum checklist vinculado.</p>
            ) : (
              filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  disabled={checkingDocs}
                  className={`w-full flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-left transition-all ${checkingDocs ? 'opacity-50' : 'active:scale-[0.98]'}`}
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">assignment</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 font-bold">{template.name}</p>
                    <p className="text-slate-500 text-sm">{template.description}</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-200">chevron_right</span>
                </button>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modal de Alerta de Documentos */}
      {violations && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="bg-red-50 p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl">warning</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Bloqueio Documental</h2>
              <p className="text-sm text-slate-500 mt-2">
                Não é possível iniciar esta inspeção devido a pendências nos documentos obrigatórios.
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {violations.map((v, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${v.status === 'VENCIDO' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                      <span className="material-symbols-outlined text-xl">{v.status === 'VENCIDO' ? 'event_busy' : 'description'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{v.doc}</p>
                      <p className={`text-[10px] font-black uppercase tracking-wider ${v.status === 'VENCIDO' ? 'text-orange-600' : 'text-red-600'}`}>
                        {v.status === 'VENCIDO' ? `Vencido em ${new Date(v.expiry!).toLocaleDateString('pt-BR')}` : 'Documento Ausente'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setViolations(null)}
                className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl font-bold active:scale-95 transition-all shadow-lg"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay de Loading */}
      {checkingDocs && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 font-bold">Validando documentos...</p>
        </div>
      )}
    </div>
  );
};

export default TemplateSelectScreen;