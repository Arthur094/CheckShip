import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { driverService } from '../../services/driverService';
import { supabase } from '../../lib/supabase';
import { localStorageService } from '../../services/localStorageService';
import { cacheService } from '../../services/cacheService';

const InspectionScreen: React.FC = () => {
  const { vehicleId, templateId } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadTemplate() {
      if (!templateId || !vehicleId) return;
      try {
        const data = await driverService.getTemplateDetail(templateId);
        setTemplate(data);

        // Check for existing draft
        const existingDraft = localStorageService.getDraft(vehicleId, templateId);
        if (existingDraft) {
          console.log('📝 Rascunho encontrado, carregando respostas...');
          setAnswers(existingDraft.responses);
        }
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    }
    loadTemplate();
  }, [templateId, vehicleId]);

  // Helper to create proper answer format
  const createAnswer = (value: any, observation: string = '', photos: string[] = []) => ({
    answer: value,
    observation: observation || null,
    photos: photos || []
  });

  const handleSaveDraft = async () => {
    if (!vehicleId || !templateId) {
      alert('Erro: IDs inválidos.');
      return;
    }

    try {
      // Get vehicle and template names
      const vehicleData = await supabase.from('vehicles').select('plate').eq('id', vehicleId).single();

      localStorageService.saveDraft({
        vehicleId,
        templateId,
        vehiclePlate: vehicleData.data?.plate || 'Desconhecido',
        templateName: template?.name || 'Template desconhecido',
        responses: answers,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      alert('💾 Rascunho salvo! Continue depois em "Iniciados".');
      navigate('/');
    } catch (error: any) {
      console.error('Erro ao salvar rascunho:', error);
      alert('Erro ao salvar rascunho: ' + error.message);
    }
  };

  const handleFinish = async () => {
    try {
      setSaving(true);

      // Try to get user (may fail offline)
      let userId: string;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
        } else {
          // Fallback to cache
          const cachedUserId = cacheService.getUserId();
          if (!cachedUserId) {
            alert('Usuário não autenticado');
            return;
          }
          userId = cachedUserId;
        }
      } catch (authError) {
        console.log('📴 Offline: usando user ID do cache');
        const cachedUserId = cacheService.getUserId();
        if (!cachedUserId) {
          alert('Erro: Usuário não encontrado no cache');
          return;
        }
        userId = cachedUserId;
      }

      const inspectionData = {
        checklist_template_id: templateId,
        vehicle_id: vehicleId,
        inspector_id: userId,
        responses: answers,
        status: 'completed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Salvando:', Object.keys(inspectionData.responses).length, 'respostas');

      try {
        const { data, error } = await supabase
          .from('checklist_inspections')
          .insert(inspectionData)
          .select()
          .single();

        if (error) throw error;

        // Remove draft if exists
        if (vehicleId && templateId) {
          const draftKey = `${vehicleId}_${templateId}`;
          localStorageService.removeDraft(draftKey);
        }

        console.log('Salvo online:', data);
        alert('Inspeção finalizada e sincronizada!');
        navigate('/');
      } catch (onlineError: any) {
        console.warn('Falha online, salvando localmente...', onlineError);

        if (!templateId || !vehicleId) {
          alert('Erro: IDs inválidos.');
          return;
        }

        const vehicleData = await supabase.from('vehicles').select('plate').eq('id', vehicleId).single();

        // Tenta buscar usuario de novo caso tenha falhado antes
        const currentUser = userId;

        localStorageService.savePendingInspection({
          checklist_template_id: templateId,
          vehicle_id: vehicleId,
          inspector_id: currentUser,
          responses: answers,
          status: 'completed',
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          vehiclePlate: vehicleData.data?.plate || 'Desconhecido',
          templateName: template?.name || 'Template desconhecido'
        });

        alert('Sem conexão! Salvo em "Aguardando Sincronização" na aba Concluídos.');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Erro:', error);
      alert('Erro ao finalizar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Carregando perguntas...</div>;

  return (
    <div className="bg-background-light min-h-screen pb-24">
      <header className="bg-white border-b p-4 sticky top-0 z-10 flex items-center gap-4">
        <button onClick={() => navigate(-1)}><span className="material-symbols-outlined">arrow_back</span></button>
        <h1 className="font-bold text-lg">{template?.name}</h1>
      </header>

      <main className="p-4 space-y-6">
        {/* Itera sobre AREAS em vez de Sections */}
        {template?.structure?.areas?.map((area: any, areaIdx: number) => (
          <div key={areaIdx} className="space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase px-1">
              {area.name || area.title || 'Área sem título'}
            </h2>

            {/* Itera sobre ITEMS dentro da Área */}
            {area.items?.map((item: any) => {
              // Estabilidade: validação do item
              if (!item || !item.id || !item.type) {
                console.warn('Item malformado ignorado:', item);
                return null;
              }

              return (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                  <p className="font-medium text-slate-900">
                    {item.name || item.label || 'Questão sem título'}
                  </p>

                  {/* DEBUG: Log item config */}
                  {console.log('Item:', item.name, 'Type:', item.type, 'Config:', item.config)}

                  {/* Renderização baseada no TIPO */}

                  {/* AVALIATIVO (Conforme/Não Conforme) */}
                  {item.type === 'Avaliativo' && (
                    <div className="flex gap-2">
                      {['Conforme', 'Não Conforme', 'N/A'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setAnswers({ ...answers, [item.id]: createAnswer(opt) })}
                          className={`flex-1 py-3 rounded-lg border text-xs font-bold transition-all ${answers[item.id]?.answer === opt
                            ? (opt === 'Não Conforme' ? 'bg-red-600 text-white border-red-600' : 'bg-blue-900 text-white border-blue-900')
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* NUMÉRICO */}
                  {item.type === 'Numérico' && (
                    <input
                      type="number"
                      placeholder="Informe o valor..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-900 transition-all"
                      onChange={(e) => setAnswers({ ...answers, [item.id]: createAnswer(e.target.value) })}
                      value={answers[item.id]?.answer || ''}
                    />
                  )}

                  {/* TEXTO */}
                  {item.type === 'Texto' && (
                    <textarea
                      placeholder="Digite sua resposta..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-900 transition-all min-h-[80px]"
                      onChange={(e) => setAnswers({ ...answers, [item.id]: createAnswer(e.target.value) })}
                      value={answers[item.id]?.answer || ''}
                    />
                  )}

                  {/* DATA */}
                  {item.type === 'Data' && (
                    <input
                      type="date"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-900 transition-all"
                      onChange={(e) => setAnswers({ ...answers, [item.id]: createAnswer(e.target.value) })}
                      value={answers[item.id]?.answer || ''}
                    />
                  )}

                  {/* CADASTRO (Campo de texto livre) */}
                  {item.type === 'Cadastro' && (
                    <input
                      type="text"
                      placeholder="Digite aqui..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-900 transition-all"
                      onChange={(e) => setAnswers({ ...answers, [item.id]: createAnswer(e.target.value) })}
                      value={answers[item.id]?.answer || ''}
                    />
                  )}

                  {/* LISTA DE SELEÇÃO - SELEÇÃO ÚNICA */}
                  {item.type === 'Lista de Seleção' && (item.config?.selectionType || (item.config as any)?.selection_type) !== 'multiple' && (
                    <select
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-900 transition-all"
                      onChange={(e) => setAnswers({ ...answers, [item.id]: createAnswer(e.target.value) })}
                      value={answers[item.id]?.answer || ''}
                    >
                      <option value="">Selecione uma opção...</option>
                      {(item.config?.selectionOptions || (item.config as any)?.selection_options || []).map((opt: any, idx: number) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {/* LISTA DE SELEÇÃO - SELEÇÃO MÚLTIPLA */}
                  {item.type === 'Lista de Seleção' && ((item.config?.selectionType || (item.config as any)?.selection_type) === 'multiple') && (
                    <div className="space-y-2">
                      {(item.config?.selectionOptions || (item.config as any)?.selection_options || []).map((opt: any, idx: number) => {
                        const currentAnswers = answers[item.id]?.answer || [];
                        const isChecked = Array.isArray(currentAnswers) && currentAnswers.includes(opt);

                        return (
                          <label key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-all">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const current = Array.isArray(answers[item.id]?.answer) ? answers[item.id].answer : [];
                                if (e.target.checked) {
                                  setAnswers({ ...answers, [item.id]: createAnswer([...current, opt]) });
                                } else {
                                  setAnswers({ ...answers, [item.id]: createAnswer(current.filter((v: any) => v !== opt)) });
                                }
                              }}
                              className="w-5 h-5 text-blue-900 border-slate-300 rounded focus:ring-2 focus:ring-blue-100"
                            />
                            <span className="text-sm text-slate-700">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* FOTO/ANEXO */}
                  {(item.config?.allow_photo || item.config?.allow_attachment) && (
                    <div className="space-y-2">
                      <label className="flex items-center justify-center gap-2 p-4 bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-all">
                        <span className="material-symbols-outlined text-blue-900 text-2xl">photo_camera</span>
                        <span className="text-sm font-medium text-blue-900">
                          {item.config?.allow_photo ? 'Tirar Foto' : 'Adicionar Anexo'}
                        </span>
                        <input
                          type="file"
                          accept={item.config?.allow_photo ? "image/*" : "*/*"}
                          capture={item.config?.allow_photo ? "environment" : undefined}
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                // 1. Compress Image (Inline implementation for simplicity in this component)
                                const compressImage = (fileToCompress: File): Promise<Blob> => {
                                  return new Promise((resolve, reject) => {
                                    const reader = new FileReader();
                                    reader.readAsDataURL(fileToCompress);
                                    reader.onload = (event) => {
                                      const img = new Image();
                                      img.src = event.target?.result as string;
                                      img.onload = () => {
                                        const canvas = document.createElement('canvas');
                                        let width = img.width;
                                        let height = img.height;
                                        const MAX_WIDTH = 1920;
                                        const MAX_HEIGHT = 1920;

                                        if (width > height) {
                                          if (width > MAX_WIDTH) {
                                            height *= MAX_WIDTH / width;
                                            width = MAX_WIDTH;
                                          }
                                        } else {
                                          if (height > MAX_HEIGHT) {
                                            width *= MAX_HEIGHT / height;
                                            height = MAX_HEIGHT;
                                          }
                                        }

                                        canvas.width = width;
                                        canvas.height = height;
                                        const ctx = canvas.getContext('2d');
                                        ctx?.drawImage(img, 0, 0, width, height);

                                        canvas.toBlob((blob) => {
                                          if (blob) resolve(blob);
                                          else reject(new Error('Falha na compressão'));
                                        }, 'image/jpeg', 0.85);
                                      };
                                    };
                                  });
                                };

                                console.log('🔄 Comprimindo imagem...', file.name);
                                const compressedBlob = await compressImage(file);

                                // 2. Generate unique filename
                                const fileName = `${vehicleId}_${templateId}_${item.id}_${Date.now()}.jpg`;

                                // Auxiliar para converter Blob em Base64 (para modo offline)
                                const blobToBase64 = (blob: Blob): Promise<string> => {
                                  return new Promise((resolve, reject) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => resolve(reader.result as string);
                                    reader.onerror = reject;
                                    reader.readAsDataURL(blob);
                                  });
                                };

                                let publicUrl = '';
                                let isOfflineImage = false;

                                try {
                                  console.log('☁️ Tentando upload online:', fileName);

                                  // 3. Upload Online
                                  const { error: uploadError } = await supabase.storage
                                    .from('checklist-photos')
                                    .upload(fileName, compressedBlob, {
                                      contentType: 'image/jpeg',
                                      upsert: false
                                    });

                                  if (uploadError) throw uploadError;

                                  // 4. Get Public URL
                                  const { data } = supabase.storage
                                    .from('checklist-photos')
                                    .getPublicUrl(fileName);

                                  publicUrl = data.publicUrl;
                                  console.log('✅ Upload Online Sucesso!');

                                } catch (error) {
                                  console.warn('⚠️ Falha no upload (provavelmente offline). Salvando localmente.', error);

                                  // FALLBACK OFFLINE: Converter para Base64
                                  publicUrl = await blobToBase64(compressedBlob);
                                  isOfflineImage = true;
                                }

                                // 5. Save URL (or Base64) to answers
                                const currentAnswer = answers[item.id] || createAnswer(null);
                                setAnswers(prev => ({
                                  ...prev,
                                  [item.id]: {
                                    ...currentAnswer,
                                    imageUrl: publicUrl,
                                    isOffline: isOfflineImage, // Flag para indicar que precisa de sync depois
                                    fileName: fileName // Guarda o nome planejado
                                  },
                                  [item.id + '_file']: file.name
                                }));

                                if (isOfflineImage) {
                                  alert('Sem internet! Imagem salva no dispositivo para envio posterior.');
                                } else {
                                  alert('Imagem enviada com sucesso!');
                                }

                              } catch (error: any) {
                                console.error('Erro crítico ao processar imagem:', error);
                                alert('Erro ao processar imagem: ' + error.message);
                              }
                            }
                          }}
                        />
                      </label>
                      {answers[item.id + '_file'] && (
                        <div className="text-xs text-slate-500 text-center">
                          📷 {answers[item.id + '_file']}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        ))}

        {(!template?.structure?.areas || template.structure.areas.length === 0) && (
          <div className="text-center py-10 text-slate-400">
            Este checklist não possui áreas configuradas ou o formato é inválido.
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t space-y-3">
        <button
          onClick={handleSaveDraft}
          className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
        >
          💾 Salvar Rascunho
        </button>
        <button
          onClick={handleFinish}
          disabled={saving}
          className="w-full bg-primary text-white py-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Salvando...' : 'Finalizar Inspeção'}
        </button>
      </footer>
    </div>
  );
};

export default InspectionScreen;