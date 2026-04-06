'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { assignmentsService } from '@/services/assignmentsService';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight, Loader2, HardHat, Building2, Search, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MyProjectsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem('access_token') || '';
      
      try {
        const response = await assignmentsService.getMyProjects(token);
        
        const data = response?.data || response || [];
        setAssignments(Array.isArray(data) ? data : []);
        
      } catch (error) {
        console.error("Error al cargar proyectos:", error);
        if (error instanceof Error && error.message.includes('401')) {
           router.push('/auth/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-pulse min-h-screen">
        <div className="h-24 bg-white rounded-2xl border border-gray-100" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl border border-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 min-h-[calc(100vh-6rem)]">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-brand-blue shrink-0">
            <HardHat className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-brand-dark">Obras Asignadas</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">Selecciona un proyecto para ver detalles o cargar remitos.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assignments.length === 0 ? (
           
           <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50 text-center">
             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Briefcase className="h-10 w-10 text-gray-400" />
             </div>
             <h3 className="text-2xl font-bold text-brand-dark mb-2">Sin proyectos asignados</h3>
             <p className="text-gray-500 max-w-md mx-auto mb-8">
               Actualmente no formas parte del equipo de ninguna obra. Puedes revisar las licitaciones abiertas para postularte a nuevos trabajos.
             </p>
             <Button 
                onClick={() => router.push('/proveedor/tenders')} 
                className="bg-brand-blue hover:bg-brand-blue/90 text-white shadow-lg shadow-brand-blue/20 h-11 px-6 rounded-xl"
             >
                <Search className="mr-2 h-5 w-5" /> Explorar Licitaciones
             </Button>
           </div>

        ) : (

          assignments.map((assignment) => {
             const project = assignment.projectId; 
             if (!project) return null;

             return (
              <Card 
                key={project._id} 
                className="group relative overflow-hidden rounded-2xl border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-blue/10 flex flex-col h-full cursor-pointer"
                onClick={() => router.push(`/proveedor/projects/${project._id}`)}
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-blue transition-opacity" />
                
                <CardHeader className="pb-3 pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Activo
                    </span>
                  </div>
                  <CardTitle className="text-xl font-extrabold text-brand-dark leading-tight line-clamp-2 group-hover:text-brand-blue transition-colors">
                    {project.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="mt-2 space-y-5 flex-1">
                  <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                    {project.description || "Proyecto de obra sin descripción detallada."}
                  </p>
                  
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-start text-sm text-gray-600 mt-4">
                    <MapPin className="mr-3 h-4.5 w-4.5 text-brand-salmon shrink-0 mt-0.5" />
                    <span className="line-clamp-2 font-medium">{project.address || "Ubicación no especificada"}</span>
                  </div>
                </CardContent>
                
                <CardFooter className="bg-gray-50/50 p-0 border-t border-gray-100 mt-auto">
                  <div className="w-full py-4 px-6 flex items-center justify-between text-sm font-bold text-gray-500 group-hover:text-brand-blue transition-colors duration-300">
                    <span>Panel del Proyecto</span>
                    <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-all duration-300 group-hover:translate-x-1">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}