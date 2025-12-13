"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { assignmentsService } from '@/services/assignmentsService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight, Loader2 } from 'lucide-react';

export default function MyProjectsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return router.push('/auth/login');
      
      try {
        const data = await assignmentsService.getMyProjects(token);
        setAssignments(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [router]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Mis Proyectos</h1>
      <p className="text-gray-500">Selecciona una obra para ver detalles o cargar remitos.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assignments.length === 0 ? (
           <p className="text-gray-500 col-span-3 text-center py-10">No tienes proyectos asignados aún.</p>
        ) : (
          assignments.map((assignment) => {
             const project = assignment.projectId; 
             if (!project) return null;

             return (
              <Card key={project._id} className="hover:shadow-lg transition-shadow border-t-4 border-t-brand-blue">
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="w-3 h-3"/> {project.address}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => router.push(`/proveedor/projects/${project._id}`)}
                  >
                    Ver Detalles <ArrowRight className="ml-2 w-4 h-4"/>
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}