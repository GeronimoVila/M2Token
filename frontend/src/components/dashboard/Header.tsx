'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bell, Search, HardHat, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  
  const isProvider = pathname.startsWith('/proveedor');

  const getPageTitle = () => {
    if (pathname.includes('/projects')) return 'Proyectos';
    if (pathname.includes('/settings/team')) return 'Equipo de Trabajo';
    if (pathname.includes('/profile')) return 'Mi Perfil';
    if (pathname.includes('/tenders')) return 'Licitaciones';
    if (pathname.includes('/assign')) return 'Asignaciones';
    return 'Panel de Control';
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-20 flex h-24 w-full items-center justify-between border-b border-gray-200/60 bg-white/80 backdrop-blur-md px-4 sm:px-8 shadow-sm transition-all duration-300">

      <div className="flex flex-col gap-1 min-w-[200px]">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-extrabold text-brand-dark tracking-tight">
            {getPageTitle()}
          </h2>
        </div>

        {(pathname.endsWith('/dashboard') || pathname === '/proveedor' || pathname === '/companies/dashboard') && (
          <p className="text-sm text-gray-500 font-medium">
            ¡Hola, {user?.name?.split(' ')[0] || 'Usuario'}! Aquí está tu resumen de hoy.
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 sm:gap-6 shrink-0">

        <div className="hidden md:block h-8 w-px bg-gray-200"></div>

        <div className="flex items-center gap-3 sm:gap-4">
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-gray-500 hover:text-brand-dark hover:bg-brand-light/20 transition-colors rounded-full h-11 w-11"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-brand-salmon border-2 border-white animate-pulse"></span>
          </Button>

          <button className="h-11 w-11 rounded-full bg-gradient-to-br from-brand-light/40 to-brand-light/10 border border-brand-light/50 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-brand-blue/50 hover:border-brand-blue transition-all duration-300 shadow-sm">
            {user?.name ? (
              <span className="text-sm font-extrabold text-brand-blue tracking-wider">
                {getInitials(user.name)}
              </span>
            ) : (
              <div className="h-full w-full bg-gradient-to-tr from-brand-blue to-brand-light opacity-50 animate-pulse" />
            )}
          </button>
          
        </div>
      </div>
    </header>
  );
}