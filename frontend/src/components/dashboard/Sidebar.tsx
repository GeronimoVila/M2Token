'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Layers
} from 'lucide-react';

const menuItems = [
  { title: 'Inicio', href: '/companies/dashboard', icon: LayoutDashboard },
  { title: 'Proyectos', href: '/companies/projects', icon: Building2 },
  { title: 'Transactions', href: '/companies/remitos', icon: FileText },
  { title: 'Users', href: '/companies/users', icon: Users },
  { title: 'Settings', href: '/companies/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  // Estado inicial
  const [profile, setProfile] = useState({
    name: 'Cargando...',
    email: '...',
    role: 'Usuario'
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return; // Si no hay token, no hacemos nada (o redirigimos)

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        // 1. Obtener datos del Usuario
        const userRes = await fetch(`${API_URL}/users/me`, { headers, credentials: 'include' });
        
        if (!userRes.ok) {
            console.error('Error al obtener usuario');
            setProfile({ name: 'Error', email: '...', role: 'Guest' });
            return;
        }
        
        const userJson = await userRes.json();
        const userData = userJson.success ? userJson.data : userJson;

        // 2. Determinar si buscamos datos de empresa
        const isCompany = userData.role === 'empresa_owner' || userData.role === 'empresa_admin';

        if (isCompany) {
          // Intentamos buscar la empresa
          try {
            const companyRes = await fetch(`${API_URL}/companies/my-company`, { headers, credentials: 'include' });
            
            if (companyRes.ok) {
                const companyJson = await companyRes.json();
                const companyData = companyJson.success ? companyJson.data : companyJson;

                // Verificamos si realmente llegó data de la empresa
                if (companyData) {
                    setProfile({
                        name: companyData.name || userData.name, 
                        email: companyData.contactEmail || userData.email,
                        role: 'Empresa'
                    });
                    return; // Salimos éxito
                }
            }
          } catch (companyError) {
            console.warn("No se pudo cargar la empresa, usando datos de usuario", companyError);
          }
        }

        // 3. Fallback: Si no es empresa o falló la carga de empresa, mostramos datos de usuario
        setProfile({
            name: userData.name || 'Usuario',
            email: userData.email || '...',
            role: userData.role === 'proveedor' ? 'Proveedor' : 'Usuario'
        });

      } catch (error) {
        console.error("Error crítico en sidebar:", error);
        setProfile({ name: 'Usuario', email: 'Error de conexión', role: 'Offline' });
      }
    };

    fetchProfileData();
  }, [API_URL]);

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
      
      {/* 1. Logo Area */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-brand-light/10">
        <div className="h-8 w-8 rounded bg-brand-salmon flex items-center justify-center">
          <Layers className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <h1 className="text-sm font-bold">Token M2</h1>
          <p className="text-xs text-brand-light/70">Tokenization</p>
        </div>
      </div>
      
      {/* 2. Navegación */}
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

      {/* 3. Footer con Perfil y Botón Logout */}
      <div className="p-6 border-t border-brand-light/10 bg-brand-dark">
        <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-brand-light/20 flex items-center justify-center border border-brand-light/30">
                <Users className="h-5 w-5 text-brand-light" />
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate w-[140px]" title={profile.name}>
                  {profile.name}
                </p>
                <p className="text-xs text-brand-light/60 truncate w-[140px]" title={profile.email}>
                  {profile.email}
                </p>
            </div>
        </div>

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