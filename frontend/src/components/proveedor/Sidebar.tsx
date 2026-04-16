'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  LayoutDashboard, 
  HardHat, 
  UserCircle, 
  LogOut,
  Layers,
  Megaphone,
  Menu
} from 'lucide-react';

const menuItems = [
  { title: 'Inicio', href: '/proveedor', icon: LayoutDashboard },
  { title: 'Mis Proyectos', href: '/proveedor/projects', icon: HardHat },
  { title: 'Licitaciones', href: '/proveedor/tenders', icon: Megaphone },
  { title: 'Mi Perfil', href: '/proveedor/profile', icon: UserCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { logout } = useAuthStore();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => { setOpen(false); }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      logout(); 
      window.location.href = '/auth/login';
    }
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-brand-dark text-white">
      <div className="flex items-center gap-3 px-6 h-24 border-b border-brand-light/10 bg-brand-dark/50 backdrop-blur-sm">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-salmon to-[#e04c42] flex items-center justify-center shadow-lg shadow-brand-salmon/20">
          <Layers className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-wide">Token M2</span>
          <span className="text-[10px] font-semibold text-brand-light/70 uppercase tracking-widest mt-1.5">Portal Proveedor</span>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-2">
        <div className="text-xs font-semibold text-brand-light/40 uppercase tracking-wider mb-4 px-2">Menú Principal</div>
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== '/proveedor');
          return (
            <Link key={index} href={item.href} className={cn(
              "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden",
              isActive ? "text-white bg-brand-blue/90 shadow-md shadow-brand-blue/20" : "text-brand-light/80 hover:bg-white/5 hover:text-white"
            )}>
              {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />}
              <Icon className={cn("h-5 w-5 transition-transform", isActive ? "scale-110" : "text-brand-light/60 group-hover:scale-110")} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-5 border-t border-brand-light/10">
        <Button onClick={handleLogout} variant="outline" className="w-full border-brand-light/20 bg-transparent hover:bg-brand-salmon hover:text-white text-brand-light">
          <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden fixed top-6 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-white border-gray-200 shadow-md h-11 w-11 rounded-xl">
              <Menu className="h-6 w-6 text-brand-dark" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-brand-dark border-none">
            {SidebarContent}
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden md:flex w-64 flex-col bg-brand-dark text-white h-screen fixed left-0 top-0 z-30 shadow-2xl border-r border-brand-light/5">
        {SidebarContent}
      </aside>
    </>
  );
}