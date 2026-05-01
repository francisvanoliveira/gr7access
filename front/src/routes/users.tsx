import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/AppLayout';
import { type User, type UserLevel } from '@/lib/mock-data';
import { Plus, MoreVertical, UserCheck, UserX, Edit2, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/users')({
  head: () => ({
    meta: [{ title: 'Usuários — GR7 Access' }],
  }),
  component: UsersPage,
});

function UsersPage() {
  const { user, canManageUsers } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', level: 1 as UserLevel });
  const [editUser, setEditUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.map((u: any) => ({ ...u, id: String(u.id), active: u.active === 1 || u.active === true })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return <Navigate to="/login" />;
  if (!canManageUsers) return <Navigate to="/" />;

  const toggleActive = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        await fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
    setMenuOpen(null);
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(newUser)
      });
      
      if (response.ok) {
        await fetchUsers();
        setNewUser({ name: '', email: '', password: '', level: 1 as UserLevel });
        setShowNew(false);
      } else {
        console.error('Failed to create user');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateUser = async () => {
    if (!editUser || !editUser.name || !editUser.email) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${editUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(editUser)
      });
      if (response.ok) {
        await fetchUsers();
        setEditUser(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        await fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
    setMenuOpen(null);
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4">
        <h1 className="text-xl font-bold text-foreground">Usuários</h1>

        <div className="space-y-3">
          {users.map((u, i) => (
            <div
              key={u.id}
              className="bg-card border border-border rounded-xl p-4 slide-up relative"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  u.active ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  N{u.level}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground text-sm">{u.name}</h3>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      u.active ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                    }`}>
                      {u.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <button
                  onClick={() => setMenuOpen(menuOpen === u.id ? null : u.id)}
                  className="p-2 text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {menuOpen === u.id && (
                <div className="absolute right-4 top-14 bg-popover border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                  <button
                    onClick={() => toggleActive(u.id)}
                    className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-accent w-full min-h-[48px]"
                  >
                    {u.active ? (
                      <>
                        <UserX className="w-4 h-4 text-destructive" />
                        <span className="text-destructive">Desativar</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 text-success" />
                        <span className="text-success">Ativar</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => { setEditUser(u); setMenuOpen(null); }}
                    className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-accent w-full min-h-[48px]"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-destructive/10 text-destructive w-full min-h-[48px]"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowNew(true)}
          className="fixed bottom-24 right-4 md:bottom-6 md:right-6 lg:right-8 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg glow-primary-sm hover:scale-105 transition-transform z-30"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* New user bottom sheet */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0" onClick={() => setShowNew(false)}>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 inset-x-0 md:relative md:bottom-auto md:w-full md:max-w-md bg-card border-t md:border border-border rounded-t-2xl md:rounded-2xl p-6 space-y-4 slide-up bottom-nav-safe md:pb-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-border mx-auto md:hidden" />
            <h3 className="text-lg md:text-xl font-bold text-foreground">Novo Usuário</h3>
            <div className="space-y-3 md:space-y-4">
              <Input placeholder="Nome" value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} className="h-11 bg-input/50" />
              <Input placeholder="E-mail" type="email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} className="h-11 bg-input/50" />
              <Input placeholder="Senha" type="password" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} className="h-11 bg-input/50" />
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Nível de acesso</label>
                <div className="flex gap-2">
                  {([1, 2, 3] as UserLevel[]).map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setNewUser(p => ({ ...p, level: lvl }))}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                        newUser.level === lvl ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      Nível {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="pt-2 flex gap-3">
              <Button variant="outline" onClick={() => setShowNew(false)} className="hidden md:flex flex-1 h-12">
                Cancelar
              </Button>
              <Button onClick={handleAddUser} className="w-full md:flex-1 h-12 text-base font-semibold">
                Cadastrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit user bottom sheet */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0" onClick={() => setEditUser(null)}>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 inset-x-0 md:relative md:bottom-auto md:w-full md:max-w-md bg-card border-t md:border border-border rounded-t-2xl md:rounded-2xl p-6 space-y-4 slide-up bottom-nav-safe md:pb-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-border mx-auto md:hidden" />
            <h3 className="text-lg md:text-xl font-bold text-foreground">Editar Usuário</h3>
            <div className="space-y-3 md:space-y-4">
              <Input placeholder="Nome" value={editUser.name} onChange={e => setEditUser(p => p ? { ...p, name: e.target.value } : null)} className="h-11 bg-input/50" />
              <Input placeholder="E-mail" type="email" value={editUser.email} onChange={e => setEditUser(p => p ? { ...p, email: e.target.value } : null)} className="h-11 bg-input/50" />
              <Input placeholder="Nova Senha (opcional)" type="password" value={editUser.password || ''} onChange={e => setEditUser(p => p ? { ...p, password: e.target.value } : null)} className="h-11 bg-input/50" />
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Nível de acesso</label>
                <div className="flex gap-2">
                  {([1, 2, 3] as UserLevel[]).map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setEditUser(p => p ? { ...p, level: lvl } : null)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                        editUser.level === lvl ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      Nível {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="pt-2 flex gap-3">
              <Button variant="outline" onClick={() => setEditUser(null)} className="hidden md:flex flex-1 h-12">
                Cancelar
              </Button>
              <Button onClick={handleUpdateUser} className="w-full md:flex-1 h-12 text-base font-semibold">
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
