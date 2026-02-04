import React, { useState, useEffect } from 'react';
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
  Trash2,
  Users,
  Clock,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Image,
  Minus,
  GripVertical,
  AlertOctagon,
  Share2,
  MapPin,
  Save,
  Layout,
  Database,
  FileText,
  Copy,
  History,
  Eye
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  ChecklistTemplate,
  ChecklistArea,
  ChecklistItem,
  ChecklistSubArea,
  ItemType,
  OperationType as VehicleType
} from '../../../types';
import ChecklistVehicleTypes from './ChecklistVehicleTypes';
import ChecklistUsers from './ChecklistUsers';
import { useAuth } from '../../hooks/useAuth';

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

const Toggle: React.FC<{ label: string; description?: string; active?: boolean; badge?: string; disabled?: boolean; onChange?: (val: boolean) => void }> = ({ label, description, active = false, badge, disabled = false, onChange }) => {
  const [isOn, setIsOn] = useState(active);

  // Sync with external state changes
  useEffect(() => {
    setIsOn(active);
  }, [active]);

  const handleToggle = () => {
    if (disabled) return;
    const newState = !isOn;
    setIsOn(newState);
    if (onChange) onChange(newState);
  };

  return (
    <div className={`flex items-start justify-between py-3 group ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex-1 pr-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">{label}</span>
          {badge && (
            <span className={`px-1.5 py-0.5 text-[8px] font-black rounded uppercase ${badge === 'EM BREVE' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
              {badge}
            </span>
          )}
        </div>
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      </div>
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isOn ? 'bg-blue-900' : 'bg-slate-300'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
};

const TableToggle: React.FC<{ active: boolean; onChange: (val: boolean) => void }> = ({ active, onChange }) => {
  return (
    <button
      onClick={() => onChange(!active)}
      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${active ? 'bg-blue-900' : 'bg-slate-300'}`}
    >
      <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${active ? 'translate-x-4' : 'translate-x-1'}`} />
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
  config?: {
    registryOptions?: string[];
    numericOption?: string;
    selectionType?: 'single' | 'multiple';
    selectionOptions?: string[];
    hint?: string;
    allow_photo?: boolean;
    allow_attachment?: boolean;
    options?: string[]; // Legacy fallback
    input_style?: 'default' | 'thumbs' | 'smile_3' | 'smile_5' | 'happy_sad' | 'n_s';
    require_photo_on?: string[];
    photo_required_options?: string[];
  };
}

interface SubArea {
  id: string;
  name: string;
  items: AreaItem[];
}

interface Area {
  id: string; // Add ID
  name: string;
  items: AreaItem[];
  subAreas: SubArea[];
}

interface ChecklistConfigProps {
  initialTemplate?: ChecklistTemplate | null;
  onBack: () => void;
}

const ChecklistConfig: React.FC<ChecklistConfigProps> = ({ initialTemplate, onBack }) => {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('DADOS CADASTRAIS');
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({ geral: true });

  // Checklist Identity & Metadata
  const [checklistId, setChecklistId] = useState<string>(`chk_${Date.now()}`);
  const [name, setName] = useState('Novo Checklist (1)');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  // Settings
  const [settings, setSettings] = useState({
    app_only: false,
    allow_gallery: true,
    bulk_answer: true,
    partial_result: true,
    mandatory_signature: true,
    share_email: true,
    geo_fence_start: false,
    geo_fence_end: false,
    show_item_timestamps: false,
    scoring_enabled: false,
    min_score_to_pass: 70,
    require_driver_signature: false, // Signature at completion
    require_analyst_signature: false // Signature when analyzing
  });

  // Validation settings
  const [validateDocs, setValidateDocs] = useState(false);
  const [validateUserDocs, setValidateUserDocs] = useState(false);
  const [validateVehicleDocs, setValidateVehicleDocs] = useState(false);
  const [validateTrailerDocs, setValidateTrailerDocs] = useState(false);

  // Versioning State
  const [version, setVersion] = useState(1);
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('published');
  const [groupId, setGroupId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [loadingLock, setLoadingLock] = useState(false);

  // Check valid usage to lock editing
  useEffect(() => {
    let isActive = true;

    const checkLock = async () => {
      if (!checklistId) return;

      setLoadingLock(true);
      const { count } = await supabase
        .from('checklist_inspections')
        .select('*', { count: 'exact', head: true })
        .eq('checklist_template_id', checklistId);

      if (isActive) {
        setIsLocked((count || 0) > 0);
        setLoadingLock(false);
      }
    };
    checkLock();

    return () => {
      isActive = false;
    };
  }, [checklistId]);

  // PDF Customization
  const [pdfHeaderImage, setPdfHeaderImage] = useState<string>('');
  const [pdfTitle, setPdfTitle] = useState<string>('');

  // Selections
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Analysis Workflow (Fluxo de Análise)
  const [requiresAnalysis, setRequiresAnalysis] = useState(false);
  const [analysisApprovalsCount, setAnalysisApprovalsCount] = useState<1 | 2>(1);
  const [analysisFirstApprover, setAnalysisFirstApprover] = useState<string | null>(null);
  const [analysisSecondApprover, setAnalysisSecondApprover] = useState<string | null>(null);
  const [analysisHasTimer, setAnalysisHasTimer] = useState(false);
  const [analysisTimerMinutes, setAnalysisTimerMinutes] = useState<number | null>(null);
  const [availableApprovers, setAvailableApprovers] = useState<any[]>([]);
  const [showApproverModal, setShowApproverModal] = useState<'first' | 'second' | null>(null);

  // Structure states
  const [areas, setAreas] = useState<Area[]>([]);
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');

  // SubArea states
  const [addingSubAreaTo, setAddingSubAreaTo] = useState<number | null>(null);
  const [newSubAreaName, setNewSubAreaName] = useState('');

  // Item Form states
  const [openItemFormLocation, setOpenItemFormLocation] = useState<{ areaIdx: number; subAreaIdx?: number } | null>(null);
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null); // Track item index being edited
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState('Avaliativo');
  const [mandatoryAttachment, setMandatoryAttachment] = useState(false);
  const [scaleIdx, setScaleIdx] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState('');
  const [activeAreaMenuIdx, setActiveAreaMenuIdx] = useState<number | null>(null); // State for area dropdown menus
  const [activeSubAreaMenuIdx, setActiveSubAreaMenuIdx] = useState<{ areaIdx: number, subAreaIdx: number } | null>(null); // State for subarea dropdown menus
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null); // For item dropdown menu

  // Dynamic Type Configuration State
  const [registryOptions, setRegistryOptions] = useState<string[]>([]);
  const [numericOption, setNumericOption] = useState<string>('');
  const [selectionType, setSelectionType] = useState<'single' | 'multiple'>('single');
  const [selectionOptions, setSelectionOptions] = useState<string[]>([]);
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [newOptionText, setNewOptionText] = useState('');

  // Initialize state from initialTemplate if provided
  useEffect(() => {
    if (initialTemplate) {
      setChecklistId(initialTemplate.id);
      setName(initialTemplate.name);
      setSubject(initialTemplate.subject);
      setDescription(initialTemplate.description);
      setSettings(prev => ({ ...prev, ...initialTemplate.settings }));
      setSelectedVehicleTypes(initialTemplate.target_vehicle_types as any);
      setSelectedUsers(initialTemplate.assigned_user_ids);

      // Versioning
      setVersion((initialTemplate as any).version || 1);
      setStatus((initialTemplate as any).status || 'published');
      setGroupId((initialTemplate as any).group_id || initialTemplate.id);

      // Load PDF customization fields
      setPdfHeaderImage((initialTemplate as any).pdf_header_image || '');
      setPdfTitle((initialTemplate as any).pdf_title || '');

      // Load Analysis Workflow fields
      setRequiresAnalysis((initialTemplate as any).requires_analysis || false);
      setAnalysisApprovalsCount((initialTemplate as any).analysis_approvals_count || 1);
      setAnalysisFirstApprover((initialTemplate as any).analysis_first_approver || null);
      setAnalysisSecondApprover((initialTemplate as any).analysis_second_approver || null);
      setAnalysisHasTimer((initialTemplate as any).analysis_has_timer || false);
      setAnalysisTimerMinutes((initialTemplate as any).analysis_timer_minutes || null);

      // Load Validation settings
      setValidateDocs(initialTemplate.validate_docs || false);
      setValidateUserDocs(initialTemplate.validate_user_docs || false);
      setValidateVehicleDocs(initialTemplate.validate_vehicle_docs || false);
      setValidateTrailerDocs(initialTemplate.validate_trailer_docs || false);

      if (initialTemplate.structure?.areas) {
        // Map DB structure to local state structure (snake_case -> camelCase)
        const mappedAreas = initialTemplate.structure.areas.map((dbArea: any) => ({
          id: dbArea.id,
          name: dbArea.name,
          items: (dbArea.items || []).map((dbItem: any) => ({
            id: dbItem.id,
            name: dbItem.name,
            type: dbItem.type,
            mandatoryAttachment: dbItem.mandatory_attachment || false,
            scaleType: dbItem.config?.scale_type || undefined,
            config: {
              registryOptions: dbItem.config?.registry_type ? [dbItem.config.registry_type] : [],
              numericOption: dbItem.config?.numeric_option || '',
              selectionType: dbItem.config?.selection_type || 'single',
              selectionOptions: dbItem.config?.selection_options || dbItem.config?.options || [],
              hint: dbItem.config?.hint || '',
              allow_photo: dbItem.config?.allow_photo || dbItem.mandatory_attachment || false,
              allow_attachment: dbItem.config?.allow_attachment || dbItem.mandatory_attachment || false,
              input_style: dbItem.config?.input_style || 'default',
              require_photo_on: dbItem.config?.require_photo_on || [],
              photo_required_options: dbItem.config?.photo_required_options || []
            }
          })),
          subAreas: (dbArea.sub_areas || []).map((dbSub: any) => ({
            id: dbSub.id,
            name: dbSub.name,
            items: (dbSub.items || []).map((dbItem: any) => ({
              id: dbItem.id,
              name: dbItem.name,
              type: dbItem.type,
              mandatoryAttachment: dbItem.mandatory_attachment || false,
              scaleType: dbItem.config?.scale_type || undefined,
              config: {
                registryOptions: dbItem.config?.registry_type ? [dbItem.config.registry_type] : [],
                numericOption: dbItem.config?.numeric_option || '',
                selectionType: dbItem.config?.selection_type || 'single',
                selectionOptions: dbItem.config?.selection_options || dbItem.config?.options || [],
                hint: dbItem.config?.hint || '',
                allow_photo: dbItem.config?.allow_photo || dbItem.mandatory_attachment || false,
                allow_attachment: dbItem.config?.allow_attachment || dbItem.mandatory_attachment || false,
                input_style: dbItem.config?.input_style || 'default',
                require_photo_on: dbItem.config?.require_photo_on || [],
                photo_required_options: dbItem.config?.photo_required_options || []
              }
            }))
          }))
        }));
        setAreas(mappedAreas);
      }
    } else {
      // Setup for a new template
      setChecklistId(`chk_${Date.now()}`);
      setName('Novo Checklist (1)');
      setSubject('');
      setDescription('');
      setSettings({
        app_only: false,
        allow_gallery: true,
        bulk_answer: true,
        partial_result: true,
        mandatory_signature: true,
        share_email: true,
        geo_fence_start: false,
        geo_fence_end: false,
        show_item_timestamps: false,
        scoring_enabled: false,
        min_score_to_pass: 70,
        require_driver_signature: false,
        require_analyst_signature: false
      });
      setSelectedVehicleTypes([]);
      setSelectedUsers([]);
      setAreas([]);
      setPdfHeaderImage('');
      setPdfTitle('');
      // Reset analysis fields
      setRequiresAnalysis(false);
      setAnalysisApprovalsCount(1);
      setAnalysisFirstApprover(null);
      setAnalysisSecondApprover(null);
      setAnalysisHasTimer(false);
      setAnalysisTimerMinutes(null);
    }
    setActiveTab('DADOS CADASTRAIS');
  }, [initialTemplate]);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setCompanyId(data.company_id);
        });
    }
  }, [user]);

  // Fetch available approvers (users with approval permission or all managers)
  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .in('role', ['GESTOR', 'ADMIN_MASTER'])
          .order('full_name');

        if (error) throw error;
        setAvailableApprovers(data || []);
      } catch (err) {
        console.error('Erro ao carregar aprovadores:', err);
      }
    };
    fetchApprovers();
  }, []);






  const deleteArea = (idx: number) => {
    const newAreas = [...areas];
    newAreas.splice(idx, 1);
    setAreas(newAreas);
    setActiveAreaMenuIdx(null);
  };

  const performSave = async (silent = false): Promise<string | null> => {
    try {
      if (!silent) {
        // Validation only if not silent? Or always?
        // Let's validate name at least
        if (!name.trim()) {
          alert('O nome do checklist é obrigatório.');
          return null;
        }
      }

      // Always send the ID, even if temp (assuming DB accepts text or we rely on client-gen ID)
      const idToSend = checklistId;

      const checklistData: Partial<ChecklistTemplate> = {
        id: idToSend,
        name: name,
        subject: subject,
        description: description,
        settings: {
          ...settings
        },
        structure: {
          areas: areas?.map(area => ({
            id: area.id,
            name: area.name,
            type: 'Padrão',
            items: area.items?.map(item => ({
              id: item.id,
              name: item.name,
              type: item.type as ItemType,
              mandatory_attachment: item.mandatoryAttachment,
              config: {
                hint: item.config?.hint,
                scale_type: item.scaleType as any,
                numeric_option: item.config?.numericOption,
                registry_type: item.config?.registryOptions?.length ? item.config.registryOptions[0] : undefined,
                selection_type: item.config?.selectionType,
                selection_options: item.config?.selectionOptions || (item.config as any)?.options || [],
                options: item.config?.selectionOptions || (item.config as any)?.options || [],
                allow_photo: item.mandatoryAttachment,
                allow_attachment: item.mandatoryAttachment,
                input_style: (item.config as any)?.input_style,
                require_photo_on: (item.config as any)?.require_photo_on,
                photo_required_options: (item.config as any)?.photo_required_options
              }
            })) || [],
            sub_areas: area.subAreas?.map(sub => ({
              id: sub.id,
              name: sub.name,
              items: sub.items?.map(sitem => ({
                id: sitem.id,
                name: sitem.name,
                type: sitem.type as ItemType,
                mandatory_attachment: sitem.mandatoryAttachment,
                config: {
                  hint: sitem.config?.hint,
                  scale_type: sitem.scaleType as any,
                  numeric_option: sitem.config?.numericOption,
                  registry_type: sitem.config?.registryOptions?.length ? sitem.config.registryOptions[0] : undefined,
                  selection_type: sitem.config?.selectionType,
                  selection_options: sitem.config?.selectionOptions || (sitem.config as any)?.options || [],
                  options: sitem.config?.selectionOptions || (sitem.config as any)?.options || [],
                  allow_photo: sitem.mandatoryAttachment,
                  allow_attachment: sitem.mandatoryAttachment,
                  input_style: (sitem.config as any)?.input_style,
                  require_photo_on: (sitem.config as any)?.require_photo_on,
                  photo_required_options: (sitem.config as any)?.photo_required_options
                }
              })) || []
            })) || []
          })) || []
        },
        target_vehicle_types: selectedVehicleTypes as any,
        assigned_user_ids: selectedUsers,
        // PDF fields commented out until database migration is applied
        // pdf_header_image: pdfHeaderImage || null,
        // pdf_title: pdfTitle || null,
        // Analysis Workflow fields
        requires_analysis: requiresAnalysis,
        analysis_approvals_count: analysisApprovalsCount,
        analysis_first_approver: analysisFirstApprover,
        analysis_second_approver: analysisApprovalsCount === 2 ? analysisSecondApprover : null,
        analysis_has_timer: analysisHasTimer,
        analysis_timer_minutes: analysisHasTimer ? analysisTimerMinutes : null,
        // Scoring Fields (Extract from settings or state)
        scoring_enabled: settings.scoring_enabled,
        min_score_to_pass: settings.min_score_to_pass,

        // Validation Settings
        validate_docs: validateDocs,
        validate_user_docs: validateUserDocs,
        validate_vehicle_docs: validateVehicleDocs,
        validate_trailer_docs: validateTrailerDocs,

        updated_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
        // @ts-ignore
        company_id: companyId,
        // Versioning Columns
        version: version || 1,
        status: status || 'published',
        group_id: groupId || checklistId
      };

      console.log('performSave: Saving template to DB:', JSON.stringify(checklistData.structure, null, 2)); // DEBUG

      const { data, error } = await supabase
        .from('checklist_templates')
        .upsert(checklistData)
        .select()
        .single();

      if (error) throw error;

      let savedId = checklistId;
      if (data) {
        savedId = data.id;
        setChecklistId(data.id);
        // If it was temp, we are no longer in creation mode technically, or we preserve it.
      }

      if (!silent) {
        alert('Checklist salvo com sucesso!');
        onBack();
      }
      console.log('[ChecklistConfig] performSave returning savedId:', savedId);
      return savedId; // Return the real ID
    } catch (error: any) {
      console.error('Erro ao salvar checklist:', error.message);
      if (!silent) alert('Erro ao salvar: ' + error.message);
      return null;
    }
  };



  const handleSave = () => performSave(false);

  const handleCreateVersion = async () => {
    if (!confirm(`Deseja criar a versão ${version + 1} deste checklist?`)) return;

    try {
      const newId = `chk_${Date.now()}`; // Temporary ID, let DB/Upsert handle if simpler
      // Actually performSave uses upsert. 
      // We need to Force Insert as new row.

      // We'll manually construct the data and insert
      const newData = {
        // ... (Common data construction done in performSave, but we need to duplicate logic or refactor)
        // Refactoring performSave to return data object would be ideal, but let's just do it here for safety
        id: newId, // explicit ID
        name: name,
        subject: subject,
        description: description,
        settings: settings,
        structure: {
          areas: areas?.map(area => ({
            id: area.id,
            name: area.name,
            type: 'Padrão',
            items: area.items?.map(item => ({
              id: item.id,
              name: item.name,
              type: item.type as ItemType,
              mandatory_attachment: item.mandatoryAttachment,
              config: {
                hint: item.config?.hint,
                scale_type: item.scaleType as any,
                numeric_option: item.config?.numericOption,
                registry_type: item.config?.registryOptions?.length ? item.config.registryOptions[0] : undefined,
                selection_type: item.config?.selectionType,
                selection_options: item.config?.selectionOptions || (item.config as any)?.options || [],
                allow_photo: item.mandatoryAttachment,
                allow_attachment: item.mandatoryAttachment,
                input_style: (item.config as any)?.input_style,
                require_photo_on: (item.config as any)?.require_photo_on
              }
            })) || [],
            sub_areas: area.subAreas?.map(sub => ({
              id: sub.id,
              name: sub.name,
              items: sub.items?.map(sitem => ({
                id: sitem.id,
                name: sitem.name,
                type: sitem.type as ItemType,
                mandatory_attachment: sitem.mandatoryAttachment,
                config: {
                  hint: sitem.config?.hint,
                  scale_type: sitem.scaleType as any,
                  numeric_option: sitem.config?.numericOption,
                  registry_type: sitem.config?.registryOptions?.length ? sitem.config.registryOptions[0] : undefined,
                  selection_type: sitem.config?.selectionType,
                  selection_options: sitem.config?.selectionOptions || (sitem.config as any)?.options || [],
                  allow_photo: sitem.mandatoryAttachment,
                  allow_attachment: sitem.mandatoryAttachment,
                  input_style: (sitem.config as any)?.input_style,
                  require_photo_on: (sitem.config as any)?.require_photo_on
                }
              })) || []
            })) || []
          })) || []
        },
        target_vehicle_types: selectedVehicleTypes,
        assigned_user_ids: selectedUsers,
        requires_analysis: requiresAnalysis,
        analysis_approvals_count: analysisApprovalsCount,
        analysis_first_approver: analysisFirstApprover,
        analysis_second_approver: analysisApprovalsCount === 2 ? analysisSecondApprover : null,
        analysis_has_timer: analysisHasTimer,
        analysis_timer_minutes: analysisHasTimer ? analysisTimerMinutes : null,
        scoring_enabled: settings.scoring_enabled,
        min_score_to_pass: settings.min_score_to_pass,
        updated_at: new Date().toISOString(),
        company_id: companyId,

        // Versioning Columns
        version: version + 1,
        status: 'draft',
        group_id: groupId || checklistId
      };

      const { data, error } = await supabase
        .from('checklist_templates')
        .insert(newData)
        .select()
        .single();

      if (error) throw error;

      alert(`Rascunho da versão ${data.version} criado!`);
      // Reload page or update state to new ID
      // Simpler to reload or just call onBack then onEdit(new) but we are inside component
      // Let's update state to point to new template
      setChecklistId(data.id);
      setVersion(data.version);
      setStatus('draft');
      setIsLocked(false); // New draft is editable

    } catch (error: any) {
      alert('Erro ao criar versão: ' + error.message);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Ao publicar, esta versão se tornará a ativa e a anterior será arquivada. Continuar?')) return;

    try {
      // 1. Archive others in group
      await supabase
        .from('checklist_templates')
        .update({ status: 'archived' })
        .eq('group_id', groupId)
        .eq('status', 'published')
        .neq('id', checklistId);

      // 2. Publish current
      const { error } = await supabase
        .from('checklist_templates')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', checklistId);

      if (error) throw error;

      alert('Versão publicada com sucesso!');
      setStatus('published');
      // Update lock status (it might be 0 inspections, so unlocked, but logically published usually implies "Ready")
      // If we want to allow editing published items UNTIL they have inspections, we don't need to do anything.

    } catch (error: any) {
      alert('Erro ao publicar: ' + error.message);
    }
  };

  const deleteSubArea = (areaIdx: number, subAreaIdx: number) => {
    const newAreas = [...areas];
    newAreas[areaIdx].subAreas.splice(subAreaIdx, 1);
    setAreas(newAreas);
    setActiveSubAreaMenuIdx(null);
  };

  const addSubArea = (areaIdx: number) => {
    if (newSubAreaName.trim()) {
      const newAreas = [...areas];
      newAreas[areaIdx].subAreas.push({
        id: Math.random().toString(36).substr(2, 9),
        name: newSubAreaName,
        items: []
      });
      setAreas(newAreas);
      setNewSubAreaName('');
      setAddingSubAreaTo(null);
    }
  };

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

  // New configuration states
  const [inputStyle, setInputStyle] = useState<'smile_5' | 'smile_3' | 'thumbs' | 'default'>('default');
  const [requirePhotoOn, setRequirePhotoOn] = useState<string[]>([]);
  const [photoRequiredOptions, setPhotoRequiredOptions] = useState<string[]>([]);

  const resetItemForm = () => {
    setItemName('');
    setItemType('Avaliativo');
    setMandatoryAttachment(false);
    setScaleIdx(0);
    setInputStyle('default');
    setRequirePhotoOn([]);
    setPhotoRequiredOptions([]);
    setRegistryOptions([]);
    setNumericOption('');
    setSelectionType('single');
    setSelectionOptions([]);
    setHintText('');
    setShowHint(false);
    setEditingItemIdx(null);
  };

  const openItemForm = (areaIdx: number, subAreaIdx?: number, itemIdx?: number) => {
    // ALWAYS reset form first to clear previous item's state
    resetItemForm();

    setOpenItemFormLocation({ areaIdx, subAreaIdx });

    let item: AreaItem | undefined;
    if (typeof itemIdx === 'number') {
      if (typeof subAreaIdx === 'number') {
        item = areas[areaIdx].subAreas[subAreaIdx].items[itemIdx];
      } else {
        item = areas[areaIdx].items[itemIdx];
      }
    }

    if (item && typeof itemIdx === 'number') {
      setEditingItemIdx(itemIdx);
      setItemName(item.name);
      setItemType(item.type);

      // FIXED: Load mandatoryAttachment from config if it exists there
      const attachmentFromConfig = item.config?.allow_photo || item.config?.allow_attachment || false;
      setMandatoryAttachment(item.mandatoryAttachment || attachmentFromConfig);

      // Restore configurations
      if (item.config) {
        console.log('Loading item config:', item.config); // DEBUG
        setRegistryOptions(item.config.registryOptions || []);
        setNumericOption(item.config.numericOption || (item.config as any).numeric_option || '');

        // Load new fields
        setInputStyle((item.config as any).input_style || 'default');
        setRequirePhotoOn((item.config as any).require_photo_on || []);

        // FIX: Support both camelCase and snake_case for photo_required_options
        const photoReqOpts = (item.config as any).photo_required_options || (item.config as any).photoRequiredOptions || [];
        console.log('🔍 Loading photo_required_options:', photoReqOpts, 'from config:', item.config); // DEBUG
        setPhotoRequiredOptions(photoReqOpts);

        // FIX: Read selection_type from both camelCase (local state) and snake_case (database)
        const selType = item.config.selectionType || (item.config as any).selection_type || 'single';
        console.log('Setting selectionType to:', selType); // DEBUG
        setSelectionType(selType);

        // Robust fallback for options loading
        const opts = item.config.selectionOptions || (item.config as any).selection_options || item.config.options || (item as any).options || [];
        setSelectionOptions(opts);

        setHintText(item.config.hint || '');
        setShowHint(!!item.config.hint);
      }

      // Restore scale if applicable - check both local (scaleType) and DB (config.scale_type)
      const scaleTypeValue = item.scaleType || (item.config as any)?.scale_type;
      if (scaleTypeValue) {
        const foundIdx = scaleOptions.findIndex(s => s.id === scaleTypeValue);
        if (foundIdx !== -1) setScaleIdx(foundIdx);
      }
    }
  };

  const saveItem = () => {
    if (!itemName || !openItemFormLocation) return;

    const { areaIdx, subAreaIdx } = openItemFormLocation;

    // Handle any pending option that wasn't strictly added via button
    let finalSelectionOptions = [...selectionOptions];
    if (itemType === 'Lista de Seleção' && newOptionText && newOptionText.trim().length > 0) {
      finalSelectionOptions.push(newOptionText.trim());
      setNewOptionText(''); // Clear input
    }

    // Determine existing ID or generate new one
    let existingId: string | undefined;
    if (editingItemIdx !== null) {
      if (typeof subAreaIdx === 'number') {
        existingId = areas[areaIdx].subAreas[subAreaIdx].items[editingItemIdx].id;
      } else {
        existingId = areas[areaIdx].items[editingItemIdx].id;
      }
    }

    console.log('saveItem: Current selectionType state:', selectionType); // DEBUG

    const newItem: AreaItem = {
      id: existingId || Math.random().toString(36).substr(2, 9),
      name: itemName,
      type: itemType,
      mandatoryAttachment,
      scaleType: itemType === 'Avaliativo' ? scaleOptions[scaleIdx].id : undefined,
      config: {
        registryOptions,
        numericOption,
        selectionType,
        selectionOptions: finalSelectionOptions,
        hint: hintText,
        input_style: itemType === 'Avaliativo' ? inputStyle : undefined,
        require_photo_on: itemType === 'Avaliativo' ? requirePhotoOn : undefined,
        photo_required_options: itemType === 'Lista de Seleção' ? photoRequiredOptions : undefined
      }
    };

    console.log('💾 Saving item with photo_required_options:', photoRequiredOptions, 'newItem.config:', newItem.config); // DEBUG

    const newAreas = [...areas];
    let targetItems: AreaItem[];

    if (typeof subAreaIdx === 'number') {
      targetItems = newAreas[areaIdx].subAreas[subAreaIdx].items;
    } else {
      targetItems = newAreas[areaIdx].items;
    }

    if (editingItemIdx !== null) {
      targetItems[editingItemIdx] = newItem;
    } else {
      targetItems.push(newItem);
    }

    setAreas(newAreas);
    setOpenItemFormLocation(null);
    resetItemForm();
  };

  const deleteItem = (areaIdx: number, subAreaIdx: number | undefined, itemIdx: number) => {
    const newAreas = [...areas];
    if (typeof subAreaIdx === 'number') {
      newAreas[areaIdx].subAreas[subAreaIdx].items.splice(itemIdx, 1);
    } else {
      newAreas[areaIdx].items.splice(itemIdx, 1);
    }
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
      setAreas([...areas, {
        id: Math.random().toString(36).substr(2, 9),
        name: newAreaName,
        items: [],
        subAreas: []
      }]);
      setNewAreaName('');
      setIsAddingArea(false);
    }
  };

  function renderDadosCadastrais() {
    return (
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
                  <span className="text-[10px] text-slate-400 font-bold">{name.length} / 255</span>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-900"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Assunto</label>
                <input
                  type="text"
                  placeholder="Ex: Manutenção Mensal"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
                  <span className="text-[10px] text-slate-400 font-bold">{description.length} / 5000</span>
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                ></textarea>
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
                    {pdfHeaderImage ? (
                      <img src={pdfHeaderImage} alt="Header PDF" className="h-full w-full object-contain" />
                    ) : (
                      <div className="flex items-center gap-2 font-black text-blue-900 text-lg">
                        <Check size={24} className="stroke-[3]" />
                        CHECKSHIP
                      </div>
                    )}
                  </div>
                  <button className="text-xs font-black text-blue-900 uppercase hover:underline">Alterar Imagem</button>
                </div>
              </div>
              <div className="flex-1 w-full">
                <Toggle
                  label="Personalizar informações do PDF"
                  active={false}
                  disabled={true}
                  badge="EM BREVE"
                />
                <div className="mt-4 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Título do relatório</label>
                  <input
                    type="text"
                    placeholder="Relatório de Inspeção"
                    value={pdfTitle}
                    onChange={(e) => setPdfTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </Accordion>
        <Accordion title="Preenchimento" isOpen={!!openPanels.fill} onToggle={() => togglePanel('fill')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
            <Toggle
              label="Mostrar horário das respostas no relatório"
              description="Exibe o timestamp exato de quando cada item foi respondido"
              active={settings.show_item_timestamps || false}
              onChange={(val) => setSettings(prev => ({ ...prev, show_item_timestamps: val }))}
              badge="NOVO"
            />
            <div className="border-t border-slate-100 my-4 pt-4 col-span-1 md:col-span-2">
              <Toggle
                label="Ativar Sistema de Pontuação (Score)"
                description="Habilita cálculo de nota (0-100) baseada nas respostas avaliativas"
                active={settings.scoring_enabled || false}
                onChange={(val) => setSettings(prev => ({ ...prev, scoring_enabled: val }))}
                badge="BETA"
              />
              {settings.scoring_enabled && (
                <div className="mt-4 ml-12 animate-in slide-in-from-top-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nota mínima para aprovação (%)</label>
                  <div className="flex items-center gap-2 mt-1 w-32">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.min_score_to_pass || 70}
                      onChange={(e) => setSettings(prev => ({ ...prev, min_score_to_pass: parseInt(e.target.value) }))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-100 font-bold text-center"
                    />
                    <span className="font-bold text-slate-400">%</span>
                  </div>
                </div>
              )}
            </div>
            <Toggle
              label="Aplicar checklist somente pelo aplicativo"
              description="Quando habilitado, este template aparecerá apenas no aplicativo mobile"
              active={settings.app_only}
              onChange={(val) => setSettings(prev => ({ ...prev, app_only: val }))}
              disabled={true}
              badge="EM BREVE"
            />
            <Toggle
              label="Permitir anexar arquivos da memória do dispositivo"
              description="Quando desabilitado, apenas a câmera poderá ser usada para itens com anexo obrigatório"
              active={settings.allow_gallery}
              onChange={(val) => setSettings(prev => ({ ...prev, allow_gallery: val }))}
              badge="CONFIG"
            />
            <Toggle
              label="Responder itens em massa"
              active={settings.bulk_answer}
              onChange={(val) => setSettings(prev => ({ ...prev, bulk_answer: val }))}
              disabled={true}
              badge="EM BREVE"
            />
            <Toggle
              label="Exibir resultado parcial"
              active={settings.partial_result}
              onChange={(val) => setSettings(prev => ({ ...prev, partial_result: val }))}
              disabled={true}
              badge="EM BREVE"
            />
            <Toggle
              label="Campos Nome e Cargo da assinatura são obrigatórios"
              active={settings.mandatory_signature}
              onChange={(val) => setSettings(prev => ({ ...prev, mandatory_signature: val }))}
              disabled={true}
              badge="EM BREVE"
            />
          </div>
        </Accordion>

        <Accordion title="Pós-conclusão" isOpen={!!openPanels.post} onToggle={() => togglePanel('post')}>
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <Toggle
                label="Compartilhar checklist por e-mail"
                active={settings.share_email}
                onChange={(val) => setSettings(prev => ({ ...prev, share_email: val }))}
                disabled={true}
                badge="EM BREVE"
              />
              <Toggle
                label="Solicitar assinatura do motorista ao finalizar"
                description="Exibe campo de assinatura digital antes de concluir o checklist"
                active={settings.require_driver_signature}
                onChange={(val) => setSettings(prev => ({ ...prev, require_driver_signature: val }))}
                badge="NOVO"
              />
            </div>
          </div>
        </Accordion>

        <Accordion title="Documentos" isOpen={!!openPanels.docs} onToggle={() => togglePanel('docs')}>
          <div className="space-y-6">
            <Toggle
              label="Obrigar validação de documentação"
              description="Quando ativado, o sistema verificará a validade e presença de documentos antes de permitir o início da inspeção"
              active={validateDocs}
              onChange={setValidateDocs}
              badge="REGRAS"
            />

            {validateDocs && (
              <div className="ml-12 space-y-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Escolha o que validar:</p>

                <Toggle
                  label="Validar documentos do Motorista"
                  description="Verifica se a CNH está presente e dentro do prazo de validade"
                  active={validateUserDocs}
                  onChange={setValidateUserDocs}
                />

                <Toggle
                  label="Validar documentos do Veículo (Cavalo)"
                  description="Verifica se CRLV e CIV estão presentes e dentro do prazo de validade"
                  active={validateVehicleDocs}
                  onChange={setValidateVehicleDocs}
                />

                <Toggle
                  label="Validar documentos da Carreta/Implemento"
                  description="Verifica se CRLV e CIV estão presentes e dentro do prazo de validade na carreta vinculada"
                  active={validateTrailerDocs}
                  onChange={setValidateTrailerDocs}
                />
              </div>
            )}
          </div>
        </Accordion>
        <Accordion title="Cerca Digital" isOpen={!!openPanels.geo} onToggle={() => togglePanel('geo')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
            <Toggle
              label="Bloquear início fora da unidade"
              active={settings.geo_fence_start}
              onChange={(val) => setSettings(prev => ({ ...prev, geo_fence_start: val }))}
              disabled={true}
              badge="EM BREVE"
            />
            <Toggle
              label="Bloquear conclusão fora da unidade"
              active={settings.geo_fence_end}
              onChange={(val) => setSettings(prev => ({ ...prev, geo_fence_end: val }))}
              disabled={true}
              badge="EM BREVE"
            />
          </div>
        </Accordion>

        {/* Fluxo de Análise (Analysis Workflow) */}
        <Accordion title="Fluxo de Análise" isOpen={!!openPanels.analysis} onToggle={() => togglePanel('analysis')}>
          <div className="space-y-6">
            {/* Main Toggle */}
            <Toggle
              label="Checklists aplicados devem passar por análise"
              description="Quando ativado, checklists concluídos terão status 'Em Análise' até serem aprovados"
              active={requiresAnalysis}
              onChange={(val) => setRequiresAnalysis(val)}
            />

            {requiresAnalysis && (
              <div className="space-y-6 pl-4 border-l-2 border-blue-200 ml-2">
                {/* Approval Count */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Quantidade de aprovações necessárias
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="approvalCount"
                        checked={analysisApprovalsCount === 1}
                        onChange={() => setAnalysisApprovalsCount(1)}
                        className="w-4 h-4 text-blue-900 border-slate-300 focus:ring-blue-900"
                      />
                      <span className="text-sm text-slate-700">1 aprovação</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="approvalCount"
                        checked={analysisApprovalsCount === 2}
                        onChange={() => setAnalysisApprovalsCount(2)}
                        className="w-4 h-4 text-blue-900 border-slate-300 focus:ring-blue-900"
                      />
                      <span className="text-sm text-slate-700">2 aprovações (sequencial)</span>
                    </label>
                  </div>
                </div>

                {/* First Approver */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <Users size={14} />
                    1º Aprovador
                  </label>
                  <div className="relative">
                    <select
                      value={analysisFirstApprover || ''}
                      onChange={(e) => setAnalysisFirstApprover(e.target.value || null)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-900 cursor-pointer"
                    >
                      <option value="">Selecione um aprovador...</option>
                      {availableApprovers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name} ({user.role})
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-slate-400">
                    Usuário responsável pela primeira aprovação
                  </p>
                </div>

                {/* Second Approver (only if 2 approvals) */}
                {analysisApprovalsCount === 2 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                      <Users size={14} />
                      2º Aprovador
                    </label>
                    <div className="relative">
                      <select
                        value={analysisSecondApprover || ''}
                        onChange={(e) => setAnalysisSecondApprover(e.target.value || null)}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-900 cursor-pointer"
                      >
                        <option value="">Selecione um aprovador...</option>
                        {availableApprovers
                          .filter(u => u.id !== analysisFirstApprover) // Don't show first approver
                          .map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.full_name} ({user.role})
                            </option>
                          ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <p className="text-xs text-slate-400">
                      Usuário responsável pela segunda aprovação (após a primeira)
                    </p>
                  </div>
                )}

                {/* Timer Toggle */}
                <div className="pt-4 border-t border-slate-100">
                  <Toggle
                    label="Tempo limite para análise"
                    description="Define um prazo máximo para que a análise seja concluída"
                    active={analysisHasTimer}
                    onChange={(val) => setAnalysisHasTimer(val)}
                  />

                  {analysisHasTimer && (
                    <div className="mt-4 space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <Clock size={14} />
                        Tempo em minutos
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={analysisTimerMinutes || ''}
                        onChange={(e) => setAnalysisTimerMinutes(e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="Ex: 30"
                        className="w-32 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-900"
                      />
                      <p className="text-xs text-slate-400">
                        Após este tempo, o checklist pode ser liberado automaticamente
                      </p>
                    </div>
                  )}
                </div>

                {/* Analyst Signature Toggle */}
                <div className="pt-4 border-t border-slate-100">
                  <Toggle
                    label="Assinatura ao fazer análise"
                    description="Solicita assinatura digital do responsável ao aprovar ou reprovar"
                    active={settings.require_analyst_signature}
                    onChange={(val) => setSettings(prev => ({ ...prev, require_analyst_signature: val }))}
                    badge="NOVO"
                  />
                </div>
              </div>
            )}
          </div>
        </Accordion >
      </div >
    );
  }

  function renderEstrutura() {
    return (
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
            {areas?.map((area, areaIdx) => (
              <div key={area.id} className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden" onClick={() => setActiveMenuId(null)}>
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
                    </div>
                    <div className="h-6 w-px bg-blue-800"></div>
                    <div className="flex items-center gap-3 relative">
                      <span className="text-[10px] font-bold opacity-60">Tipo de área</span>
                      <select className="bg-blue-800 text-white text-[10px] font-bold px-2 py-1 rounded outline-none border-none cursor-pointer">
                        <option>Padrão</option>
                      </select>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveAreaMenuIdx(activeAreaMenuIdx === areaIdx ? null : areaIdx);
                        }}
                        className="p-1 hover:bg-blue-800 rounded transition-colors"
                      >
                        <MoreVertical size={16} className="cursor-pointer" />
                      </button>

                      {activeAreaMenuIdx === areaIdx && (
                        <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-xl py-2 w-32 z-10 animate-in fade-in zoom-in-95 duration-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteArea(areaIdx);
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

                {/* SubArea Creation Input */}
                {addingSubAreaTo === areaIdx && (
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-4 animate-in slide-in-from-top-2">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nome da Subárea</label>
                      <input
                        autoFocus
                        type="text"
                        value={newSubAreaName}
                        onChange={(e) => setNewSubAreaName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSubArea(areaIdx)}
                        placeholder="Ex: Motor, Cabine..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div className="flex items-end gap-2 mt-5">
                      <button onClick={() => setAddingSubAreaTo(null)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-lg">CANCELAR</button>
                      <button onClick={() => addSubArea(areaIdx)} className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-sm">SALVAR</button>
                    </div>
                  </div>
                )}

                {/* SubAreas List */}
                {area.subAreas?.map((subArea, subAreaIdx) => (
                  <div key={subArea.id} className="mx-4 mt-4 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/30">
                    <div className="bg-slate-100/50 p-3 flex items-center justify-between border-b border-slate-200/50">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                        <span className="font-bold text-sm text-slate-700">{subArea.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => openItemForm(areaIdx, subAreaIdx)}
                          className="text-[10px] font-black uppercase text-blue-900 hover:underline"
                        >
                          Novo Item
                        </button>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSubAreaMenuIdx(
                                activeSubAreaMenuIdx?.areaIdx === areaIdx && activeSubAreaMenuIdx?.subAreaIdx === subAreaIdx
                                  ? null
                                  : { areaIdx, subAreaIdx }
                              );
                            }}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <MoreVertical size={14} />
                          </button>
                          {activeSubAreaMenuIdx?.areaIdx === areaIdx && activeSubAreaMenuIdx?.subAreaIdx === subAreaIdx && (
                            <div className="absolute right-0 top-6 bg-white border border-slate-200 rounded-lg shadow-xl py-2 w-32 z-10 animate-in fade-in zoom-in-95 duration-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSubArea(areaIdx, subAreaIdx);
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

                    {/* SubArea Items Render */}
                    {openItemFormLocation?.areaIdx === areaIdx && openItemFormLocation?.subAreaIdx === subAreaIdx ? (
                      renderItemForm()
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {subArea.items && subArea.items.length > 0 ? (
                          subArea.items?.map((item, itemIdx) => renderItemRow(item, areaIdx, subAreaIdx, itemIdx))
                        ) : (
                          <div className="p-4 text-center">
                            <p className="text-xs text-slate-400">Nenhum item nesta subárea.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Main Area Body: Item Form or List */}
                {openItemFormLocation?.areaIdx === areaIdx && openItemFormLocation?.subAreaIdx === undefined ? (
                  renderItemForm()
                ) : (
                  <div className="py-4">
                    {area.items && area.items.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {area.items?.map((item, itemIdx) => renderItemRow(item, areaIdx, undefined, itemIdx))}
                      </div>
                    ) : (
                      (!area.subAreas || area.subAreas.length === 0) && (
                        <div className="p-12 text-center">
                          <p className="text-slate-400 text-sm">Nenhum item cadastrado nesta área.</p>
                          <p className="text-xs text-slate-300 mt-1">Utilize o botão "Novo Item" acima para adicionar.</p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* New Area Creation (Always visible at bottom) */}
            {isAddingArea ? (
              <div className="border border-blue-900/20 rounded-2xl bg-blue-50/50 p-6 animate-in slide-in-from-top-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-bold text-blue-900 uppercase">Nome da Nova Área</label>
                    <input
                      autoFocus
                      type="text"
                      value={newAreaName}
                      onChange={(e) => setNewAreaName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addArea()}
                      placeholder="Ex: Motor, Cabine, Pneus..."
                      className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-900/20 text-blue-900 font-medium placeholder:text-blue-900/30"
                    />
                  </div>
                  <div className="flex items-end gap-2 h-full pb-0.5">
                    <button
                      onClick={() => setIsAddingArea(false)}
                      className="px-6 py-3 rounded-xl text-xs font-black text-blue-900/60 hover:text-blue-900 hover:bg-blue-100/50 transition-all uppercase tracking-wide"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={addArea}
                      className="px-8 py-3 rounded-xl bg-blue-900 text-white text-xs font-black hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 active:scale-95 uppercase tracking-wide flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingArea(true)}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-blue-900 hover:text-blue-900 transition-all flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wide group"
              >
                <Plus size={18} className="group-hover:scale-110 transition-transform" />
                Adicionar Nova Área
              </button>
            )}

          </div>
        )}
      </div>
    );
  }

  function renderItemRow(item: any, areaIdx: number, subAreaIdx: number | undefined, itemIdx: number) {
    return (
      <div
        key={item.id}
        onClick={() => openItemForm(areaIdx, subAreaIdx, itemIdx)}
        className="px-8 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer"
      >
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700">{item.name}</span>
        </div>
        <div className="flex items-center gap-4 relative">
          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase">{item.type}</span>
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
                    deleteItem(areaIdx, subAreaIdx, itemIdx);
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
    );
  }

  function renderItemForm() {
    return (
      <div className="p-8 border-t border-slate-100 bg-slate-50/50">
        <div className="border-2 border-blue-900 rounded-2xl bg-white p-8 space-y-6 shadow-xl relative animate-in zoom-in-95 duration-200">
          <button
            onClick={() => setOpenItemFormLocation(null)}
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
                  onChange={(e) => setItemType(e.target.value as any)}
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
                <label className="text-xs font-bold text-slate-500 uppercase">Configuração da Escala</label>

                {/* Scale Logic Selection */}
                <div className="flex gap-4 mb-4">
                  {scaleOptions.map((opt, idx) => (
                    <button
                      key={opt.id}
                      onClick={() => setScaleIdx(idx)}
                      className={`flex-1 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${scaleIdx === idx
                        ? 'border-blue-900 bg-blue-50/50 text-blue-900'
                        : 'border-slate-200 hover:border-blue-200 text-slate-400'
                        }`}
                    >
                      <span className="text-xs font-bold uppercase">{opt.label}</span>
                      <div className="scale-75 origin-top">{opt.render()}</div>
                    </button>
                  ))}
                </div>



                {/* Photo Requirements */}
                <div className="space-y-2 p-3 bg-red-50 border border-red-100 rounded-xl" >
                  <div className="flex items-center gap-2 text-red-800">
                    <Camera size={14} />
                    <span className="text-xs font-bold uppercase">Foto Obrigatória</span>
                  </div>
                  <p className="text-[10px] text-red-600/80">Selecione quando a foto será exigida:</p>

                  <div className="flex flex-wrap gap-3">
                    {/* Options based on currently selected scale logic */}

                    {/* N/S scale - Sim and Não options */}
                    {scaleOptions[scaleIdx].id === 'ns' && (
                      ['sim', 'nao'].map(val => (
                        <label key={val} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={requirePhotoOn.includes(val)}
                            onChange={(e) => {
                              if (e.target.checked) setRequirePhotoOn([...requirePhotoOn, val]);
                              else setRequirePhotoOn(requirePhotoOn.filter(x => x !== val));
                            }}
                            className="rounded text-red-600 focus:ring-red-500 border-red-200"
                          />
                          <span className="text-xs font-bold text-red-700 uppercase">
                            {val === 'sim' ? 'Ao marcar Sim' : 'Ao marcar Não'}
                          </span>
                        </label>
                      ))
                    )}

                    {/* faces_2 (SMILE/FROWN) - Bom and Ruim options */}
                    {scaleOptions[scaleIdx].id === 'faces_2' && (
                      ['bom', 'ruim'].map(val => (
                        <label key={val} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={requirePhotoOn.includes(val)}
                            onChange={(e) => {
                              if (e.target.checked) setRequirePhotoOn([...requirePhotoOn, val]);
                              else setRequirePhotoOn(requirePhotoOn.filter(x => x !== val));
                            }}
                            className="rounded text-red-600 focus:ring-red-500 border-red-200"
                          />
                          <span className="text-xs font-bold text-red-700 uppercase">
                            {val === 'bom' ? 'Ao marcar Bom' : 'Ao marcar Ruim'}
                          </span>
                        </label>
                      ))
                    )}

                    {/* faces_3 (SMILE/MEH/FROWN) - Bom, Regular and Ruim options */}
                    {scaleOptions[scaleIdx].id === 'faces_3' && (
                      ['bom', 'regular', 'ruim'].map(val => (
                        <label key={val} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={requirePhotoOn.includes(val)}
                            onChange={(e) => {
                              if (e.target.checked) setRequirePhotoOn([...requirePhotoOn, val]);
                              else setRequirePhotoOn(requirePhotoOn.filter(x => x !== val));
                            }}
                            className="rounded text-red-600 focus:ring-red-500 border-red-200"
                          />
                          <span className="text-xs font-bold text-red-700 uppercase">
                            {val === 'bom' ? 'Ao marcar Bom' : val === 'regular' ? 'Ao marcar Regular' : 'Ao marcar Ruim'}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
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
                  {['E-mail', 'Estado, UF e Cidade', 'CEP', 'Telefone', 'CNPJ', 'CPF', 'Placa do Automóvel', 'Placa Mercosul']?.map(opt => (
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
                  {['Quantidade', 'Decimal', 'Porcentagem']?.map(opt => (
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
                  {selectionOptions?.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2 animate-in slide-in-from-left-2">
                      <div className={`w-4 h-4 rounded border border-slate-300 ${selectionType === 'single' ? 'rounded-full' : 'rounded'}`}></div>
                      <span className="text-sm text-slate-700 bg-slate-50 px-3 py-1.5 rounded flex-1 border border-slate-100">{opt}</span>

                      {/* Botão de câmera para foto obrigatória */}
                      <button
                        type="button"
                        onClick={() => {
                          if (photoRequiredOptions.includes(opt)) {
                            setPhotoRequiredOptions(photoRequiredOptions.filter(o => o !== opt));
                          } else {
                            setPhotoRequiredOptions([...photoRequiredOptions, opt]);
                          }
                        }}
                        className={`p-1.5 rounded transition-all ${photoRequiredOptions.includes(opt)
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                          }`}
                        title={photoRequiredOptions.includes(opt) ? 'Foto obrigatória ativa' : 'Clique para obrigar foto'}
                      >
                        <Camera size={14} />
                      </button>

                      <button type="button" onClick={() => setSelectionOptions(prev => prev.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600"><X size={14} /></button>
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
              <button onClick={() => setOpenItemFormLocation(null)} className="text-xs font-black uppercase text-blue-900">Cancelar</button>
              <button onClick={saveItem} className="bg-blue-900 text-white px-6 py-2 rounded-lg text-xs font-black uppercase shadow-md hover:bg-blue-800 transition-all">Salvar Item</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderDepartamentos() {
    return (
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
              {['departamento1', 'departamento2', 'departamento3']?.map((dept, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">{dept}</td>
                  <td className="px-6 py-4 text-right">
                    <TableToggle active={idx === 0} onChange={() => { }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderTiposUnidade() {
    return (
      <div className="max-w-7xl w-full mx-auto p-8">
        <ChecklistVehicleTypes checklistId={checklistId} onEnsureExists={() => performSave(true)} />
      </div>
    );
  }

  function renderUsuarios() {
    return (
      <div className="max-w-7xl w-full mx-auto p-8">
        <ChecklistUsers checklistId={checklistId} onEnsureExists={() => performSave(true)} />
      </div>
    );
  }



  return (
    <div className="flex flex-col min-h-full bg-slate-50 pb-24 animate-in fade-in duration-500">
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium">
          <span>Checklist</span>
          <ChevronDown size={12} className="-rotate-90" />
          <span className="text-slate-600">Configurar Checklist</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Configurar Checklist</h1>
            <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded font-mono">v{version}</span>
            {status === 'draft' && <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full uppercase font-bold">Rascunho</span>}
            {status === 'published' && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full uppercase font-bold">Publicado</span>}
            {isLocked && <div title="Bloqueado para edição direta"><Lock size={14} className="text-slate-400" /></div>}
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-slate-200 px-8 flex gap-8">
        {tabs?.map(tab => (
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
        <div className="flex items-center gap-4">
          {status === 'published' ? (
            <button
              onClick={handleCreateVersion}
              className="px-10 py-2.5 bg-blue-900 text-white rounded-lg font-black text-xs uppercase tracking-wider hover:bg-blue-800 shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus size={14} /> Criar Versão {version + 1}
            </button>
          ) : status === 'draft' ? (
            <>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-black text-xs uppercase tracking-wider hover:bg-slate-50 transition-all"
              >
                Salvar Rascunho
              </button>
              <button
                onClick={handlePublish}
                className="px-10 py-2.5 bg-green-600 text-white rounded-lg font-black text-xs uppercase tracking-wider hover:bg-green-500 shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <Check size={14} /> Publicar v{version}
              </button>
            </>
          ) : (
            <button
              onClick={handleSave}
              className="px-10 py-2.5 bg-blue-900 text-white rounded-lg font-black text-xs uppercase tracking-wider hover:bg-blue-800 shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <Check size={14} /> Salvar
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default ChecklistConfig;
