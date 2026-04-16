'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import NotificationBell from '@/components/layout/NotificationBell';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from 'react';

export function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);
  
  const getPageTitle = () => {
    if (pathname.includes('/users')) return 'Gestión de Usuarios';
    if (pathname.includes('/logs')) return 'Logs de Auditoría';
    if (pathname.includes('/settings')) return 'Configuración Global';
    if (pathname.includes('/projects')) return 'Proyectos';
    return 'Panel de Control';
  };

  const getInitials = (name: string) => {
    if (!name) return 'SA';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-20 flex h-24 w-full items-center justify-between border-b border-gray-200/60 bg-white/80 backdrop-blur-md px-4 sm:px-8 shadow-sm transition-all duration-300">

      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-500">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-brand-dark border-none text-white">
               <div className="p-6 font-bold text-xl border-b border-white/10">Token M2 Admin</div>
               <div className="p-4">Menu en construcción...</div> 
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-col gap-1 min-w-[200px]">
          <h2 className="text-2xl font-extrabold text-brand-dark tracking-tight">
            {getPageTitle()}
          </h2>
          {pathname === '/admin' && (
            <p className="text-sm text-gray-500 font-medium">
              ¡Hola, {user?.name?.split(' ')[0] || 'Administrador'}!
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
        <div className="hidden md:block h-8 w-px bg-gray-200"></div>
        <div className="flex items-center gap-3 sm:gap-4">
          <NotificationBell />
          <button className="h-11 w-11 rounded-full bg-gradient-to-br from-brand-light/40 to-brand-light/10 border border-brand-light/50 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-brand-blue/50 hover:border-brand-blue transition-all duration-300 shadow-sm">
            {user?.name ? (
              <span className="text-sm font-extrabold text-brand-blue tracking-wider">
                {getInitials(user.name)}
              </span>
            ) : (
              <span className="text-sm font-extrabold text-brand-blue tracking-wider">SA</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}