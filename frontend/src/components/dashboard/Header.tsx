'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bell, Search, User } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-20 w-full items-center justify-between border-b border-gray-100 bg-white px-8 shadow-sm">
      {/* Izquierda: Título de la sección actual (Simulado) */}
      <h2 className="text-2xl font-bold text-brand-dark">Dashboard</h2>

      {/* Derecha: Buscador y Acciones */}
      <div className="flex items-center gap-6">
        {/* Campana de Notificaciones */}
        <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-brand-dark hover:bg-gray-100">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand-salmon border border-white"></span>
        </Button>

        {/* Avatar Simple (Imagen de usuario) */}
        <div className="h-10 w-10 rounded-full bg-brand-light/30 border border-brand-light flex items-center justify-center overflow-hidden">
            <User className="h-6 w-6 text-brand-blue" />
        </div>
      </div>
    </header>
  );
}