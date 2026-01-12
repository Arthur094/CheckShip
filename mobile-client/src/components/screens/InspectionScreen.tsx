import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { driverService } from '../../services/driverService';

const InspectionScreen: React.FC = () => {
  const { vehicleId, templateId } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplate() {
      if (!templateId) return;
      try {
        const data = await driverService.getTemplateDetail(templateId);
        setTemplate(data);
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    }
    loadTemplate();
  }, [templateId]);

  if (loading) return <div className="p-10 text-center">Carregando perguntas...</div>;

  return (
    <div className="bg-background-light min-h-screen pb-24">
      <header className="bg-white border-b p-4 sticky top-0 z-10 flex items-center gap-4">
        <button onClick={() => navigate(-1)}><span className="material-symbols-outlined">arrow_back</span></button>
        <h1 className="font-bold text-lg">{template?.name}</h1>
      </header>

      <main className="p-4 space-y-6">
        {template?.structure?.sections?.map((section: any, idx: number) => (
          <div key={idx} className="space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase">{section.title}</h2>
            {section.items.map((item: any) => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                <p className="font-medium">{item.label}</p>
                {item.type === 'boolean' && (
                  <div className="flex gap-2">
                    {['CONFORME', 'NAO_CONFORME', 'N/A'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setAnswers({ ...answers, [item.id]: opt })}
                        className={`flex-1 py-3 rounded-lg border text-xs font-bold ${answers[item.id] === opt ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600'
                          }`}
                      >
                        {opt.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                )}
                {item.type === 'number' && (
                  <input
                    type="number"
                    placeholder="Valor numérico..."
                    className="w-full p-3 bg-slate-50 border rounded-lg outline-none"
                    onChange={(e) => setAnswers({ ...answers, [item.id]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <button className="w-full bg-primary text-white py-4 rounded-xl font-bold">Finalizar Inspeção</button>
      </footer>
    </div>
  );
};

export default InspectionScreen;