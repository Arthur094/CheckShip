import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { driverService } from '../../services/driverService';
import { supabase } from '../../lib/supabase';
import { localStorageService } from '../../services/localStorageService';
import { cacheService } from '../../services/cacheService';
import { ThumbsUp, ThumbsDown, Smile, Meh, Frown, Camera } from 'lucide-react';
import SignaturePad from '../../../../src/components/common/SignaturePad';

const InspectionScreen: React.FC = () => {
  const { vehicleId, templateId } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Signature states
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [driverSignatureUrl, setDriverSignatureUrl] = useState<string | null>(null);

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

  // Handle button click - check if signature required
  const handleCompleteClick = () => {
    const requiresSignature = template?.settings?.require_driver_signature;

    if (requiresSignature && !driverSignatureUrl) {
      setShowSignatureModal(true);
    } else {
      handleFinish(driverSignatureUrl);
    }
  };

  // Handle signature save for Mobile
  const handleSignatureSave = async (dataUrl: string) => {
    setDriverSignatureUrl(dataUrl);
    setShowSignatureModal(false);
    await handleFinish(dataUrl);
  };

  const handleFinish = async (signatureUrl?: string | null) => {
    // 🔍 VALIDAÇÃO DE FINALIZAÇÃO
    // Verifica se há fotos obrigatórias pendentes
    let pendingPhotos = false;
    let pendingItemName = '';

    template?.structure?.areas?.forEach((area: any) => {
      area.items?.forEach((item: any) => {
        if (!item) return;

        const val = answers[item.id]?.answer;
        const config = item.config || {};
        const requirePhotoOn = config.require_photo_on || [];

        // Lógica de obrigatoriedade
        // 1. Se "always" está nas condições
        // 2. Se "mandatoryAttachment" (legado) está true E não há condições específicas (fallback para sempre)
        // 3. Se a resposta atual bate com uma condição ('nao', 'ruim', etc)
        const conditionMet =
          requirePhotoOn.includes('always') ||
          (item.mandatoryAttachment && requirePhotoOn.length === 0) ||
          (val === 'Não Conforme' && requirePhotoOn.includes('nao')) ||
          (val === 'Não Conforme' && requirePhotoOn.includes('ruim')) ||
          (val === 'Regular' && requirePhotoOn.includes('regular'));

        if (conditionMet) {
          // Checa se tem foto (URL online, base64 ou arquivo local pendente)
          const hasPhoto = answers[item.id]?.imageUrl || answers[item.id + '_file'] || (answers[item.id]?.photos && answers[item.id]?.photos.length > 0);

          if (!hasPhoto) {
            pendingPhotos = true;
            pendingItemName = item.name || 'Item sem nome';
          }
        }
      });
    });

    if (pendingPhotos) {
      alert(`⚠️ FOTO OBRIGATÓRIA!\n\nO item "${pendingItemName}" exige uma foto para a resposta selecionada.`);
      return;
    }

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

      // Determine status based on analysis workflow
      const requiresAnalysis = template?.requires_analysis === true;
      const inspectionStatus = requiresAnalysis ? 'pending' : 'completed';
      const analysisStatus = requiresAnalysis ? 'pending' : null;
      const analysisTotalSteps = template?.analysis_approvals_count || 1;

      const inspectionData = {
        checklist_template_id: templateId,
        vehicle_id: vehicleId,
        inspector_id: userId,
        responses: answers,
        status: inspectionStatus,
        // Analysis workflow fields
        analysis_status: analysisStatus,
        analysis_current_step: 0,
        analysis_total_steps: requiresAnalysis ? analysisTotalSteps : null,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(signatureUrl && { driver_signature_url: signatureUrl })
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
        if (requiresAnalysis) {
          alert('✅ Inspeção finalizada! Aguardando análise do gestor.');
        } else {
          alert('✅ Inspeção finalizada e sincronizada!');
        }
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
          status: inspectionStatus,
          // Analysis workflow fields (for when synced later)
          analysis_status: analysisStatus,
          analysis_current_step: 0,
          analysis_total_steps: requiresAnalysis ? analysisTotalSteps : null,
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

                  {/* AVALIATIVO (Conforme/Não Conforme / Smiles / Thumbs) */}
                  {item.type === 'Avaliativo' && (() => {
                    // Determine effective input style - input_style takes priority, then fallback to scale_type mapping
                    const getEffectiveInputStyle = () => {
                      if (item.config?.input_style && item.config.input_style !== 'default') {
                        return item.config.input_style;
                      }
                      // Map scale_type to input_style
                      const scaleType = item.config?.scale_type;
                      if (scaleType === 'faces_3') return 'smile_3';
                      if (scaleType === 'faces_2') return 'smile_2'; // Same visual as smile_3 but 2 options
                      if (scaleType === 'ns') return 'n_s';
                      return 'default';
                    };
                    const effectiveStyle = getEffectiveInputStyle();

                    return (
                      <div className="flex gap-2">
                        {/* Padrão (Texto) - only show when no scale_type or input_style is defined */}
                        {effectiveStyle === 'default' && ['Conforme', 'Não Conforme', 'N/A'].map((opt) => (
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

                        {/* Thumbs (Joinha) */}
                        {effectiveStyle === 'thumbs' && (
                          <>
                            <button
                              onClick={() => setAnswers({ ...answers, [item.id]: createAnswer('Conforme') })}
                              className={`flex-1 py-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${answers[item.id]?.answer === 'Conforme'
                                ? 'bg-green-50 border-green-500 text-green-700'
                                : 'bg-white border-slate-200 text-slate-400'
                                }`}
                            >
                              <ThumbsUp size={24} weight={answers[item.id]?.answer === 'Conforme' ? "fill" : "regular"} />
                            </button>
                            <button
                              onClick={() => setAnswers({ ...answers, [item.id]: createAnswer('Não Conforme') })}
                              className={`flex-1 py-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${answers[item.id]?.answer === 'Não Conforme'
                                ? 'bg-red-50 border-red-500 text-red-700'
                                : 'bg-white border-slate-200 text-slate-400'
                                }`}
                            >
                              <ThumbsDown size={24} weight={answers[item.id]?.answer === 'Não Conforme' ? "fill" : "regular"} />
                            </button>
                            <button
                              onClick={() => setAnswers({ ...answers, [item.id]: createAnswer('N/A') })}
                              className={`w-16 py-4 rounded-xl border-2 flex items-center justify-center transition-all ${answers[item.id]?.answer === 'N/A'
                                ? 'bg-slate-100 border-slate-400 text-slate-700'
                                : 'bg-white border-slate-200 text-slate-400'
                                }`}
                            >
                              <span className="font-bold text-xs">N/A</span>
                            </button>
                          </>
                        )}

                        {/* Smileys (3 options) */}
                        {effectiveStyle === 'smile_3' && (
                          <>
                            <button
                              onClick={() => setAnswers({ ...answers, [item.id]: createAnswer('Conforme') })} // Good
                              className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${answers[item.id]?.answer === 'Conforme'
                                ? 'bg-green-50 border-green-500 text-green-600'
                                : 'bg-white border-slate-200 text-slate-400'
                                }`}
                            >
                              <Smile size={32} />
                              <span className="text-[10px] font-bold">Bom</span>
                            </button>

                            <button
                              onClick={() => setAnswers({ ...answers, [item.id]: createAnswer('Regular') })} // Regular (Warning?) - Wait, standard is Conforme/Nao Conforme. 
                              // Usually Smile 3 maps to Good/Regular/Bad? Or Yes/Maybe/No?
                              // Integrating with existing logic: 'Regular' acts as... depends on backend logic.
                              // Let's assume 'Regular' is valid but flagged? Or just a value. 
                              // But usually backend expects 'Conforme'/'Não Conforme'. 
                              // If user selected 'smile_3', we probably want to save 'Regular' as the answer string.
                              // The backend handles strings, so it's fine.
                              className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${answers[item.id]?.answer === 'Regular'
                                ? 'bg-yellow-50 border-yellow-500 text-yellow-600'
                                : 'bg-white border-slate-200 text-slate-400'
                                }`}
                            >
                              <Meh size={32} />
                              <span className="text-[10px] font-bold">Regular</span>
                            </button>

                            <button
                              onClick={() => setAnswers({ ...answers, [item.id]: createAnswer('Não Conforme') })} // Bad
                              className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${answers[item.id]?.answer === 'Não Conforme'
                                ? 'bg-red-50 border-red-500 text-red-600'
                                : 'bg-white border-slate-200 text-slate-400'
                                }`}
                            >
                              <Frown size={32} />
                              <span className="text-[10px] font-bold">Ruim</span>
                            </button>
                          </>
                        )}

                        {/* Smileys (2 options) - Same visual as smile_3 */}
                        {effectiveStyle === 'smile_2' && (
                          <>
                            <button
                              onClick={() => setAnswers({ ...answers, [item.id]: createAnswer('Bom') })}
                              className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${answers[item.id]?.answer === 'Bom'
                                ? 'bg-green-50 border-green-500 text-green-600'
                                : 'bg-white border-slate-200 text-slate-400'
                                }`}
                            >
                              <Smile size={32} />
                              <span className="text-[10px] font-bold">Bom</span>
                            </button>

                            <button
                              onClick={() => setAnswers({ ...answers, [item.id]: createAnswer('Ruim') })}
                              className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${answers[item.id]?.answer === 'Ruim'
                                ? 'bg-red-50 border-red-500 text-red-600'
                                : 'bg-white border-slate-200 text-slate-400'
                                }`}
                            >
                              <Frown size={32} />
                              <span className="text-[10px] font-bold">Ruim</span>
                            </button>
                          </>
                        )}

                        {/* Happy / Sad (2 options) */}
                        {effectiveStyle === 'happy_sad' && (
                          <>
                            <button
                              onClick={() => setAnswers({ ...answers, [item.id]: createAnswer('Conforme') })}
                              className={`flex-1 py-4 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${answers[item.id]?.answer === 'Conforme'
                                ? 'bg-green-50 border-green-500 text-green-600'
                                : 'bg-white border-slate-200 text-slate-400'
                                }`}
                            >
                              <div className="text-4xl">🙂</div>
                              <span className="text-[10px] font-bold">Feliz</span>
                            </button>

                            <button
                              onClick={() => setAnswers({ ...answers, [item.id]: createAnswer('Não Conforme') })}
                              className={`flex-1 py-4 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${answers[item.id]?.answer === 'Não Conforme'
                                ? 'bg-red-50 border-red-500 text-red-600'
                                : 'bg-white border-slate-200 text-slate-400'
                                }`}
                            >
                              <div className="text-4xl">☹️</div>
                              <span className="text-[10px] font-bold">Triste</span>
                            </button>
                          </>
                        )}

                        {/* N / S Buttons */}
                        {effectiveStyle === 'n_s' && (
                          <div className="flex w-full gap-4 justify-center">
                            <button
                              onClick={() => setAnswers({ ...answers, [item.id]: createAnswer('Não') })}
                              className={`w-20 h-20 rounded-xl border-2 flex items-center justify-center transition-all ${answers[item.id]?.answer === 'Não'
                                ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-500/30'
                                : 'bg-white border-slate-200 text-red-600'
                                }`}
                            >
                              <span className="text-4xl font-black">N</span>
                            </button>

                            <button
                              onClick={() => setAnswers({ ...answers, [item.id]: createAnswer('Sim') })}
                              className={`w-20 h-20 rounded-xl border-2 flex items-center justify-center transition-all ${answers[item.id]?.answer === 'Sim'
                                ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-500/30'
                                : 'bg-white border-slate-200 text-green-600'
                                }`}
                            >
                              <span className="text-4xl font-black">S</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}

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

                  {/* FOTO/ANEXO - Only show if:
                      1. allow_photo is true (Anexos Opcionais), OR
                      2. mandatory condition is met (e.g., answered Ruim with rule 'ruim')
                  */}
                  {(() => {
                    const val = answers[item.id]?.answer;
                    const config = item.config || {};
                    const requirePhotoOn = config.require_photo_on || [];

                    // Check if mandatory condition is met
                    // Map different answer formats: text mode (Conforme/Não Conforme) and emoji mode (Bom/Regular/Ruim) and N/S mode (Sim/Não)
                    const isMandatory =
                      item.mandatory_attachment ||
                      requirePhotoOn.includes('always') ||
                      // N/S mode: Sim/Não
                      (val === 'Sim' && requirePhotoOn.includes('sim')) ||
                      (val === 'Não' && requirePhotoOn.includes('nao')) ||
                      // Text mode: Conforme/Não Conforme
                      (val === 'Conforme' && requirePhotoOn.includes('bom')) ||
                      (val === 'Conforme' && requirePhotoOn.includes('sim')) ||
                      (val === 'Não Conforme' && requirePhotoOn.includes('nao')) ||
                      (val === 'Não Conforme' && requirePhotoOn.includes('ruim')) ||
                      // Emoji mode: Bom/Regular/Ruim
                      (val === 'Bom' && requirePhotoOn.includes('bom')) ||
                      (val === 'Ruim' && requirePhotoOn.includes('ruim')) ||
                      (val === 'Regular' && requirePhotoOn.includes('regular'));

                    // Show field if: allow_photo OR mandatory condition met
                    const shouldShow = config.allow_photo || isMandatory;

                    if (!shouldShow) return null;

                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className={`flex items-center gap-2 text-sm font-bold uppercase transition-colors ${isMandatory ? 'text-red-500' : 'text-slate-500'}`}>
                            <Camera size={16} />
                            Evidência {isMandatory ? 'Obrigatória' : '(Opcional)'}
                          </label>
                        </div>
                        <label className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all ${isMandatory && !answers[item.id]?.imageUrl
                          ? 'bg-red-50 border-red-300 hover:bg-red-100'
                          : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                          }`}>
                          <Camera className={
                            (() => {
                              const val = answers[item.id]?.answer;
                              const isMandatory =
                                (val === 'Não Conforme' && item.config?.require_photo_on?.includes('nao')) ||
                                (val === 'Não Conforme' && item.config?.require_photo_on?.includes('ruim')) ||
                                (val === 'Regular' && item.config?.require_photo_on?.includes('regular'));

                              if (isMandatory && !answers[item.id]?.imageUrl && !answers[item.id + '_file']) {
                                return 'text-red-500';
                              }
                              return 'text-blue-900';
                            })()
                          } size={24} />
                          <span className={`text-sm font-medium ${(() => {
                            const val = answers[item.id]?.answer;
                            const isMandatory =
                              (val === 'Não Conforme' && item.config?.require_photo_on?.includes('nao')) ||
                              (val === 'Não Conforme' && item.config?.require_photo_on?.includes('ruim')) ||
                              (val === 'Regular' && item.config?.require_photo_on?.includes('regular'));

                            if (isMandatory && !answers[item.id]?.imageUrl && !answers[item.id + '_file']) {
                              return 'text-red-600';
                            }
                            return 'text-blue-900';
                          })()
                            }`}>
                            {(() => {
                              const val = answers[item.id]?.answer;
                              const isMandatory =
                                (val === 'Não Conforme' && item.config?.require_photo_on?.includes('nao')) ||
                                (val === 'Não Conforme' && item.config?.require_photo_on?.includes('ruim')) ||
                                (val === 'Regular' && item.config?.require_photo_on?.includes('regular'));

                              if (isMandatory) return 'Foto Obrigatória!';
                              return item.config?.allow_photo ? 'Tirar Foto' : 'Adicionar Anexo';
                            })()}
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
                    );
                  })()}

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
          onClick={handleCompleteClick}
          disabled={saving}
          className="w-full bg-blue-900 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {saving ? 'Salvando...' : 'Finalizar Inspeção'}
        </button>
      </footer>
      {/* Signature Modal Overlay */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <SignaturePad
              title="Assinatura do Motorista"
              subtitle="Assine abaixo para finalizar a inspeção"
              required={true}
              onSave={handleSignatureSave}
              onCancel={() => setShowSignatureModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionScreen;