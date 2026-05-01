import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/login')({
  head: () => ({
    meta: [
      { title: 'Login — GR7 Access' },
      { name: 'description', content: 'Acesse o cofre de senhas corporativo' },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    login(email, password).then((user) => {
      if (user) {
        navigate({ to: '/' });
      } else {
        setError('E-mail ou senha incorretos');
      }
      setLoading(false);
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm space-y-8 fade-in">
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center glow-primary">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">GR7 Access</h1>
          <p className="text-sm text-muted-foreground">Cofre de senhas corporativo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">E-mail</label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-12 bg-input/50"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Senha</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-12 bg-input/50 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base font-semibold glow-primary-sm"
          >
            {loading ? (
              <Lock className="w-5 h-5 animate-pulse" />
            ) : (
              'Entrar'
            )}
          </Button>
        </form>


      </div>
    </div>
  );
}
