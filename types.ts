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
  currentKm: number;
  crlvExpiry: string;
  renavam: string;
  status: 'DISPONIVEL' | 'MANUTENCAO' | 'AGUARDANDO_REPARO';
  lastChecklistId?: string;
}

export interface Driver {
  id: string;
  userId: string; // Link com Auth do Supabase
  name: string;
  email: string;
  cnh: string;
  cnhExpiry: string;
  branch: string;
  active: boolean;
}

/**
 * ESTRUTURA DO CHECKLIST (DNA do Modelo)
 */
export interface ChecklistItemConfig {
  hint?: string;
  scaleType?: 'ns' | 'brr'; // ns: Sim/Não | brr: Bom/Regular/Ruim
  selectionType?: 'single' | 'multiple';
  selectionOptions?: string[];
  min?: number;
  max?: number;
}

export interface ChecklistItem {
  id: string;
  name: string;
  type: ItemType;
  mandatoryAttachment: boolean;
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
  subAreas: ChecklistSubArea[];
}

export interface ChecklistSettings {
  appOnly: boolean;
  allowGallery: boolean;
  bulkAnswer: boolean;
  partialResult: boolean;
  mandatorySignature: boolean;
  shareEmail: boolean;
  geoFenceStart: boolean;
  geoFenceEnd: boolean;
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
  targetVehicleTypes: VehicleType[]; // Quais veículos usam este modelo
  assignedUserIds: string[]; // Quais usuários podem ver este modelo
  createdAt: string;
  updatedAt: string;
}

/**
 * REGISTRO DE RESPOSTAS (O que o Motorista envia)
 */
export interface ChecklistRecord {
  id: string;
  templateId: string;
  date: string;
  plate: string;
  driverId: string;
  branch: string;
  status: ChecklistStatus;
  kmAtExecution: number;
  responses: any; // JSONB com as respostas dadas
  criticalIssues: string[]; // Itens que reprovaram
  locationStart?: { lat: number; lng: number };
  locationEnd?: { lat: number; lng: number };
  signatureUrl?: string;
}