"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, User } from "lucide-react";

interface UserProfile {
  email: string;
  role: string;
  name: string;
}

export function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    fetch(`${API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}` 
      },
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("No autorizado");
      })
      .then((payload) => {
        if (payload.success && payload.data) {
          setUser(payload.data);
        } else {
          setUser(payload);
        }
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');

      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Error al salir", error);
      localStorage.clear();
      window.location.href = "/auth/login";
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
      <div className="mb-4 flex items-center gap-3 rounded-lg bg-slate-800 p-2">
        <div className="rounded-full bg-primary/20 p-2">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="overflow-hidden">
          <p className="truncate text-sm font-medium text-white">
            {user?.name || "Administrador"}
          </p>
          <p className="text-xs capitalize text-slate-400">
            {user?.role || "Super Admin"}
          </p>
        </div>
      </div>

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