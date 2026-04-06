'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { projectsService, Project } from '@/services/projectsService';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, MapPin, DollarSign, CalendarDays, FolderKanban, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user, isLoading: isAuthLoading } = useAuthStore();
  
  const canCreateProject = user?.role === 'empresa_owner' || user?.role === 'empresa_admin';

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const data = await projectsService.getAll();
      setProjects(data);
    } catch (err) {
      setError('No se pudieron cargar los proyectos. Por favor, intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'planning': return { badge: 'bg-brand-blue/10 text-brand-blue border-brand-blue/20', border: 'bg-brand-blue' };
      case 'in_progress': return { badge: 'bg-emerald-50 text-emerald-600 border-emerald-200', border: 'bg-emerald-500' };
      case 'paused': return { badge: 'bg-amber-50 text-amber-600 border-amber-200', border: 'bg-amber-500' };
      case 'finished': return { badge: 'bg-gray-100 text-gray-600 border-gray-200', border: 'bg-gray-400' };
      default: return { badge: 'bg-gray-50 text-gray-700 border-gray-200', border: 'bg-gray-300' };
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
      <div className="p-8 space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2"><div className="h-8 w-48 bg-gray-200 rounded-md" /><div className="h-4 w-64 bg-gray-100 rounded-md" /></div>
          <div className="h-10 w-36 bg-gray-200 rounded-md" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-gray-100 rounded-xl border border-gray-200" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 bg-brand-ghost/30 min-h-[calc(100vh-6rem)]">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="space-y-1.5">
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-dark flex items-center gap-3">
            Proyectos Activos
            <span className="bg-brand-light/30 text-brand-blue text-sm font-bold px-3 py-1 rounded-full">
              {projects.length}
            </span>
          </h2>
          <p className="text-gray-500 font-medium">Gestiona, monitorea y tokeniza tus obras de construcción.</p>
        </div>
        
        {canCreateProject && (
          <Link href="/companies/projects/new">
            <Button className="bg-brand-salmon hover:bg-brand-salmon/90 text-white shadow-lg shadow-brand-salmon/20 transition-all hover:scale-105">
              <Plus className="mr-2 h-4 w-4" /> Crear Proyecto
            </Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center gap-3 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {projects.length === 0 && !error ? (
        
        <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50 text-center animate-in zoom-in-95 duration-500">
          <div className="h-24 w-24 bg-brand-light/20 rounded-full flex items-center justify-center mb-6">
            <FolderKanban className="h-12 w-12 text-brand-blue" />
          </div>
          <h3 className="text-2xl font-bold text-brand-dark mb-2">No hay proyectos</h3>
          <p className="text-gray-500 max-w-md mb-8">
            Crea tu primer proyecto.
          </p>
          
          {canCreateProject && (
            <Link href="/companies/projects/new">
              <Button size="lg" className="bg-brand-dark hover:bg-brand-dark/90 text-white shadow-xl shadow-brand-dark/10 group">
                <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
                Iniciar mi primer proyecto
              </Button>
            </Link>
          )}
        </div>

      ) : (

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project) => {
            const styles = getStatusStyles(project.status);

            return (
              <Card 
                key={project._id} 
                className="group relative overflow-hidden rounded-2xl border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-blue/10 flex flex-col h-full cursor-pointer"
                onClick={() => router.push(`/companies/projects/${project._id}`)}
              >
                <div className={cn("absolute top-0 left-0 w-full h-1.5 transition-opacity", styles.border)} />
                
                <CardHeader className="flex flex-col items-start gap-4 pb-2 pt-6">
                  <div className="w-full flex justify-between items-start gap-2">
                    <span className={cn("px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border", styles.badge)}>
                      {getStatusLabel(project.status)}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 group-hover:text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-2">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-xl font-extrabold text-brand-dark leading-tight line-clamp-2 group-hover:text-brand-blue transition-colors">
                    {project.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="mt-2 space-y-5 flex-1">
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {project.description || "Proyecto en desarrollo de arquitectura y obra."}
                  </p>
                  
                  <div className="space-y-3 pt-2">
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="mr-3 h-4.5 w-4.5 text-brand-salmon shrink-0 mt-0.5" />
                      <span className="line-clamp-2 font-medium">{project.address || "Ubicación no especificada"}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="mr-3 h-4.5 w-4.5 text-brand-blue shrink-0" />
                      <div>
                        <span className="font-extrabold text-brand-dark text-base">
                          ${project.budget?.toLocaleString() || "0"}
                        </span>
                        <span className="ml-1 text-[11px] text-gray-400 font-bold uppercase">USD</span>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarDays className="mr-3 h-4 w-4 text-brand-light shrink-0" />
                      <span className="text-xs font-medium">Creado: {new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="bg-gray-50/80 p-0 border-t border-gray-100 mt-auto">
                  <div className="w-full py-3 px-6 text-center text-sm font-semibold text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors duration-300">
                    Ver Panel del Proyecto
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}