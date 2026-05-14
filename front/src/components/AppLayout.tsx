import { useEffect } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useAuth } from '@/hooks/use-auth';
import { useAccessRequests } from '@/hooks/use-auth';
import {
  Building2,
  Bell,
  Users,
  UserCircle,
  Shield,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, canManageUsers, logout } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [realPendingCount, setRealPendingCount] = useState(0);

  useEffect(() => {
    if (user && user.level >= 2) {
      const fetchCount = async () => {
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
            if (Array.isArray(data)) {
              setRealPendingCount(data.filter(r => r.status === 'pending').length);
            }
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchCount();
      const interval = setInterval(fetchCount, 30000); // refresh every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  if (!user) return null;

  const navItems = [
    { to: '/' as const, label: 'Clientes', icon: Building2, badge: 0 },
    { to: '/requests' as const, label: 'Solicitações', icon: Shield, badge: user.level >= 2 ? realPendingCount : 0 },
    ...(canManageUsers ? [{ to: '/users' as const, label: 'Usuários', icon: Users, badge: 0 }] : []),
    { to: '/profile' as const, label: 'Perfil', icon: UserCircle, badge: 0 },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface border-r border-border fixed inset-y-0 left-0 z-40">
        <div className="p-5 flex items-center gap-3 border-b border-border">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">GR7 Access</h1>
            <p className="text-xs text-muted-foreground">Cofre Corporativo</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive(item.to)
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {'badge' in item && item.badge > 0 && (
                <span className="ml-auto bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
              N{user.level}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full px-2 py-1.5"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Tablet drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <aside
            className="absolute inset-y-0 left-0 w-72 bg-surface border-r border-border p-4 slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">GR7 Access</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-2 text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.to)
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {'badge' in item && item.badge > 0 && (
                    <span className="ml-auto bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 pb-20 md:pb-0">
        {/* Tablet header with menu */}
        <header className="hidden md:flex lg:hidden items-center gap-3 px-4 h-14 border-b border-border sticky top-0 bg-background/90 backdrop-blur-sm z-30">
          <button onClick={() => setDrawerOpen(true)} className="p-2 text-muted-foreground hover:text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm text-foreground">GR7 Access</span>
          </div>
        </header>

        <main className="fade-in">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 md:hidden bg-surface border-t border-border z-40 bottom-nav-safe">
        <div className="flex items-center justify-around h-16">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-1 min-w-[48px] min-h-[48px] px-3 transition-colors ${
                isActive(item.to) ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {'badge' in item && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-destructive text-destructive-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
