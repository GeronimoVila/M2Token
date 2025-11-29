"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, User } from "lucide-react";

// 1. Actualizamos la interfaz para que TypeScript sepa que viene el 'name'
interface UserProfile {
  email: string;
  role: string;
  name: string; // <--- Agregado
}

export function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/users/me", {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("No autorizado");
      })
      .then((data) => {
        // data.user contiene { name, email, role, ... }
        setUser(data.user || data); 
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:4000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Error al salir", error);
      router.push("/auth/login");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center text-sm text-slate-400">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
        Cargando...
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Tarjeta de Usuario */}
      <div className="mb-4 flex items-center gap-3 rounded-lg bg-slate-800 p-2">
        <div className="rounded-full bg-primary/20 p-2">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="overflow-hidden">
          {/* 2. Mostramos el NOMBRE (Nombre / Razón Social) */}
          <p className="truncate text-sm font-medium text-white">
            {user?.name || "Usuario"}
          </p>
          
          {/* 3. Mostramos el ROL (o podrías poner user?.email si prefieres) */}
          <p className="text-xs capitalize text-slate-400">
            {user?.role || "Invitado"}
          </p>
        </div>
      </div>

      {/* Botón de Logout */}
      <Button
        variant="destructive"
        className="w-full justify-start"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Cerrar Sesión
      </Button>
    </div>
  );
}