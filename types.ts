
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

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  type: VehicleType;
  currentKm: number;
  crlvExpiry: string;
  renavam: string;
  status: 'DISPONIVEL' | 'MANUTENCAO' | 'AGUARDANDO_REPARO';
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  cnh: string;
  cnhExpiry: string;
  branch: string;
}

export interface ChecklistRecord {
  id: string;
  date: string;
  plate: string;
  driver: string;
  branch: string;
  status: ChecklistStatus;
  km: number;
  criticalIssues: string[];
}
