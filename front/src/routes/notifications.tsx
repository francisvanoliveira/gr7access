import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useAuth, useAccessRequests } from '@/hooks/use-auth';
import { AppLayout } from '@/components/AppLayout';
import { Bell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export const Route = createFileRoute('/notifications')({
  head: () => ({
    meta: [{ title: 'Notificações — GR7 Access' }],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = useAuth();
  const { requests, approveRequest, denyRequest } = useAccessRequests();
  const [selectedDuration, setSelectedDuration] = useState<Record<string, number>>({});

  if (!user) return <Navigate to="/login" />;

  const pending = requests.filter(r => r.status === 'pending');
  const resolved = requests.filter(r => r.status !== 'pending');

  const durations = [
    { label: '30min', value: 30 },
    { label: '1h', value: 60 },
    { label: '4h', value: 240 },
  ];

  const handleApprove = (id: string) => {
    const duration = selectedDuration[id] || 60;
    approveRequest(id, duration);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (user.level < 2) {
    // N1 sees their own requests
    const myRequests = requests.filter(r => r.requesterId === user.id);
    return (
      <AppLayout>
        <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4">
          <h1 className="text-xl font-bold text-foreground">Minhas Solicitações</h1>
          {myRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma solicitação</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((req, i) => (
                <div key={req.id} className="bg-card border border-border rounded-xl p-4 slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground text-sm">{req.hostName}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      req.status === 'pending' ? 'bg-warning/20 text-warning' :
                      req.status === 'approved' ? 'bg-success/20 text-success' :
                      'bg-destructive/20 text-destructive'
                    }`}>
                      {req.status === 'pending' ? 'Pendente' : req.status === 'approved' ? 'Aprovada' : 'Negada'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{req.clientName}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">"{req.justification}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-5">
        <h1 className="text-xl font-bold text-foreground">Notificações</h1>

        {pending.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pendentes ({pending.length})</h2>
            {pending.map((req, i) => (
              <div key={req.id} className="bg-card border border-border rounded-xl p-4 space-y-3 slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{req.requesterName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{req.hostName} • {req.clientName}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">"{req.justification}"</p>
                  </div>
                  <span className="text-xs text-muted-foreground/50">{formatTime(req.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground mr-1">Tempo:</span>
                  {durations.map(d => (
                    <button
                      key={d.value}
                      onClick={() => setSelectedDuration(prev => ({ ...prev, [req.id]: d.value }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[36px] ${
                        (selectedDuration[req.id] || 60) === d.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(req.id)}
                    className="flex-1 h-11"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Aprovar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => denyRequest(req.id)}
                    className="flex-1 h-11 text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Negar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pending.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma solicitação pendente</p>
          </div>
        )}

        {resolved.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Histórico</h2>
            {resolved.map(req => (
              <div key={req.id} className="bg-card/50 border border-border/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground/70 text-sm">{req.requesterName} → {req.hostName}</h3>
                    <p className="text-xs text-muted-foreground/50">{req.clientName}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    req.status === 'approved' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                  }`}>
                    {req.status === 'approved' ? 'Aprovada' : 'Negada'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
