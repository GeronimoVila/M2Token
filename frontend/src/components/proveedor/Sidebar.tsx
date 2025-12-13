'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  HardHat,
  UserCircle,
  LogOut,
  Layers
} from 'lucide-react';

const menuItems = [
  { title: 'Inicio', href: '/proveedor', icon: LayoutDashboard },
  { title: 'Mis Proyectos', href: '/proveedor/projects', icon: HardHat },
  { title: 'Mi Perfil', href: '/proveedor/profile', icon: UserCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    } catch (error) {
      localStorage.clear();
      window.location.href = '/auth/login';
    }
  };

  return (
    <aside className="hidden w-64 flex-col bg-brand-dark text-white md:flex h-screen fixed left-0 top-0 z-30 shadow-xl">
      
      <div className="flex items-center gap-3 px-6 h-20 border-b border-brand-light/10">
        <div className="h-8 w-8 rounded bg-brand-blue flex items-center justify-center">
          <Layers className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <h1 className="text-sm font-bold">Portal Proveedor</h1>
          <p className="text-xs text-brand-light/70">M2Token</p>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-brand-blue text-white shadow-md" 
                    : "text-brand-light/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
      </nav>

      <div className="p-6 border-t border-brand-light/10 bg-brand-dark">
        <Button 
            onClick={handleLogout}
            className="w-full bg-brand-salmon hover:bg-brand-salmon/90 text-white font-medium shadow-lg shadow-brand-salmon/20"
        >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}