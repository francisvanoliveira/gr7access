import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

export function ForceChangePasswordModal() {
  const { user, updatePasswordStatus, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user || !user.must_change_password) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      return setError('A senha deve ter no mínimo 8 caracteres.');
    }
    if (!/[A-Z]/.test(password)) {
      return setError('A senha deve conter pelo menos uma letra maiúscula.');
    }
    if (!/[0-9]/.test(password)) {
      return setError('A senha deve conter pelo menos um número.');
    }
    if (!/[@$!%*#?&]/.test(password)) {
      return setError('A senha deve conter um caractere especial (@, $, !, %, *, #, ?, &).');
    }
    if (password !== passwordConfirmation) {
      return setError('As senhas não coincidem.');
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          password,
          password_confirmation: passwordConfirmation
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Erro ao alterar a senha.');
      } else {
        updatePasswordStatus(false);
      }
    } catch (err) {
      setError('Erro de conexão ao tentar alterar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md p-6 rounded-xl border border-border shadow-2xl">
        <h2 className="text-2xl font-bold text-foreground mb-2">Atualização Necessária</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Por motivos de segurança, você precisa definir uma nova senha antes de continuar.
        </p>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4 border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nova Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Min. 8 caracteres, maiúsculas, números e símbolos"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Confirmar Nova Senha</label>
            <input
              type="password"
              required
              value={passwordConfirmation}
              onChange={e => setPasswordConfirmation(e.target.value)}
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={logout}
              className="flex-1 flex items-center justify-center rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Sair
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Atualizando...' : 'Atualizar Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
