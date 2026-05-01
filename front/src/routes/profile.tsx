import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/AppLayout';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/profile')({
  head: () => ({
    meta: [{ title: 'Perfil — GR7 Access' }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" />;

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  const levelLabels = { 1: 'Júnior', 2: 'Técnico', 3: 'Administrador' } as const;

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6 fade-in">
        <h1 className="text-xl font-bold text-foreground">Perfil</h1>

        <div className="flex flex-col items-center py-6 space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center glow-primary">
            <User className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          <div className="p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Nível de acesso</span>
            <span className="text-sm font-semibold text-primary">
              N{user.level} — {levelLabels[user.level as keyof typeof levelLabels]}
            </span>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className="text-sm font-semibold text-success">Ativo</span>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Versão</span>
            <span className="text-sm text-muted-foreground/70">GR7 Access v1.0</span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-12 text-destructive hover:text-destructive"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sair da conta
        </Button>
      </div>
    </AppLayout>
  );
}
