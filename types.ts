/**
 * ENUMS - Padronização de Valores Fixos
 */
export enum OperationType {
  CAMINHAO = 'Caminhão',
  CARRETA = 'Carreta',
  BITREM = 'Bitrem',
  VAN = 'Van',
  UTILITARIO = 'Utilitário'
}

export enum ChecklistStatus {
  APROVADO = 'Aprovado',
  REPROVADO = 'Reprovado',
  EM_ANDAMENTO = 'Em Andamento',
  EM_ANALISE = 'Em Análise'
}

export enum ItemType {
  AVALIATIVO = 'Avaliativo',
  NUMERICO = 'Numérico',
  TEXTO = 'Texto',
  DATA = 'Data',
  SELECAO = 'Lista de Seleção'
}

/**
 * ENTIDADES PRINCIPAIS
 */
export interface VehicleConfiguration {
  id: string;
  name: string;
  category: 'RIGID' | 'ARTICULATED';
  plates_count: number;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  type: OperationType;
  vehicle_type_id: string; // Refers to OperationType (e.g. Distribuição)
  vehicle_configuration_id?: string; // Refers to Physical Configuration (e.g. VUC, Bitrem)
  vehicle_configuration?: VehicleConfiguration;
  current_km: number;
  crlv_expiry: string;
  renavam: string;
  status: 'DISPONIVEL' | 'MANUTENCAO' | 'AGUARDANDO_REPARO';
  last_checklist_id?: string;
  branch_id?: string | null;
  trailer_id?: string | null;
}

export interface Trailer {
  id: string;
  plate: string;
  active: boolean;
  company_id: string;

  civ_date?: string | null;
  civ_expiry?: string | null;
  civ_file_url?: string | null;

  cipp_date?: string | null;
  cipp_expiry?: string | null;
  cipp_file_url?: string | null;

  cvt_date?: string | null;
  cvt_expiry?: string | null;
  cvt_file_url?: string | null;

  crlv_date?: string | null;
  crlv_expiry?: string | null;
  crlv_file_url?: string | null;

  created_at: string;
}

export interface Branch {
  id: string;
  name: string;
  active: boolean;
  company_id?: string;
  created_at?: string;
}

export interface Driver {
  id: string;
  user_id: string; // Link com Auth do Supabase
  name: string;
  email: string;
  cnh: string;
  cnh_expiry: string;
  branch: string;
  branch_id?: string | null;
  active: boolean;
}


/**
 * ESTRUTURA DO CHECKLIST (DNA do Modelo)
 */
export interface ChecklistItemConfig {
  hint?: string;
  scale_type?: 'ns' | 'brr'; // ns: Sim/Não | brr: Bom/Regular/Ruim
  input_style?: 'smile_5' | 'smile_3' | 'thumbs' | 'default'; // Estilo visual da resposta
  require_photo_on?: string[]; // Valores que exigem foto obrigatória (ex: ['ruim', 'nao'])
  selection_type?: 'single' | 'multiple';
  selection_options?: string[];
  photo_required_options?: string[]; // Opções de seleção que requerem foto obrigatória
  min?: number;
  max?: number;
}

export interface ChecklistItem {
  id: string;
  name: string;
  type: ItemType;
  mandatory_attachment: boolean;
  config: ChecklistItemConfig;
}

export interface ChecklistSubArea {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export interface ChecklistArea {
  id: string;
  name: string;
  type: 'Padrão' | 'Crítico';
  items: ChecklistItem[];
  sub_areas: ChecklistSubArea[];
}

export interface ChecklistSettings {
  app_only: boolean;
  allow_gallery: boolean;
  bulk_answer: boolean;
  partial_result: boolean;
  mandatory_signature: boolean;
  share_email: boolean;
  geo_fence_start: boolean;
  geo_fence_end: boolean;
  show_item_timestamps?: boolean; // ⬅️ Novo: Configuração para mostrar horários
}

/**
 * MODELO FINAL DO CHECKLIST (Para salvar no Banco)
 */
export interface ChecklistTemplate {
  id: string;
  name: string;
  subject: string;
  description: string;
  settings: ChecklistSettings;
  structure: {
    areas: ChecklistArea[];
  };
  target_vehicle_types: OperationType[]; // Quais operações usam este modelo
  assigned_user_ids: string[]; // Quais usuários podem ver este modelo
  scoring_enabled?: boolean; // ⬅️ Novo: Pontuação ativa?
  min_score_to_pass?: number; // Nota mínima (0-100)

  // Fluxo de Análise
  requires_analysis?: boolean;
  analysis_approvals_count?: number;
  analysis_first_approver?: string | null;
  analysis_second_approver?: string | null;
  analysis_has_timer?: boolean;
  analysis_timer_minutes?: number | null;

  // Versioning and Status
  version?: number;
  status?: 'draft' | 'published' | 'archived';
  group_id?: string;
  published_at?: string | null;

  // Validation settings
  validate_docs?: boolean;
  validate_user_docs?: boolean;
  validate_vehicle_docs?: boolean;
  validate_trailer_docs?: boolean;

  created_at: string;
  updated_at: string;
}

export interface ChecklistItemAnswer {
  value: any;
  photo_url?: string | null;
  comment?: string;
  answered_at?: string; // ⬅️ Novo: Timestamp da resposta
}

export interface ChecklistAnswers {
  [itemId: string]: ChecklistItemAnswer;
}

/**
 * REGISTRO DE RESPOSTAS (O que o Motorista envia)
 */
export interface ChecklistRecord {
  id: string;
  template_id: string;
  date: string;
  plate: string;
  driver_id: string;
  branch: string;
  status: ChecklistStatus;
  km_at_execution: number;
  responses: ChecklistAnswers; // ⬅️ Tipagem forte
  critical_issues: string[]; // Itens que reprovaram
  location_start?: { lat: number; lng: number };
  location_end?: { lat: number; lng: number };
  signature_url?: string;
}

export type ManagementDocStatus = 'VIGENTE' | 'ALERTA' | 'VENCIDO' | 'EM_RENOVACAO';

export interface ManagementDocument {
  id: string;
  profile_id?: string | null;
  vehicle_id?: string | null;
  trailer_id?: string | null;
  document_type: string;
  issue_date?: string | null;
  expiry_date: string;
  file_url?: string | null;
  status: ManagementDocStatus;
  renewal_anticipation_days: number;
  observation?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ChecklistDeniedAttempt {
  id: string;
  profile_id?: string | null;
  vehicle_id?: string | null;
  trailer_id?: string | null;
  denial_reasons: {
    doc: string;
    expiry: string;
    message?: string;
  }[];
  created_at: string;
}