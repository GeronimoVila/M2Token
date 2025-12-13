'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { projectsService, Project } from '@/services/projectsService';
import { remitosService } from '@/services/remitosService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RemitosList from '@/components/companies/RemitosList';
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  FileText, 
  Settings,
  Loader2
} from 'lucide-react';

export default function ProjectDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [remitos, setRemitos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRemitos = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token || !projectId) return;

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

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-brand-blue" /></div>;
  }

  if (!project) {
    return <div className="text-center py-10">Proyecto no encontrado.</div>;
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/companies/projects')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">{project.name}</h1>
          <p className="text-gray-500">Panel de control de la obra.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-brand-blue shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Presupuesto</CardTitle>
            <DollarSign className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-dark">${project.budget?.toLocaleString()}</div>
            <p className="text-xs text-gray-400">Total asignado</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Ubicación</CardTitle>
            <MapPin className="h-4 w-4 text-brand-salmon" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-brand-dark truncate">{project.address}</div>
            <p className="text-xs text-gray-400">Dirección de obra</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Estado</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-dark capitalize">
                {project.status === 'in_progress' ? 'En Progreso' : project.status}
            </div>
            <p className="text-xs text-gray-400">Fase actual</p>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-xl font-semibold text-brand-dark mt-8">Gestión</h3>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        <Card 
            className="cursor-pointer hover:border-brand-blue transition-all group"
            onClick={() => router.push(`/companies/projects/${projectId}/assign`)}
        >
            <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-brand-light/30 flex items-center justify-center mb-2 group-hover:bg-brand-blue group-hover:text-white transition-colors text-brand-blue">
                    <Users className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Proveedores y Equipo</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-500">Ver proveedores asignados, gestionar categorías y contratar nuevos.</p>
            </CardContent>
        </Card>

        <Card className="border-brand-blue/20 bg-blue-50/30">
            <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-2 text-blue-600">
                    <FileText className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Remitos Cargados</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold mb-1">{remitos.length}</div>
                <p className="text-sm text-gray-500">Documentos listos para auditar en la tabla inferior.</p>
            </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-brand-blue transition-all group opacity-60">
            <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-2 text-gray-500">
                    <Settings className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Configuración de Obra</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-500">Editar presupuesto, finalizar obra o pausar proyecto.</p>
            </CardContent>
        </Card>
      </div>

      <div className="pt-6">
        <h3 className="text-xl font-semibold text-brand-dark mb-4 flex items-center gap-2">
            Auditoría de Remitos
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                Blockchain Ready
            </span>
        </h3>
        
        <RemitosList 
          remitos={remitos} 
          projectId={projectId} 
          token={token} 
          onUpdate={fetchRemitos}
        />
      </div>

    </div>
  );
}