import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/AppLayout';
import { useState, useEffect } from 'react';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';

export const Route = createFileRoute('/logs')({
  head: () => ({
    meta: [{ title: 'Auditoria de Logs — GR7 Access' }],
  }),
  component: LogsPage,
});

interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  created_at: string;
  entity_name?: string;
  client_name?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

function LogsPage() {
  const { user, isN3 } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/logs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Navigate to="/login" />;
  if (!isN3) return <Navigate to="/" />;

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      login: 'Login',
      logout: 'Logout',
      failed_login_wrong_password: 'Senha Incorreta',
      failed_login_inactive: 'Tentativa Bloqueada (Inativo)',
      created: 'Criação',
      updated: 'Edição',
      deleted: 'Exclusão',
      password_changed: 'Troca de Senha',
    };
    return labels[action] || action;
  };

  const getActionColor = (action: string) => {
    if (action.includes('failed') || action === 'deleted') return 'text-destructive bg-destructive/10';
    if (action === 'created' || action === 'login') return 'text-success bg-success/10';
    if (action === 'updated' || action === 'password_changed') return 'text-primary bg-primary/10';
    return 'text-muted-foreground bg-muted';
  };

  const formatValue = (key: string, val: any): React.ReactNode => {
    if (val === null || val === undefined) return <span className="text-muted-foreground italic">vazio</span>;
    
    if (key === 'password') {
      if (val === '***') return <span className="text-muted-foreground italic">*** (oculta)</span>;
      return <span className="font-mono">{val}</span>;
    }

    if (key === 'attachmentDataUrl' || (typeof val === 'string' && val.startsWith('data:'))) {
      return <span className="text-blue-400 font-medium text-xs">[Arquivo Anexo]</span>;
    }
    
    if (key === 'notes_list') {
      let parsed = val;
      if (typeof val === 'string') {
        try { parsed = JSON.parse(val); } catch (e) {}
      }
      if (Array.isArray(parsed)) {
        return <span className="text-xs bg-accent px-2 py-0.5 rounded-full">{parsed.length} anotação(ões)</span>;
      }
    }
  
    if (typeof val === 'boolean') {
      return val ? 'Ativo/Sim' : 'Inativo/Não';
    }
  
    if (typeof val === 'object') {
      return <pre className="text-[10px] mt-1 bg-background/50 p-2 rounded">{JSON.stringify(val, null, 2)}</pre>;
    }
  
    if (typeof val === 'string' && val.length > 200) {
      return val.substring(0, 200) + '...';
    }
  
    return String(val);
  };

  const renderChanges = (values: any) => {
    if (!values || typeof values !== 'object') return <span className="text-muted-foreground text-xs">Nenhum dado</span>;
    
    const entries = Object.entries(values).filter(([k]) => k !== 'updated_at' && k !== 'created_at');
    if (entries.length === 0) return <span className="text-muted-foreground text-xs">-</span>;
  
    const friendlyNames: Record<string, string> = {
      name: 'Nome',
      email: 'E-mail',
      level: 'Nível de Acesso',
      active: 'Status',
      client_id: 'ID do Cliente',
      type: 'Tipo de Dispositivo',
      ip: 'Endereço / IP',
      username: 'Nome de Usuário',
      password: 'Senha',
      notes_list: 'Anotações / Anexos',
      description: 'Descrição',
      slug: 'URL / Slug',
      email_attempt: 'E-mail tentado'
    };
  
    return (
      <ul className="space-y-3">
        {entries.map(([key, val]) => {
          const label = friendlyNames[key] || key;
          return (
            <li key={key} className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">{label}</span>
              <div className="text-sm text-foreground/90 break-words">{formatValue(key, val)}</div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-4">
        <h1 className="text-xl font-bold text-foreground">Auditoria do Sistema</h1>
        <p className="text-sm text-muted-foreground mb-6">Registro imutável de atividades realizadas no sistema.</p>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">Carregando logs...</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="bg-card border border-border rounded-xl p-4 slide-up">
                <div 
                  className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4 cursor-pointer"
                  onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                >
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                      <Activity className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {log.user ? log.user.name : 'Sistema / Desconhecido'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('pt-BR')} • IP: {log.ip_address || '-'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex flex-col md:items-end">
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${getActionColor(log.action)} uppercase tracking-wider`}>
                        {getActionLabel(log.action)}
                      </span>
                      {log.entity_type && (
                        <p className="text-xs text-muted-foreground mt-1 md:text-right">
                          {log.entity_type === 'Host' ? 'Host' : log.entity_type === 'Client' ? 'Cliente' : log.entity_type === 'User' ? 'Usuário' : log.entity_type}
                          {log.entity_name ? ` - ${log.entity_name}` : (log.entity_id ? ` #${log.entity_id}` : '')}
                          {log.client_name ? ` (${log.client_name})` : ''}
                        </p>
                      )}
                    </div>
                    {(log.old_values || log.new_values) ? (
                      <button className="p-1 text-muted-foreground hover:text-primary">
                        {expandedLogId === log.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    ) : (
                      <div className="w-7"></div>
                    )}
                  </div>
                </div>

                {expandedLogId === log.id && (log.old_values || log.new_values) && (
                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
                    {log.old_values && (
                      <div className="bg-destructive/5 rounded-xl p-4 border border-destructive/10">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-2 h-2 rounded-full bg-destructive" />
                          <p className="text-xs font-bold text-destructive uppercase tracking-wider">Como Era (Antes)</p>
                        </div>
                        {renderChanges(log.old_values)}
                      </div>
                    )}
                    {log.new_values && (
                      <div className="bg-success/5 rounded-xl p-4 border border-success/10">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-2 h-2 rounded-full bg-success" />
                          <p className="text-xs font-bold text-success uppercase tracking-wider">Como Ficou (Depois)</p>
                        </div>
                        {renderChanges(log.new_values)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhum log encontrado</p>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
