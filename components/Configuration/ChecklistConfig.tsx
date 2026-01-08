import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Image as ImageIcon,
  X,
  Check,
  Info,
  Frown,
  Meh,
  Smile,
  Trophy,
  ArrowLeft,
  Calendar,
  AlertCircle,
  MoreVertical,
  Lock,
  MessageSquare,
  ShieldAlert,
  Clipboard,
  Fingerprint,
  ChevronLeft,
  ChevronRight,
  Settings,
  Search,
  Filter,
  Trash2
} from 'lucide-react';

interface AccordionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, isOpen, onToggle, children }) => {
  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden mb-3 shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="font-bold text-slate-700">{title}</span>
        {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>
      {isOpen && (
        <div className="p-6 border-t border-slate-100 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

const Toggle: React.FC<{ label: string; description?: string; active?: boolean; badge?: string; onChange?: (val: boolean) => void }> = ({ label, description, active = false, badge, onChange }) => {
  const [isOn, setIsOn] = useState(active);
  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    if (onChange) onChange(newState);
  };

  return (
    <div className="flex items-start justify-between py-3 group">
      <div className="flex-1 pr-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">{label}</span>
          {badge && (
            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-black rounded uppercase">
              {badge}
            </span>
          )}
        </div>
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      </div>
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isOn ? 'bg-blue-900' : 'bg-slate-300'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
};

const TableToggle: React.FC<{ active?: boolean }> = ({ active = false }) => {
  const [isOn, setIsOn] = useState(active);
  return (
    <button
      onClick={() => setIsOn(!isOn)}
      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${isOn ? 'bg-blue-900' : 'bg-slate-300'}`}
    >
      <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${isOn ? 'translate-x-4' : 'translate-x-1'}`} />
    </button>
  );
};

const SearchAndFilter: React.FC<{ placeholder: string }> = ({ placeholder }) => (
  <div className="flex items-center gap-4 mb-6">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-white border border-slate-200 rounded-xl px-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
      />
    </div>
    <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-900 transition-colors">
      <Filter size={20} />
    </button>
  </div>
);

interface AreaItem {
  id: string;
  name: string;
  type: string;
  mandatoryAttachment: boolean;
  scaleType?: string;
  // Additional configurations
  config?: any;
}

const ChecklistConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState('DADOS CADASTRAIS');
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({ geral: true });

  // Structure states
  const [areas, setAreas] = useState<{ name: string; items: AreaItem[] }[]>([]);
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');

  // Item Form states
  const [openItemFormAreaIdx, setOpenItemFormAreaIdx] = useState<number | null>(null);
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null); // Track item index being edited
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState('Avaliativo');
  const [mandatoryAttachment, setMandatoryAttachment] = useState(false);
  const [scaleIdx, setScaleIdx] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null); // For item dropdown menu

  // Dynamic Type Configuration State
  const [registryOptions, setRegistryOptions] = useState<string[]>([]);
  const [numericOption, setNumericOption] = useState<string>('');
  const [selectionType, setSelectionType] = useState<'single' | 'multiple'>('single');
  const [selectionOptions, setSelectionOptions] = useState<string[]>([]);
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [newOptionText, setNewOptionText] = useState('');

  const scaleOptions = [
    {
      id: 'ns', label: 'N / S', render: () => (
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm text-red-600 font-black text-xl">N</div>
          <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm text-green-600 font-black text-xl">S</div>
        </div>
      )
    },
    {
      id: 'faces_2', label: 'Smile / Frown', render: () => (
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm text-red-500"><Frown size={24} /></div>
          <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm text-green-500"><Smile size={24} /></div>
        </div>
      )
    },
    {
      id: 'faces_3', label: 'Smile / Meh / Frown', render: () => (
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm text-red-500"><Frown size={24} /></div>
          <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm text-yellow-500"><Meh size={24} /></div>
          <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm text-green-500"><Smile size={24} /></div>
        </div>
      )
    }
  ];

  const resetItemForm = () => {
    setItemName('');
    setItemType('Avaliativo');
    setMandatoryAttachment(false);
    setScaleIdx(0);
    setRegistryOptions([]);
    setNumericOption('');
    setSelectionType('single');
    setSelectionOptions([]);
    setHintText('');
    setShowHint(false);
    setEditingItemIdx(null);
  };

