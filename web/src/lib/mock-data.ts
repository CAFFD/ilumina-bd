// Mock data for the platform

export type OccurrenceStatus =
  | 'PENDENTE_APROVACAO'
  | 'APROVADA'
  | 'REJEITADA'
  | 'CANCELADA'
  | 'ATRIBUIDA'
  | 'EM_EXECUCAO'
  | 'AGUARDANDO_APROVACAO'
  | 'FINALIZADA';

export const STATUS_LABELS: Record<OccurrenceStatus, string> = {
  PENDENTE_APROVACAO: 'Pendente',
  APROVADA: 'Aprovada',
  REJEITADA: 'Rejeitada',
  CANCELADA: 'Cancelada',
  ATRIBUIDA: 'Atribuída',
  EM_EXECUCAO: 'Em Execução',
  AGUARDANDO_APROVACAO: 'Aguardando Aprovação',
  FINALIZADA: 'Finalizada',
};

export const STATUS_COLORS: Record<OccurrenceStatus, string> = {
  PENDENTE_APROVACAO: 'status-pending',
  APROVADA: 'status-approved',
  REJEITADA: 'status-rejected',
  CANCELADA: 'status-rejected',
  ATRIBUIDA: 'status-assigned',
  EM_EXECUCAO: 'status-in-progress',
  AGUARDANDO_APROVACAO: 'status-pending',
  FINALIZADA: 'status-completed',
};

export const STATUS_MAP_COLORS: Record<OccurrenceStatus, string> = {
  PENDENTE_APROVACAO: '#f59e0b',
  APROVADA: '#22c55e',
  REJEITADA: '#ef4444',
  CANCELADA: '#6b7280',
  ATRIBUIDA: '#3b82f6',
  EM_EXECUCAO: '#0a3d91',
  AGUARDANDO_APROVACAO: '#f59e0b',
  FINALIZADA: '#16a34a',
};

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Lâmpada Queimada', icon: '💡' },
  { id: '2', name: 'Poste Danificado', icon: '🔧' },
  { id: '3', name: 'Fiação Exposta', icon: '⚡' },
  { id: '4', name: 'Poste Inclinado', icon: '📐' },
  { id: '5', name: 'Luminária Quebrada', icon: '🔦' },
  { id: '6', name: 'Outros', icon: '📋' },
];

export interface Post {
  id: string;
  externalId: string;
  latitude: number;
  longitude: number;
  address?: string;
}

// Palmital, SP approximate center: -22.786, -50.205
export const MOCK_POSTS: Post[] = [
  { id: '1', externalId: 'P-001', latitude: -22.785, longitude: -50.206, address: 'Rua XV de Novembro, 100' },
  { id: '2', externalId: 'P-002', latitude: -22.787, longitude: -50.204, address: 'Av. Brasil, 200' },
  { id: '3', externalId: 'P-003', latitude: -22.784, longitude: -50.203, address: 'Rua São Paulo, 50' },
  { id: '4', externalId: 'P-004', latitude: -22.789, longitude: -50.207, address: 'Rua Paraná, 300' },
  { id: '5', externalId: 'P-005', latitude: -22.783, longitude: -50.208, address: 'Rua Minas Gerais, 150' },
  { id: '6', externalId: 'P-006', latitude: -22.790, longitude: -50.202, address: 'Av. Paulista, 400' },
  { id: '7', externalId: 'P-007', latitude: -22.786, longitude: -50.200, address: 'Rua Rio de Janeiro, 80' },
  { id: '8', externalId: 'P-008', latitude: -22.782, longitude: -50.205, address: 'Rua Bahia, 220' },
  { id: '9', externalId: 'P-009', latitude: -22.791, longitude: -50.209, address: 'Rua Goiás, 60' },
  { id: '10', externalId: 'P-010', latitude: -22.788, longitude: -50.201, address: 'Rua Santa Catarina, 110' },
];

export interface Occurrence {
  id: string;
  protocol: string;
  postId: string;
  postExternalId: string;
  categoryId: string;
  categoryName: string;
  description: string;
  phone: string;
  latitude: number;
  longitude: number;
  status: OccurrenceStatus;
  priority: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  operatorId?: string;
  operatorName?: string;
  createdAt: string;
  updatedAt: string;
}

