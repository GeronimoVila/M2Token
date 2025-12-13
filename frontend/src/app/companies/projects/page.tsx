'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { projectsService, Project } from '@/services/projectsService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, MapPin, DollarSign, Loader2, FolderKanban, UserPlus } from 'lucide-react';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const data = await projectsService.getAll();
      setProjects(data);
    } catch (err) {
      setError('No se pudieron cargar los proyectos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-brand-light/30 text-brand-blue border-brand-light/50';
      case 'in_progress': return 'bg-green-50 text-green-700 border-green-200';
      case 'paused': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'finished': return 'bg-gray-100 text-gray-700 border-gray-200';
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

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-brand-dark">Proyectos</h2>
          <p className="text-gray-500">Gestiona y monitorea tus obras activas.</p>
        </div>
        <Link href="/companies/projects/new">
          <Button className="bg-brand-salmon hover:bg-brand-salmon/90 text-white shadow-md shadow-brand-salmon/20">
            <Plus className="mr-2 h-4 w-4" /> Nuevo proyecto
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-red-50 text-red-600 border border-red-100">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 && !error ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-xl bg-white text-gray-400">
            <FolderKanban className="h-12 w-12 mb-4 text-brand-light" />
            <h3 className="text-lg font-medium text-brand-dark">Aún no tienes proyectos</h3>
            <p className="mb-6">Comienza creando tu primer proyecto.</p>
            <Link href="/companies/projects/new">
              <Button variant="outline" className="border-brand-blue text-brand-blue hover:bg-brand-blue/10">
                Crear primer proyecto.
              </Button>
            </Link>
          </div>
        ) : (
          projects.map((project) => (
            <Card key={project._id} className="rounded-xl border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-200 group">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold text-brand-dark group-hover:text-brand-blue transition-colors">
                    {project.name}
                  </CardTitle>
                  <p className="text-xs text-gray-400">Creado el {new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
              </CardHeader>
              
              <CardContent className="mt-4 space-y-4">
                <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                  {project.description || "Sin descripción disponible."}
                </p>
                
                <div className="pt-2 space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="mr-3 h-4 w-4 text-brand-blue" />
                    <span className="truncate">{project.address || "No address"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="mr-3 h-4 w-4 text-brand-blue" />
                    <span className="font-bold text-brand-dark text-base">
                      ${project.budget?.toLocaleString() || "0"}
                    </span>
                    <span className="ml-1 text-xs text-gray-400 font-normal">presupuesto</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="bg-gray-50/50 pt-3 pb-3 border-t border-gray-100 gap-2">
                <Button 
                    variant="ghost" 
                    className="flex-1 text-sm h-8 text-brand-blue hover:text-brand-blue hover:bg-brand-blue/10" 
                    size="sm"
                    onClick={() => router.push(`/companies/projects/${project._id}`)}
                >
                  Ver detalles
                </Button>

                <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 mt-0 border-brand-blue/20 text-brand-blue hover:bg-brand-blue hover:text-white transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/companies/projects/${project._id}/assign`);
                    }}
                >
                    <UserPlus className="mr-2 h-4 w-4" /> Asignar
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}