import { createFileRoute, Link, Navigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/AppLayout';
import { Building2, Search, Plus, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { type Client } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Clientes — GR7 Access' },
      { name: 'description', content: 'Gerencie clientes e suas credenciais' },
    ],
  }),
  component: ClientsPage,
});

function ClientsPage() {
  const { user, canEdit } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data.map((c: any) => ({ ...c, id: String(c.id) })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return <Navigate to="/login" />;

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name: name.trim(), description: description.trim() })
      });
      
      if (response.ok) {
        await fetchClients();
        setName('');
        setDescription('');
        setSheetOpen(false);
      } else {
        console.error('Failed to create client');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground md:hidden">Clientes</h1>
          <h1 className="text-2xl font-bold text-foreground hidden md:block">Clientes</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-11 bg-input/50"
          />
        </div>

        <div className="space-y-3">
          {filtered.map((client, i) => (
            <Link
              key={client.id}
              to="/clients/$clientId"
              params={{ clientId: client.id }}
              className="block"
            >
              <div
                className="bg-card border border-border rounded-xl p-4 card-hover slide-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{client.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{client.description}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">{client.hostsCount} hosts</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/50 shrink-0" />
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nenhum cliente encontrado</p>
          )}
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
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Empresa Delta"
                className="mt-1 h-11 bg-input/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descrição</label>
              <Input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Breve descrição do cliente"
                className="mt-1 h-11 bg-input/50"
              />
            </div>
          </div>
          <Button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="w-full h-11 text-base font-semibold"
          >
            Criar cliente
          </Button>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
