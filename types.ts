/**
 * ENUMS - Padronização de Valores Fixos
 */
export enum VehicleType {
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
export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  type: VehicleType;
  current_km: number;
  crlv_expiry: string;
  renavam: string;
  status: 'DISPONIVEL' | 'MANUTENCAO' | 'AGUARDANDO_REPARO';
  last_checklist_id?: string;
}

export interface Driver {
  id: string;
  user_id: string; // Link com Auth do Supabase
  name: string;
  email: string;
  cnh: string;
  cnh_expiry: string;
  branch: string;
  active: boolean;
}

/**
 * ESTRUTURA DO CHECKLIST (DNA do Modelo)
 */
export interface ChecklistItemConfig {
  hint?: string;
  scale_type?: 'ns' | 'brr'; // ns: Sim/Não | brr: Bom/Regular/Ruim
  selection_type?: 'single' | 'multiple';
  selection_options?: string[];
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
  target_vehicle_types: VehicleType[]; // Quais veículos usam este modelo
  assigned_user_ids: string[]; // Quais usuários podem ver este modelo
  created_at: string;
  updated_at: string;
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
  responses: any; // JSONB com as respostas dadas
  critical_issues: string[]; // Itens que reprovaram
  location_start?: { lat: number; lng: number };
  location_end?: { lat: number; lng: number };
  signature_url?: string;
}