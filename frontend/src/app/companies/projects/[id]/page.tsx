'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { projectsService, Project } from '@/services/projectsService';
import { remitosService } from '@/services/remitosService';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RemitosList from '@/components/companies/RemitosList';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  FileText, 
  Settings,
  Loader2,
  Megaphone,
  ArrowRightLeft,
  ArrowRight,
  Lock,
  ShieldCheck
} from 'lucide-react';

export default function ProjectDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [remitos, setRemitos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const canManageCanjes = user?.role === 'empresa_owner' || user?.role === 'empresa_admin';
  const canManageProviders = user?.role === 'empresa_owner' || user?.role === 'empresa_admin';
  const canManageTenders = user?.role === 'empresa_owner' || user?.role === 'empresa_admin';

  const fetchRemitos = useCallback(async () => {
    const token = localStorage.getItem('access_token') || '';
    if (!projectId) return;

    try {
      const data = await remitosService.getByProject(projectId, token);
      setRemitos(data);
    } catch (error) {
      console.error("Error cargando remitos:", error);
    }
  }, [projectId]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const found = await projectsService.getById(projectId); 
        setProject(found);
        await fetchRemitos();
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [projectId, fetchRemitos]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-brand-blue/10 text-brand-blue border-brand-blue/20';
      case 'in_progress': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'paused': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'finished': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning': return 'Planificación';
      case 'in_progress': return 'En Progreso';
      case 'paused': return 'Pausado';
      case 'finished': return 'Finalizado';
      default: return status;
    }
  }

  if (loading || isAuthLoading) {
    return (
      <div className="space-y-8 animate-pulse p-4 sm:p-8 min-h-screen">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-gray-200 rounded-xl" />
            <div className="space-y-2"><div className="h-8 w-64 bg-gray-200 rounded-md" /><div className="h-4 w-40 bg-gray-100 rounded-md" /></div>
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded-xl" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}
        </div>
        <div className="h-8 w-32 bg-gray-200 rounded-md mt-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-gray-100 rounded-2xl mt-8" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center">
          <FileText className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-brand-dark">Proyecto no encontrado</h2>
        <p className="text-gray-500">Es posible que haya sido eliminado o no tengas acceso.</p>
        <Button variant="outline" onClick={() => router.push('/companies/projects')}>Volver a Proyectos</Button>
      </div>
    );
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-start sm:items-center gap-4">
          <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-gray-200 text-gray-500 hover:text-brand-dark hover:bg-gray-100 shrink-0" onClick={() => router.push('/companies/projects')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-3xl font-extrabold text-brand-dark tracking-tight">{project.name}</h1>
              <span className={cn("px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border", getStatusStyles(project.status))}>
                {getStatusLabel(project.status)}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500">Panel de control y gestión de obra.</p>
          </div>
        </div>

        {canManageCanjes && (
          <Button 
            className="bg-brand-dark hover:bg-brand-dark/90 text-white shadow-lg shadow-brand-dark/10 h-11 px-6 rounded-xl transition-transform hover:scale-105"
            onClick={() => router.push(`/companies/projects/${projectId}/canjes`)}
          >
            <ArrowRightLeft className="mr-2 h-5 w-5" /> 
            Gestionar Canjes
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-md overflow-hidden relative group bg-white">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Presupuesto</CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-brand-dark">${project.budget?.toLocaleString()}</div>
            <p className="text-xs font-medium text-gray-400 mt-1">Total asignado al proyecto (USD)</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md overflow-hidden relative group bg-white">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-salmon/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Ubicación</CardTitle>
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-brand-salmon">
              <MapPin className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-brand-dark line-clamp-2 leading-tight min-h-[3.5rem] flex items-center">
              {project.address || "No especificada"}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md overflow-hidden relative group bg-white">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-light/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Creado El</CardTitle>
            <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
              <Calendar className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-brand-dark">
              {new Date(project.createdAt).toLocaleDateString()}
            </div>
            <p className="text-xs font-medium text-gray-400 mt-1">Fecha de alta en plataforma</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-extrabold text-brand-dark flex items-center gap-2">
          Herramientas de Gestión
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          
          <Card 
              className={cn(
                "relative overflow-hidden transition-all duration-300 border-gray-200",
                canManageTenders ? "cursor-pointer hover:shadow-xl hover:shadow-brand-salmon/10 hover:-translate-y-1 group bg-white" : "bg-gray-50 opacity-80"
              )}
              onClick={() => { if (canManageTenders) router.push(`/companies/projects/${projectId}/tenders`); }}
          >
              <CardHeader className="pb-3 pt-6">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                    canManageTenders ? "bg-red-50 text-brand-salmon group-hover:bg-brand-salmon group-hover:text-white" : "bg-gray-200 text-gray-400"
                  )}>
                      <Megaphone className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg font-bold text-brand-dark group-hover:text-brand-salmon transition-colors">Licitaciones</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-sm text-gray-500 mb-2">Publica necesidades y recibe propuestas.</p>
                  {canManageTenders ? (
                    <div className="flex items-center text-xs font-bold text-brand-salmon opacity-0 group-hover:opacity-100 transition-opacity mt-4">
                      Ver módulo <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  ) : (
                    <div className="flex items-center text-xs font-bold text-gray-400 mt-4 bg-gray-100 w-fit px-2 py-1 rounded-md">
                      <Lock className="mr-1 h-3 w-3" /> Acceso Restringido
                    </div>
                  )}
              </CardContent>
          </Card>

          <Card 
              className={cn(
                "relative overflow-hidden transition-all duration-300 border-gray-200",
                canManageProviders ? "cursor-pointer hover:shadow-xl hover:shadow-brand-blue/10 hover:-translate-y-1 group bg-white" : "bg-gray-50 opacity-80"
              )}
              onClick={() => { if (canManageProviders) router.push(`/companies/projects/${projectId}/assign`); }}
          >
              <CardHeader className="pb-3 pt-6">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                    canManageProviders ? "bg-blue-50 text-brand-blue group-hover:bg-brand-blue group-hover:text-white" : "bg-gray-200 text-gray-400"
                  )}>
                      <Users className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg font-bold text-brand-dark group-hover:text-brand-blue transition-colors">Proveedores</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-sm text-gray-500 mb-2">Añade o remueve proveedores de la obra.</p>
                  {canManageProviders ? (
                    <div className="flex items-center text-xs font-bold text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity mt-4">
                      Gestionar <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  ) : (
                    <div className="flex items-center text-xs font-bold text-gray-400 mt-4 bg-gray-100 w-fit px-2 py-1 rounded-md">
                      <Lock className="mr-1 h-3 w-3" /> Acceso Restringido
                    </div>
                  )}
              </CardContent>
          </Card>

          <Card className="relative overflow-hidden transition-all duration-300 border-brand-blue/30 bg-gradient-to-br from-blue-50/50 to-white shadow-sm">
              <CardHeader className="pb-3 pt-6">
                  <div className="w-12 h-12 rounded-xl bg-brand-blue text-white shadow-md shadow-brand-blue/20 flex items-center justify-center mb-4">
                      <FileText className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg font-bold text-brand-dark">Remitos Cargados</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-3xl font-black text-brand-blue mb-2 leading-none">{remitos.length}</div>
                  <p className="text-sm font-medium text-gray-500">Documentos listos para auditoría.</p>
              </CardContent>
          </Card>

          <Card className="bg-gray-50 border-gray-200 opacity-60 relative overflow-hidden">
              <CardHeader className="pb-3 pt-6">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center mb-4 text-gray-500">
                      <Settings className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-600">Configuración</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-sm text-gray-500 mb-4">Editar proyecto o finalizar obra.</p>
                  <div className="flex items-center text-xs font-bold text-gray-500 bg-gray-200 w-fit px-2 py-1 rounded-md">
                      Sin hacer
                  </div>
              </CardContent>
          </Card>
        </div>
      </div>

      <div className="pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-brand-dark flex items-center gap-2">
              Auditoría de Remitos
            </h3>
            <p className="text-sm font-medium text-gray-500">
              Revisa y aprueba los remitos cargados por los proveedores.
            </p>
          </div>
          
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <RemitosList 
            remitos={remitos} 
            projectId={projectId} 
            token={token} 
            onUpdate={fetchRemitos}
            userRole={user?.role}
          />
        </div>
      </div>

    </div>
  );
}