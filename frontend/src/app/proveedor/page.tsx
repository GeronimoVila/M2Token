"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { remitosService } from '@/services/remitosService';
import { assignmentsService } from '@/services/assignmentsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle2, Building2, Clock, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProveedorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ remitosCount: 0, pending: 0, projectsCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return router.push('/auth/login');

      try {
        const [remitos, projects] = await Promise.all([
            remitosService.getMyRemitos(token),
            assignmentsService.getMyProjects(token)
        ]);
        
        const remitosArray = Array.isArray(remitos) ? remitos : [];
        const projectsArray = Array.isArray(projects) ? projects : [];

        setStats({
          remitosCount: remitosArray.length,
          pending: remitosArray.filter((r: any) => r.estado === 'pendiente').length,
          projectsCount: projectsArray.length,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-brand-blue" /></div>;

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-brand-dark">Hola, Proveedor 👋</h1>
        <p className="text-gray-500">Resumen general de tu actividad.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projectsCount}</div>
            <p className="text-xs text-gray-500">Obras asignadas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remitos Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-gray-500">Esperando validación</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entregas</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.remitosCount}</div>
            <p className="text-xs text-gray-500">Histórico completo</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300 text-center">
        <h3 className="text-lg font-medium text-gray-900">¿Necesitas cargar un remito?</h3>
        <p className="text-gray-500 mb-4">Ve a la sección de proyectos para seleccionar la obra.</p>
        <Button onClick={() => router.push('/proveedor/projects')} className="gap-2">
            Ir a Mis Proyectos <ArrowRight className="w-4 h-4"/>
        </Button>
      </div>
    </div>
  );
}