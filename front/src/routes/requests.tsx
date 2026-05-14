import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/AppLayout';
import { Shield, Clock, Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/requests')({
  head: () => ({
    meta: [{ title: 'Solicitações — GR7 Access' }],
  }),
  component: RequestsPage,
});

function RequestsPage() {
  const { user, canEdit } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedTimes, setSelectedTimes] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/access-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (!Array.isArray(data)) {
           setErrorMsg('API didn\'t return an array: ' + JSON.stringify(data));
           return;
        }
        setRequests(data);
        
        // Inicializa o tempo selecionado como 60 minutos (1h) por padrão
        const times: Record<number, number> = {};
        data.forEach((r: any) => {
          if (r.status === 'pending') times[r.id] = 60;
        });
        setSelectedTimes(times);
      } else {
        const err = await response.text();
        setErrorMsg(`HTTP ${response.status}: ${err}`);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(`Catch Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Navigate to="/login" />;

  const handleApprove = async (id: number, durationMinutes: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/access-requests/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ duration_minutes: durationMinutes })
      });
      if (response.ok) {
        fetchRequests();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/access-requests/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        fetchRequests();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pending = requests.filter(r => r.status === 'pending');
  const history = requests.filter(r => r.status !== 'pending');

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6 fade-in">
        <h1 className="text-xl font-bold text-foreground">Solicitações de Acesso</h1>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg text-sm">
            Erro ao carregar solicitações: {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Aguardando Aprovação</h2>
          
          {pending.length === 0 && !loading && (
            <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center">
              <Shield className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Nenhuma solicitação pendente no momento.</p>
            </div>
          )}

          {pending.map((req, i) => (
            <div
              key={req.id}
              className="bg-[#0f0f0f] border border-border/10 rounded-xl p-5 slide-up max-w-xl"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[15px] font-semibold text-white">{req.user?.name}</span>
                    <span className="text-[13px] text-muted-foreground">
                      {new Date(req.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <p className="text-[13px] text-muted-foreground/80 mb-2">
                    <span className="text-blue-400/80">{req.host?.name || 'Recurso'}</span>
                    {req.client?.name ? ` • ${req.client.name}` : ''}
                  </p>
                  
                  {req.reason && (
                    <p className="text-[13px] text-muted-foreground mb-4 italic">
                      "{req.reason}"
                    </p>
                  )}
                </div>
                
                {canEdit && (
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[13px] text-muted-foreground">Tempo:</span>
                  <div className="flex items-center gap-2">
                    {[
                      { label: '30min', value: 30 },
                      { label: '1h', value: 60 },
                      { label: '4h', value: 240 }
                    ].map((opt) => {
                      const isSelected = selectedTimes[req.id] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setSelectedTimes(prev => ({ ...prev, [req.id]: opt.value }))}
                          className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                            isSelected 
                              ? 'bg-white text-black' 
                              : 'bg-white/5 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                )}

                {canEdit ? (
                <div className="flex items-center gap-3 mt-2">
                  <Button 
                    onClick={() => handleApprove(req.id, selectedTimes[req.id] || 60)} 
                    className="flex-1 bg-white text-black hover:bg-white/90 h-11 rounded-xl text-sm font-semibold"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button 
                    onClick={() => handleReject(req.id)} 
                    variant="outline" 
                    className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-500 h-11 rounded-xl bg-transparent text-sm font-medium"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Negar
                  </Button>
                </div>
                ) : (
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/20">
                      <Clock className="w-3 h-3" /> Aguardando aprovação
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {history.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-border">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Histórico</h2>
            
            <div className="space-y-3">
              {history.map((req) => (
                <div key={req.id} className="bg-card/50 border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 opacity-75">
                  <div>
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{req.user?.name}</span> acessou <span className="font-medium">{req.host?.name || req.client?.name}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {new Date(req.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {req.status === 'approved' ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
                        <Check className="w-3 h-3" /> Aprovado por {req.approver?.name?.split(' ')[0]}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-destructive bg-destructive/10 px-2.5 py-1 rounded-full border border-destructive/20">
                        <X className="w-3 h-3" /> Rejeitado
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
