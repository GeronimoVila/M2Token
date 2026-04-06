'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  LogOut,
  Layers,
  UserCircle
} from 'lucide-react';

const menuItems = [
  { title: 'Inicio', href: '/companies/dashboard', icon: LayoutDashboard },
  { title: 'Proyectos', href: '/companies/projects', icon: Building2 },
  { title: 'Equipo', href: '/companies/settings/team', icon: Users },
  { title: 'Mi Perfil', href: '/companies/profile', icon: UserCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const { user, logout } = useAuthStore();

  const visibleMenuItems = menuItems.filter((item) => {
    if (item.href === '/companies/settings/team') {
      return ['empresa_owner', 'empresa_admin', 'empresa_viewer'].includes(user?.role || '');
    }
    return true;
  });

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.warn("Error de conexión al cerrar sesión en el servidor", error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      
      logout(); 
      
      window.location.href = '/auth/login';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <aside className="hidden w-64 flex-col bg-brand-dark text-white md:flex h-screen fixed left-0 top-0 z-30 shadow-2xl border-r border-brand-light/5">
      
      <div className="flex items-center gap-3 px-6 h-24 border-b border-brand-light/10 bg-brand-dark/50 backdrop-blur-sm">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-salmon to-[#e04c42] flex items-center justify-center shadow-lg shadow-brand-salmon/20">
          <Layers className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-wide text-white leading-none">Token M2</span>
          <span className="text-[10px] font-semibold text-brand-light/70 uppercase tracking-widest mt-1.5">Tokenización</span>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-2 relative">
          <div className="text-xs font-semibold text-brand-light/40 uppercase tracking-wider mb-4 px-2">
            Menú Principal
          </div>
          
          {visibleMenuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== '/companies/dashboard');
            
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden",
                  isActive 
                    ? "text-white bg-brand-blue/90 shadow-md shadow-brand-blue/20" 
                    : "text-brand-light/80 hover:bg-white/5 hover:text-white"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                )}
                
                <Icon className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  isActive ? "scale-110 text-white" : "text-brand-light/60 group-hover:scale-110 group-hover:text-brand-light"
                )} />
                <span className="relative z-10">{item.title}</span>
              </Link>
            );
          })}
      </nav>

      <div className="p-5 border-t border-brand-light/10 bg-gradient-to-t from-black/20 to-transparent">
        <div className="flex items-center gap-3 mb-5 px-1">
            <div className="h-10 w-10 rounded-full bg-brand-blue flex items-center justify-center border-2 border-brand-light/20 shrink-0 shadow-inner">
                <span className="text-sm font-bold text-white tracking-wider">
                  {getInitials(user?.name || '')}
                </span>
            </div>
            <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-white truncate w-[140px]" title={user?.name || 'Usuario'}>
                  {user?.name || 'Cargando...'}
                </span>
                <span className="text-xs text-brand-light/60 truncate w-[140px]" title={user?.email || '...'}>
                  {user?.email || '...'}
                </span>
            </div>
        </div>

        <Button 
            onClick={handleLogout}
            variant="outline"
            className="w-full border-brand-light/20 bg-transparent hover:bg-brand-salmon hover:text-white hover:border-brand-salmon transition-all duration-300 text-brand-light group"
        >
            <LogOut className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
}