export const PRIORITY_LABELS: Record<string, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
};

export const PRIORITY_COLORS: Record<string, string> = {
  BAIXA: 'bg-muted text-muted-foreground',
  MEDIA: 'bg-info/15 text-info',
  ALTA: 'bg-warning/15 text-warning',
  URGENTE: 'bg-destructive/15 text-destructive',
};

export const MOCK_OCCURRENCES: Occurrence[] = [
  {
    id: '1', protocol: 'ZU-2026-0001', postId: '1', postExternalId: 'P-001',
    categoryId: '1', categoryName: 'Lâmpada Queimada', description: 'Lâmpada apagada há 3 dias',
    phone: '(18) 99999-0001', latitude: -22.785, longitude: -50.206,
    status: 'PENDENTE_APROVACAO', priority: 'MEDIA', createdAt: '2026-02-10T14:30:00', updatedAt: '2026-02-10T14:30:00',
  },
  {
    id: '2', protocol: 'ZU-2026-0002', postId: '3', postExternalId: 'P-003',
    categoryId: '3', categoryName: 'Fiação Exposta', description: 'Fios expostos próximo à escola',
    phone: '(18) 99999-0002', latitude: -22.784, longitude: -50.203,
    status: 'APROVADA', priority: 'URGENTE', createdAt: '2026-02-09T10:00:00', updatedAt: '2026-02-09T11:00:00',
  },
  {
    id: '3', protocol: 'ZU-2026-0003', postId: '5', postExternalId: 'P-005',
    categoryId: '2', categoryName: 'Poste Danificado', description: 'Poste com base rachada',
    phone: '(18) 99999-0003', latitude: -22.783, longitude: -50.208,
    status: 'ATRIBUIDA', priority: 'ALTA', operatorId: 'op1', operatorName: 'João Silva',
    createdAt: '2026-02-08T09:15:00', updatedAt: '2026-02-09T08:00:00',
  },
  {
    id: '4', protocol: 'ZU-2026-0004', postId: '7', postExternalId: 'P-007',
    categoryId: '1', categoryName: 'Lâmpada Queimada', description: 'Ponto escuro na rua',
    phone: '(18) 99999-0004', latitude: -22.786, longitude: -50.200,
    status: 'EM_EXECUCAO', priority: 'MEDIA', operatorId: 'op1', operatorName: 'João Silva',
    createdAt: '2026-02-07T16:45:00', updatedAt: '2026-02-10T07:30:00',
  },
  {
    id: '5', protocol: 'ZU-2026-0005', postId: '9', postExternalId: 'P-009',
    categoryId: '4', categoryName: 'Poste Inclinado', description: 'Poste inclinado após vendaval',
    phone: '(18) 99999-0005', latitude: -22.791, longitude: -50.209,
    status: 'FINALIZADA', priority: 'ALTA',  operatorId: 'op2', operatorName: 'Maria Santos',
    createdAt: '2026-02-05T08:00:00', updatedAt: '2026-02-09T17:00:00',
  },
  {
    id: '6', protocol: 'ZU-2026-0006', postId: '2', postExternalId: 'P-002',
    categoryId: '5', categoryName: 'Luminária Quebrada', description: 'Luminária vandalizada',
    phone: '(18) 99999-0006', latitude: -22.787, longitude: -50.204,
    status: 'AGUARDANDO_APROVACAO', priority: 'MEDIA', operatorId: 'op2', operatorName: 'Maria Santos',
    createdAt: '2026-02-06T11:20:00', updatedAt: '2026-02-10T15:00:00',
  },
];

// Haversine distance in meters
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findNearestPost(lat: number, lng: number): Post | null {
  let nearest: Post | null = null;
  let minDist = Infinity;
  for (const post of MOCK_POSTS) {
    const d = haversineDistance(lat, lng, post.latitude, post.longitude);
    if (d < minDist) {
      minDist = d;
      nearest = post;
    }
  }
  return nearest;
}
