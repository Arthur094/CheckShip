
import React from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,

  BarChart3,
  Settings,
  Truck,
  Users,
  MapPin,
  FileText,
  UserCheck,
  Type,
  Megaphone,
  Layers
} from 'lucide-react';

export const COLORS = {
  primary: '#1e3a8a', // Dark Blue
  sidebar: '#f3f4f6', // Light Gray
  textMain: '#1e293b',
  textMuted: '#64748b',
};

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard Operacional', icon: <LayoutDashboard size={20} /> },
  { id: 'history', label: 'Checklists Realizados', icon: <ClipboardCheck size={20} /> },
  { id: 'docs-management', label: 'Gestão Documental', icon: <FileText size={20} /> },
  // { id: 'release-flows', label: 'Workflows (Fluxos)', icon: <Layers size={20} /> },

  {
    id: 'reports',
    label: 'Relatórios Automáticos',
    icon: <BarChart3 size={20} />,
    children: [
      { id: 'report-driver', label: 'Desempenho por Motorista' },
      { id: 'report-fleet', label: 'Desgaste de Frota' },
      { id: 'report-docs', label: 'Alertas de Documentação' },
    ]
  },
  {
    id: 'config',
    label: 'Configurações',
    icon: <Settings size={20} />,
    children: [
      { id: 'config-models', label: 'Checklists', icon: <FileText size={16} /> },
      // { id: 'config-workflows', label: 'Workflows (Novo)', icon: <ClipboardCheck size={16} /> },
      { id: 'config-vehicles', label: 'Veículos (Frota)', icon: <Truck size={16} /> },
      { id: 'config-otypes', label: 'Tipos de Operação', icon: <Type size={16} /> },
      { id: 'config-profiles', label: 'Perfis de Acesso', icon: <UserCheck size={16} /> },
      { id: 'config-users', label: 'Usuários', icon: <Users size={16} /> },
      { id: 'config-branches', label: 'Filiais', icon: <MapPin size={16} /> },
      { id: 'config-trailers', label: 'Carretas', icon: <Truck size={16} /> },
      { id: 'config-routes', label: 'Rotas e Regiões', icon: <MapPin size={16} /> },
      { id: 'config-announcements', label: 'Avisos do Sistema', icon: <Megaphone size={16} /> },
    ]
  }
];