  const openItemForm = (areaIdx: number, itemIdx?: number) => {
    setOpenItemFormAreaIdx(areaIdx);

    if (typeof itemIdx === 'number') {
      const item = areas[areaIdx].items[itemIdx];
      setEditingItemIdx(itemIdx);
      setItemName(item.name);
      setItemType(item.type);
      setMandatoryAttachment(item.mandatoryAttachment);

      // Restore configurations
      if (item.config) {
        setRegistryOptions(item.config.registryOptions || []);
        setNumericOption(item.config.numericOption || '');
        setSelectionType(item.config.selectionType || 'single');
        setSelectionOptions(item.config.selectionOptions || []);
        setHintText(item.config.hint || '');
        setShowHint(!!item.config.hint);
      }

      // Restore scale if applicable
      if (item.scaleType) {
        const foundIdx = scaleOptions.findIndex(s => s.id === item.scaleType);
        if (foundIdx !== -1) setScaleIdx(foundIdx);
      }
    } else {
      resetItemForm();
    }
  };

  const saveItem = () => {
    if (!itemName || openItemFormAreaIdx === null) return;

    const newItem: AreaItem = {
      id: editingItemIdx !== null ? areas[openItemFormAreaIdx].items[editingItemIdx].id : Math.random().toString(36).substr(2, 9),
      name: itemName,
      type: itemType,
      mandatoryAttachment,
      scaleType: itemType === 'Avaliativo' ? scaleOptions[scaleIdx].id : undefined,
      config: {
        registryOptions,
        numericOption,
        selectionType,
        selectionOptions,
        hint: hintText
      }
    };

    const newAreas = [...areas];
    if (editingItemIdx !== null) {
      newAreas[openItemFormAreaIdx].items[editingItemIdx] = newItem;
    } else {
      newAreas[openItemFormAreaIdx].items.push(newItem);
    }

    setAreas(newAreas);
    setOpenItemFormAreaIdx(null);
    resetItemForm();
  };

  const deleteItem = (areaIdx: number, itemIdx: number) => {
    const newAreas = [...areas];
    newAreas[areaIdx].items.splice(itemIdx, 1);
    setAreas(newAreas);
    setActiveMenuId(null);
  };

  const addOption = () => {
    if (newOptionText.trim()) {
      setSelectionOptions([...selectionOptions, newOptionText]);
      setNewOptionText('');
      setIsAddingOption(false);
    }
  };

  const togglePanel = (panel: string) => {
    setOpenPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
  };

  const tabs = ['DADOS CADASTRAIS', 'ESTRUTURA', 'TIPOS DE VEÍCULOS', 'USUÁRIOS'];

  const addArea = () => {
    if (newAreaName.trim()) {
      setAreas([...areas, { name: newAreaName, items: [] }]);
      setNewAreaName('');
      setIsAddingArea(false);
    }
  };

