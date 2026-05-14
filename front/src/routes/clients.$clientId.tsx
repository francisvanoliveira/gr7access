import { createFileRoute, Link, useNavigate, Navigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/AppLayout';
import { getHostTypeIcon, getHostTypeLabel, getHostAddressLabel, type HostType, type Host } from '@/lib/mock-data';
import { ArrowLeft, Plus, ChevronRight, Search, Edit2, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { type Client } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const Route = createFileRoute('/clients/$clientId')({
  head: () => ({
    meta: [
      { title: 'Hosts — GR7 Access' },
    ],
  }),
  component: ClientHostsPage,
});

function ClientHostsPage() {
  const { clientId } = Route.useParams();
  const { user, canEdit } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editClientModal, setEditClientModal] = useState(false);
  const [editClientForm, setEditClientForm] = useState({ name: '', description: '' });
  const [form, setForm] = useState<{ name: string; type: HostType; ip: string; username: string; password: string; noteTitle: string; notes: string; attachmentName?: string; attachmentDataUrl?: string }>({
    name: '', type: 'server', ip: '', username: '', password: '', noteTitle: '', notes: '',
  });

  useEffect(() => {
    fetchClient();
  }, [clientId]);

  useEffect(() => {
    if (client?.id) {
      fetchHosts(client.id);
    }
  }, [client?.id]);

  const fetchClient = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/clients/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setClient({ ...data, id: String(data.id) });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchHosts = async (realClientId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/hosts?client_id=${realClientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHosts(data.map((h: any) => ({ ...h, id: String(h.id), clientId: String(h.client_id), notesList: h.notes_list })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return <Navigate to="/login" />;

  const filtered = hosts.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    getHostTypeLabel(h.type).toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <AppLayout>
        <div className="p-4 text-center text-muted-foreground">Carregando...</div>
      </AppLayout>
    );
  }

  if (!client) {
    return (
      <AppLayout>
        <div className="p-4 text-center text-muted-foreground">Cliente não encontrado</div>
      </AppLayout>
    );
  }

  const handleUpdateClient = async () => {
    if (!editClientForm.name.trim() || !client) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/clients/${client.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(editClientForm)
      });
      if (response.ok) {
        await fetchClient();
        setEditClientModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteClient = async () => {
    if (!client || !confirm('Tem certeza que deseja excluir este cliente? Todos os hosts vinculados também serão excluídos.')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/clients/${client.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        navigate({ to: '/' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async () => {
    if (!client || !form.name.trim() || (form.type !== 'notes' && !form.ip.trim())) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/hosts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: client.id,
          name: form.name.trim(),
          type: form.type,
          ip: form.ip.trim(),
          username: form.username,
          password: form.password,
          notes: form.notes,
          noteTitle: form.noteTitle,
        })
      });
      
      if (response.ok) {
        await fetchHosts(client.id);
        setForm({ name: '', type: 'server', ip: '', username: '', password: '', noteTitle: '', notes: '', attachmentName: '', attachmentDataUrl: '' });
        setSheetOpen(false);
      } else {
        console.error('Failed to create host');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const hostTypes: HostType[] = ['server', 'pc', 'printer', 'dvr', 'router', 'switch', 'access', 'email', 'notes'];
  const addressLabel = getHostAddressLabel(form.type);
  const addressPlaceholder = form.type === 'access'
    ? 'https://portal.empresa.com'
    : form.type === 'email'
      ? 'https://webmail.empresa.com ou app Outlook'
      : '192.168.1.1';

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: '/' })}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">{client.name}</h1>
              <p className="text-sm text-muted-foreground">{hosts.length} hosts</p>
            </div>
          </div>
          {canEdit && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setEditClientForm({ name: client.name, description: client.description || '' }); setEditClientModal(true); }}
                className="p-2 text-muted-foreground hover:text-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              {user.level === 3 && (
                <button
                  onClick={handleDeleteClient}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar host..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-11 bg-input/50"
          />
        </div>

        <div className="space-y-3">
          {filtered.map((host, i) => (
            <Link
              key={host.id}
              to="/hosts/$hostId"
              params={{ hostId: host.id }}
              className="block"
            >
              <div
                className="bg-card border border-border rounded-xl p-4 card-hover slide-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-2xl shrink-0">
                    {getHostTypeIcon(host.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{host.name}</h3>
                    <p className="text-sm text-muted-foreground">{getHostTypeLabel(host.type)}</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5 font-mono">{host.ip}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/50 shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {canEdit && (
          <button
            onClick={() => setSheetOpen(true)}
            className="fixed bottom-24 right-4 md:bottom-6 md:right-6 lg:right-8 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg glow-primary-sm hover:scale-105 transition-transform z-30"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </div>

      <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo host</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Servidor Backup" className="mt-1 h-11 bg-input/50" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo</label>
                <div className="mt-1">
                  <Select value={form.type} onValueChange={(val: HostType) => setForm({ ...form, type: val })}>
                    <SelectTrigger className="w-full h-11 bg-input/50">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostTypes.map(t => (
                        <SelectItem key={t} value={t}>
                          <div className="flex items-center gap-2">
                            <span>{getHostTypeIcon(t)}</span>
                            <span>{getHostTypeLabel(t)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {form.type !== 'notes' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{addressLabel}</label>
                    <Input value={form.ip} onChange={e => setForm({ ...form, ip: e.target.value })} placeholder={addressPlaceholder} className="mt-1 h-11 bg-input/50 font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Usuário</label>
                      <Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="admin" className="mt-1 h-11 bg-input/50 font-mono" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Senha</label>
                      <Input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••" className="mt-1 h-11 bg-input/50 font-mono" />
                    </div>
                  </div>
                </>
              )}
              <div className={form.type !== 'notes' ? "space-y-2 border-t border-border pt-3" : "space-y-2"}>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {form.type === 'notes' ? 'Anotação (Obrigatório)' : 'Anotação inicial (opcional)'}
                </label>
                <Input
                  value={form.noteTitle}
                  onChange={e => setForm({ ...form, noteTitle: e.target.value })}
                  placeholder="Título da anotação"
                  className="h-11 bg-input/50"
                />
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Informações, procedimentos, observações..."
                  className="w-full h-32 bg-input/50 border border-border rounded-md p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
          </div>
          <Button
            onClick={handleCreate}
            disabled={!form.name.trim() || (form.type !== 'notes' && !form.ip.trim()) || (form.type === 'notes' && !form.notes.trim())}
            className="w-full h-11 text-base font-semibold mt-2"
          >
            {form.type === 'notes' ? 'Criar anotação' : 'Criar host'}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={editClientModal} onOpenChange={setEditClientModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</label>
              <Input
                value={editClientForm.name}
                onChange={e => setEditClientForm({ ...editClientForm, name: e.target.value })}
                placeholder="Nome do cliente ou empresa"
                className="mt-1 h-11 bg-input/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descrição (opcional)</label>
              <textarea
                value={editClientForm.description}
                onChange={e => setEditClientForm({ ...editClientForm, description: e.target.value })}
                placeholder="Contato, CNPJ, plano de suporte..."
                className="w-full h-24 mt-1 bg-input/50 border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <Button onClick={handleUpdateClient} disabled={!editClientForm.name.trim()} className="w-full h-11 text-base font-semibold">
            Salvar
          </Button>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
