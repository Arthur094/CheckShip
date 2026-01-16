import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { driverService } from '../../services/driverService';

const TemplateSelectScreen: React.FC = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const [templates, setTemplates] = useState<any[]>([]);
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!vehicleId) return;
      setLoading(true);
      try {
        // Load templates (with offline fallback)
        const templatesData = await driverService.getAvailableTemplates(vehicleId);
        setTemplates(templatesData || []);
        console.log('✅ Templates carregados:', templatesData?.length);

        // Try to load vehicle details (may fail offline)
        try {
          const vehicleData = await driverService.getVehicleDetail(vehicleId);
          setVehicle(vehicleData);
        } catch (vehicleError) {
          console.log('⚠️ Não foi possível carregar detalhes do veículo (offline)');
          // Continue anyway - templates já foram carregados
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
              <p className="text-center py-10 text-slate-500">Buscando no banco...</p>
            ) : filteredTemplates.length === 0 ? (
              <p className="text-center py-10 text-slate-500">Nenhum checklist vinculado.</p>
            ) : (
              filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => navigate(`/inspection/${vehicleId}/${template.id}`)}
                  className="w-full flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-left"
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
    </div>
  );
};

export default TemplateSelectScreen;