  const renderDadosCadastrais = () => (
    <div className="max-w-7xl w-full mx-auto p-8 space-y-4">
      <Accordion title="Geral" isOpen={!!openPanels.geral} onToggle={() => togglePanel('geral')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Tipo de checklist*</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-900">
                <option>Checklist</option>
                <option>Inspeção Técnica</option>
              </select>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase">Nome*</label>
                <span className="text-[10px] text-slate-400 font-bold">18 / 255</span>
              </div>
              <input type="text" defaultValue="Novo Checklist (1)" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-900" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Assunto</label>
              <input type="text" placeholder="Ex: Manutenção Mensal" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
                <span className="text-[10px] text-slate-400 font-bold">0 / 5000</span>
              </div>
              <textarea rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100"></textarea>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Anexos</label>
          <button className="w-12 h-12 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:border-blue-900 hover:text-blue-900 transition-all">
            <Plus size={24} />
          </button>
        </div>
      </Accordion>

      <Accordion title="Relatórios" isOpen={!!openPanels.reports} onToggle={() => togglePanel('reports')}>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4 w-full">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                Imagem de cabeçalho do PDF
                <span className="text-[9px] bg-blue-50 text-blue-900 px-1.5 py-0.5 rounded font-black">PDF OTIMIZADO</span>
              </label>
              <div className="flex items-center gap-6 p-6 border border-slate-100 rounded-xl bg-slate-50/50">
                <div className="h-16 w-48 bg-white border border-slate-200 rounded flex items-center justify-center overflow-hidden">
                  <div className="flex items-center gap-2 font-black text-green-600 text-lg">
                    <Check size={24} className="stroke-[3]" />
                    checklistfácil
                  </div>
                </div>
                <button className="text-xs font-black text-blue-900 uppercase hover:underline">Alterar Imagem</button>
              </div>
            </div>
            <div className="flex-1 w-full">
              <Toggle label="Personalizar informações do PDF" active={false} />
              <div className="mt-4 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Título do relatório</label>
                <input type="text" placeholder="Relatório de Inspeção" disabled className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </Accordion>
      <Accordion title="Preenchimento" isOpen={!!openPanels.fill} onToggle={() => togglePanel('fill')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
          <Toggle label="Aplicar checklist somente pelo aplicativo" />
          <Toggle label="Permitir anexar arquivos da memória do dispositivo" active={true} />
          <Toggle label="Responder itens em massa" active={true} />
          <Toggle label="Exibir resultado parcial" active={true} />
          <Toggle label="Campos Nome e Cargo da assinatura são obrigatórios" />
        </div>
      </Accordion>

      <Accordion title="Pós-conclusão" isOpen={!!openPanels.post} onToggle={() => togglePanel('post')}>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            <Toggle label="Compartilhar checklist por e-mail" active={true} />
            <Toggle label="Assinatura" active={true} />
          </div>
        </div>
      </Accordion>
      <Accordion title="Cerca Digital" isOpen={!!openPanels.geo} onToggle={() => togglePanel('geo')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
          <Toggle label="Bloquear início fora da unidade" />
          <Toggle label="Bloquear conclusão fora da unidade" />
        </div>
      </Accordion>

    </div>
  );

  const renderEstrutura = () => (
    <div className="max-w-7xl w-full mx-auto p-8 space-y-6">
      {areas.length === 0 && !isAddingArea ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-6 shadow-sm animate-in zoom-in-95 duration-300">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800">Estrutura</h3>
            <p className="text-sm text-slate-500">Nesta aba você consegue construir seu checklist (áreas, subáreas e itens). Escolha abaixo de qual forma deseja iniciar.</p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setIsAddingArea(true)}
              className="bg-blue-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg active:scale-95"
            >
              Adicionar Área
            </button>
            <button className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
              Importar itens via planilha
            </button>
            <button className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
              Importar de outro checklist
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {areas.map((area, areaIdx) => (
            <div key={areaIdx} className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden" onClick={() => setActiveMenuId(null)}>
              {/* Area Header */}
              <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ChevronUp size={18} className="cursor-pointer" />
                  <span className="font-bold text-sm tracking-tight">Área {areaIdx + 1}: {area.name}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openItemForm(areaIdx);
                      }}
                      className="hover:text-blue-200 transition-colors"
                    >
                      Novo Item
                    </button>
                    <button className="hover:text-blue-200 transition-colors">Nova Subárea</button>
                  </div>
                  <div className="h-6 w-px bg-blue-800"></div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold opacity-60">Tipo de área</span>
                    <select className="bg-blue-800 text-white text-[10px] font-bold px-2 py-1 rounded outline-none border-none cursor-pointer">
                      <option>Padrão</option>
                    </select>
                    <MoreVertical size={16} className="cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* Area Body: Item Form or List */}
              {openItemFormAreaIdx === areaIdx ? (
                <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                  <div className="border-2 border-blue-900 rounded-2xl bg-white p-8 space-y-6 shadow-xl relative animate-in zoom-in-95 duration-200">
                    <button
                      onClick={() => setOpenItemFormAreaIdx(null)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X size={20} />
                    </button>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Item*</label>
                        <input value={itemName} onChange={(e) => setItemName(e.target.value)} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-900" />
                        <div className="flex justify-end">
                          <span className="text-[10px] text-slate-400 font-bold">{itemName.length} / 1000</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
                          <select
                            value={itemType}
                            onChange={(e) => setItemType(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-900"
                          >
                            <option value="Avaliativo">Avaliativo</option>
                            <option value="Texto">Texto</option>
                            <option value="Data">Data</option>
                            <option value="Cadastro">Cadastro</option>
                            <option value="Numérico">Numérico</option>
                            <option value="Lista de Seleção">Lista de Seleção</option>
                          </select>
                        </div>
                      </div>

                      {/* Dynamic Fields Configuration */}
                      {itemType === 'Avaliativo' && (
                        <div className="space-y-4 pt-2">
                          <label className="text-xs text-slate-500">Configure sua escala avaliativa e sua obrigatoriedade</label>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => setScaleIdx((prev) => (prev > 0 ? prev - 1 : scaleOptions.length - 1))}
                              className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <div className="min-w-[120px] flex justify-center">
                              {scaleOptions[scaleIdx].render()}
                            </div>
                            <button
                              onClick={() => setScaleIdx((prev) => (prev < scaleOptions.length - 1 ? prev + 1 : 0))}
                              className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                          <div className="flex justify-center gap-2">
                            {scaleOptions.map((_, idx) => (
                              <div key={idx} className={`w-2 h-2 rounded-full ${idx === scaleIdx ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                            ))}
                          </div>
                        </div>
                      )}

                      {itemType === 'Texto' && (
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Pré-visualização da resposta</label>
                          <input type="text" disabled placeholder="Texto da resposta..." className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-400" />
                        </div>
                      )}

                      {itemType === 'Data' && (
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Pré-visualização da resposta</label>
                          <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-2.5 text-slate-400" />
                            <input type="text" disabled placeholder="DD/MM/AAAA" className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-400" />
                          </div>
                        </div>
                      )}

                      {itemType === 'Cadastro' && (
                        <div className="space-y-4">
                          <label className="text-xs font-bold text-slate-500 uppercase">Selecione o tipo de cadastro</label>
                          <div className="grid grid-cols-2 gap-2">
                            {['E-mail', 'Estado, UF e Cidade', 'CEP', 'Telefone', 'CNPJ', 'CPF', 'Placa do Automóvel', 'Placa Mercosul'].map(opt => (
                              <label key={opt} className="flex items-center gap-2 text-sm text-slate-600 p-2 bg-slate-50 rounded cursor-pointer hover:bg-slate-100">
                                <input
                                  type="radio"
                                  name="registry_type"
                                  checked={registryOptions.includes(opt)}
                                  onChange={() => setRegistryOptions([opt])}
                                  className="w-4 h-4 text-blue-900 focus:ring-blue-900"
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {itemType === 'Numérico' && (
                        <div className="space-y-4">
                          <label className="text-xs font-bold text-slate-500 uppercase">Selecione o formato numérico</label>
                          <div className="flex gap-4">
                            {['Quantidade', 'Decimal', 'Porcentagem'].map(opt => (
                              <label key={opt} className="flex items-center gap-2 text-sm text-slate-600 p-2 bg-slate-50 rounded cursor-pointer hover:bg-slate-100">
                                <input
                                  type="radio"
                                  name="numeric_type"
                                  checked={numericOption === opt}
                                  onChange={() => setNumericOption(opt)}
                                  className="w-4 h-4 text-blue-900 focus:ring-blue-900"
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                          {numericOption && (
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mt-2">
                              <input type="text" disabled placeholder={numericOption === 'Porcentagem' ? '0%' : '0'} className="w-32 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-400" />
                            </div>
                          )}
                        </div>
                      )}

                      {itemType === 'Lista de Seleção' && (
                        <div className="space-y-4">
                          <div className="flex gap-6">
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                              <input type="radio" name="sel_type" checked={selectionType === 'single'} onChange={() => setSelectionType('single')} className="w-4 h-4 text-blue-900 focus:ring-blue-900" />
                              Seleção Única
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                              <input type="radio" name="sel_type" checked={selectionType === 'multiple'} onChange={() => setSelectionType('multiple')} className="w-4 h-4 text-blue-900 focus:ring-blue-900" />
                              Seleção Múltipla
                            </label>
                          </div>

                          <div className="space-y-2">
                            {selectionOptions.map((opt, idx) => (
                              <div key={idx} className="flex items-center gap-2 animate-in slide-in-from-left-2">
                                <div className={`w-4 h-4 rounded border border-slate-300 ${selectionType === 'single' ? 'rounded-full' : 'rounded'}`}></div>
                                <span className="text-sm text-slate-700 bg-slate-50 px-3 py-1.5 rounded flex-1 border border-slate-100">{opt}</span>
                                <button onClick={() => setSelectionOptions(prev => prev.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                              </div>
                            ))}

                            {isAddingOption ? (
                              <div className="flex items-center gap-2">
                                <input
                                  autoFocus
                                  type="text"
                                  value={newOptionText}
                                  onChange={(e) => setNewOptionText(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && addOption()}
                                  placeholder="Digite a opção e pressione Enter"
                                  className="flex-1 bg-white border border-blue-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-900"
                                />
                                <button onClick={addOption} className="p-1.5 bg-blue-900 text-white rounded hover:bg-blue-800"><Check size={14} /></button>
                                <button onClick={() => setIsAddingOption(false)} className="p-1.5 text-slate-400 hover:text-slate-600"><X size={14} /></button>
                              </div>
                            ) : (
                              <button onClick={() => setIsAddingOption(true)} className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1">
                                <Plus size={14} /> Adicionar opção
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2 pt-2">
                        <label className="text-xs font-bold text-slate-800">Selecione os complementos desejados.</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setMandatoryAttachment(!mandatoryAttachment)}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${mandatoryAttachment ? 'bg-blue-100 text-blue-900 border-blue-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                          >
                            <Clipboard size={14} />
                            {mandatoryAttachment ? 'Obrigar Anexo' : 'Anexos Opcionais'}
                          </button>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => setShowHint(!showHint)}
                          className="w-full text-left px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 flex justify-between items-center hover:bg-slate-100 transition-colors"
                        >
                          Dica do item
                          <ChevronDown size={14} className={`transition-transform ${showHint ? 'rotate-180' : ''}`} />
                        </button>
                        {showHint && (
                          <textarea
                            value={hintText}
                            onChange={(e) => setHintText(e.target.value)}
                            placeholder="Descreva uma dica para o preenchimento deste item..."
                            className="w-full mt-2 bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                            rows={3}
                          />
                        )}
                      </div>

                      <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                        <button onClick={() => setOpenItemFormAreaIdx(null)} className="text-xs font-black uppercase text-blue-900">Cancelar</button>
                        <button onClick={saveItem} className="bg-blue-900 text-white px-6 py-2 rounded-lg text-xs font-black uppercase shadow-md hover:bg-blue-800 transition-all">Salvar Item</button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  {area.items && area.items.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {area.items.map((item, idx) => (
                        <div
                          key={item.id}
                          onClick={() => openItemForm(areaIdx, idx)}
                          className="px-8 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">{item.name}</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{item.type}</span>
                          </div>
                          <div className="flex items-center gap-4 relative">
                            {item.config?.selectionType && <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase">{item.config.selectionType === 'single' ? 'Seleção Única' : 'Seleção Múltipla'}</span>}
                            <div className="flex gap-2 relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === item.id ? null : item.id);
                                }}
                                className="p-1.5 text-slate-400 hover:text-blue-900 transition-colors"
                              >
                                <MoreVertical size={16} />
                              </button>

                              {activeMenuId === item.id && (
                                <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-xl py-2 w-32 z-10 animate-in fade-in zoom-in-95 duration-200">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteItem(areaIdx, idx);
                                    }}
                                    className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <Trash2 size={14} /> Excluir
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <p className="text-slate-400 text-sm">Nenhum item cadastrado nesta área.</p>
                      <p className="text-xs text-slate-300 mt-1">Utilize o botão "Novo Item" acima para adicionar.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {isAddingArea && (
            <div className="border-2 border-blue-900 rounded-2xl bg-white p-8 space-y-6 shadow-xl">
              <input
                type="text"
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
                placeholder="Nome da área"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
              />
              <div className="flex justify-end gap-4">
                <button onClick={() => setIsAddingArea(false)} className="text-xs font-black uppercase text-blue-900">Cancelar</button>
                <button onClick={addArea} className="bg-blue-900 text-white px-6 py-2 rounded-lg text-xs font-black uppercase">Salvar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderDepartamentos = () => (
    <div className="max-w-7xl w-full mx-auto p-8 space-y-4 animate-in fade-in duration-300">
      <SearchAndFilter placeholder="Buscar departamento..." />
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <tr>
              <th className="px-6 py-4 flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                Departamento <ChevronDown size={14} className="mt-0.5" />
              </th>
              <th className="px-6 py-4 text-right">Vincular</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {['departamento1', 'departamento2', 'departamento3'].map((dept, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                <td className="px-6 py-4 text-sm font-medium text-slate-700">{dept}</td>
                <td className="px-6 py-4 text-right">
                  <TableToggle active={idx === 0} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTiposUnidade = () => (
    <div className="max-w-7xl w-full mx-auto p-8 space-y-4 animate-in fade-in duration-300">
      <SearchAndFilter placeholder="Buscar tipo de veículo..." />
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <tr>
              <th className="px-6 py-4 flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                Tipo de Veículo <ChevronDown size={14} className="mt-0.5" />
              </th>
              <th className="px-6 py-4 text-right">Vincular</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              { id: '1', name: 'Cavalo Mecânico' },
              { id: '2', name: 'Carreta Baú' },
              { id: '3', name: 'Carreta Sider' },
              { id: '4', name: 'Bitrem' },
              { id: '5', name: 'Rodotrem' },
              { id: '6', name: 'VUC' },
              { id: '7', name: 'Toco' },
              { id: '8', name: 'Truck' },
            ].map((type) => (
              <tr key={type.id} className="bg-white hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-700">{type.name}</td>
                <td className="px-6 py-4 text-right">
                  <TableToggle active={['1', '2', '3'].includes(type.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUsuarios = () => (
    <div className="max-w-7xl w-full mx-auto p-8 space-y-4 animate-in fade-in duration-300">
      <SearchAndFilter placeholder="Buscar usuário por nome..." />
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <tr>
              <th className="px-6 py-4 flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                Usuário <ChevronDown size={14} className="mt-0.5" />
              </th>
              <th className="px-6 py-4 text-center">Aplica</th>
              <th className="px-6 py-4 text-center">Relatório</th>
              <th className="px-6 py-4 text-center">E-mail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              { id: '1', name: 'Admin', type: 'Administrador' },
              { id: '2', name: 'Arthur Matos Sousa', type: 'GM Transportadora | Logística' },
              { id: '3', name: 'Carolina Almeida', type: 'GM | Recursos Humanos' },
              { id: '4', name: 'Diego Rodrigues', type: 'GM Transportadora | Manutenção' },
              { id: '5', name: 'Fagner Frazão', type: 'GM | TI' },
              { id: '6', name: 'Fernando Rolim', type: 'GM Transportadora | Ger. Logística' },
              { id: '7', name: 'Jeniffer dos Santos Luz', type: 'GM Transportadora | Téc. Segurança' },
              { id: '8', name: 'Laurenise Araujo Ferreira', type: 'GM Transportadora | Téc. Segurança' },
            ].map((user) => (
              <tr key={user.id} className="bg-white hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700">{user.name}</span>
                    <span className="text-xs text-slate-400">{user.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center"><TableToggle active={['1', '2'].includes(user.id)} /></td>
                <td className="px-6 py-4 text-center"><TableToggle active={user.id === '1'} /></td>
                <td className="px-6 py-4 text-center"><TableToggle active={false} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-full bg-slate-50 pb-24 animate-in fade-in duration-500">
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium">
          <span>Checklist</span>
          <ChevronDown size={12} className="-rotate-90" />
          <span className="text-slate-600">Configurar Checklist</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Configurar Checklist</h1>
        </div>
      </div>

      <div className="bg-white border-b border-slate-200 px-8 flex gap-8">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === tab ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {activeTab === 'DADOS CADASTRAIS' && renderDadosCadastrais()}
        {activeTab === 'ESTRUTURA' && renderEstrutura()}
        {activeTab === 'TIPOS DE VEÍCULOS' && renderTiposUnidade()}
        {activeTab === 'USUÁRIOS' && renderUsuarios()}
        {!['DADOS CADASTRAIS', 'ESTRUTURA', 'TIPOS DE VEÍCULOS', 'USUÁRIOS'].includes(activeTab) && (
          <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Módulo em Desenvolvimento</div>
        )}
      </div>

      <footer className="fixed bottom-0 left-72 right-0 h-16 bg-white border-t border-slate-200 px-8 flex items-center justify-between z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ativo</span>
          <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-blue-900">
            <span className="h-3 w-3 translate-x-6 rounded-full bg-white flex items-center justify-center">
              <Check size={8} className="text-blue-900 stroke-[4]" />
            </span>
          </button>
        </div>
        <button className="px-10 py-2.5 bg-blue-900 text-white rounded-lg font-black text-xs uppercase tracking-wider hover:bg-blue-800 shadow-md transition-all active:scale-95">
          Salvar
        </button>
      </footer>
    </div>
  );
};

export default ChecklistConfig;
