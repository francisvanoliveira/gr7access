export type UserLevel = 1 | 2 | 3;

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  level: UserLevel;
  active: boolean;
  must_change_password?: boolean;
  last_login_at?: string;
}

export interface Client {
  id: string;
  name: string;
  slug?: string;
  description: string;
  hostsCount: number;
}

export type HostType = 'server' | 'pc' | 'printer' | 'dvr' | 'router' | 'switch' | 'access' | 'email' | 'notes';

export interface HostNote {
  id: string;
  title?: string;
  text: string;
  createdAt: number;
  authorName?: string;
  attachmentName?: string;
  attachmentDataUrl?: string;
}

export interface Host {
  id: string;
  clientId: string;
  name: string;
  type: HostType;
  ip: string;
  username: string;
  password: string;
  notes: string;
  notesList?: HostNote[];
  has_access?: boolean;
  access_expires_at?: string;
}

export interface AccessRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  hostId: string;
  hostName: string;
  clientName: string;
  justification: string;
  status: 'pending' | 'approved' | 'denied';
  approvedDuration?: number; // minutes
  approvedAt?: number; // timestamp
  createdAt: number;
}

export const mockUsers: User[] = [
  { id: 'u1', name: 'Admin Silva', email: 'admin@empresa.com', password: '123456', level: 3, active: true },
  { id: 'u2', name: 'Carlos Técnico', email: 'tecnico@empresa.com', password: '123456', level: 2, active: true },
  { id: 'u3', name: 'Ana Júnior', email: 'junior@empresa.com', password: '123456', level: 1, active: true },
];

export const mockClients: Client[] = [
  { id: 'c1', name: 'Empresa Alpha', description: 'Consultoria em TI e desenvolvimento de software', hostsCount: 4 },
  { id: 'c2', name: 'Loja Beta', description: 'Rede de varejo com 5 filiais', hostsCount: 3 },
  { id: 'c3', name: 'Escritório Gamma', description: 'Escritório de advocacia corporativa', hostsCount: 3 },
];

export const mockHosts: Host[] = [
  // Empresa Alpha
  { id: 'h1', clientId: 'c1', name: 'Servidor Principal', type: 'server', ip: '192.168.1.10', username: 'administrator', password: 'S3rv@Alpha#2024', notes: 'Servidor Windows Server 2022. Reiniciar serviço IIS caso o site fique fora.\nBackup automático às 02:00.' },
  { id: 'h2', clientId: 'c1', name: 'PC Financeiro', type: 'pc', ip: '192.168.1.25', username: 'financeiro', password: 'Fin@nc3ir0!', notes: 'Computador do setor financeiro. Software ERP instalado.\nNão atualizar Windows sem autorização.' },
  { id: 'h3', clientId: 'c1', name: 'Impressora HP', type: 'printer', ip: '192.168.1.50', username: 'admin', password: 'hp@dmin123', notes: 'HP LaserJet Pro. Painel web na porta 80.\nToner substituído em Jan/2025.' },
  { id: 'h4', clientId: 'c1', name: 'DVR Câmeras', type: 'dvr', ip: '192.168.1.100', username: 'admin', password: 'Dvr#C4m2024', notes: 'Intelbras MHDX 3108. 8 canais, 6 em uso.\nPorta web: 8080 | Porta mobile: 37777' },
  // Loja Beta
  { id: 'h5', clientId: 'c2', name: 'Servidor PDV', type: 'server', ip: '10.0.0.1', username: 'root', password: 'R00t@Beta!', notes: 'Linux Ubuntu Server. Sistema de PDV rodando.\nServidor crítico — não reiniciar em horário comercial.' },
  { id: 'h6', clientId: 'c2', name: 'Roteador Mikrotik', type: 'router', ip: '10.0.0.254', username: 'admin', password: 'Mkt@B3t4Net', notes: 'Mikrotik RB750. Controla toda a rede.\nFirewall configurado com regras específicas.' },
  { id: 'h7', clientId: 'c2', name: 'Switch Gerenciável', type: 'switch', ip: '10.0.0.253', username: 'admin', password: 'Sw1tch#2024', notes: 'TP-Link TL-SG3428. VLANs configuradas.\nPortas 1-8: PDV | Portas 9-16: Admin' },
  // Escritório Gamma
  { id: 'h8', clientId: 'c3', name: 'Servidor AD', type: 'server', ip: '172.16.0.1', username: 'administrador', password: 'AD@Gamma#Srv', notes: 'Windows Server 2019 com Active Directory.\nDNS e DHCP centralizados neste servidor.' },
  { id: 'h9', clientId: 'c3', name: 'PC Recepção', type: 'pc', ip: '172.16.0.30', username: 'recepcao', password: 'Rec3p@2024', notes: 'PC da recepção. Apenas acesso ao sistema de agendamento.\nBloqueio USB ativo.' },
  { id: 'h10', clientId: 'c3', name: 'DVR Portaria', type: 'dvr', ip: '172.16.0.200', username: 'admin', password: 'G4mma#Dvr!', notes: 'Hikvision DS-7208. 4 câmeras na portaria.\nAcesso remoto via Hik-Connect.' },
];

export const initialRequests: AccessRequest[] = [
  {
    id: 'r1',
    requesterId: 'u3',
    requesterName: 'Ana Júnior',
    hostId: 'h1',
    hostName: 'Servidor Principal',
    clientName: 'Empresa Alpha',
    justification: 'Preciso verificar os logs do IIS para investigar erro 500 reportado pelo cliente.',
    status: 'pending',
    createdAt: Date.now() - 1000 * 60 * 15,
  },
];

export function getHostTypeIcon(type: HostType): string {
  const icons: Record<HostType, string> = {
    server: '🖥️',
    pc: '💻',
    printer: '🖨️',
    dvr: '📹',
    router: '📡',
    switch: '🔀',
    access: '🌐',
    email: '✉️',
    notes: '📝',
  };
  return icons[type];
}

export function getHostTypeLabel(type: HostType): string {
  const labels: Record<HostType, string> = {
    server: 'Servidor',
    pc: 'Computador',
    printer: 'Impressora',
    dvr: 'DVR',
    router: 'Roteador',
    switch: 'Switch',
    access: 'Acesso',
    email: 'Email',
    notes: 'Anotações',
  };
  return labels[type];
}

export function getHostAddressLabel(type: HostType): string {
  if (type === 'access') return 'Endereço';
  if (type === 'email') return 'Acesso (Link/App)';
  return 'IP';
}
