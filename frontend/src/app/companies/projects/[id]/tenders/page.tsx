'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tendersService } from '@/services/tendersService';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Plus, Calendar, DollarSign, Megaphone, Eye } from 'lucide-react';

export default function ProjectTendersPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { user, isLoading: isAuthLoading } = useAuthStore();

  useEffect(() => {
    if (!isAuthLoading && user) {
      if (user.role === 'empresa_approver' || user.role === 'empresa_viewer') {
        router.push('/companies/dashboard');
      }
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (isAuthLoading || (user && (user.role === 'empresa_approver' || user.role === 'empresa_viewer'))) return;

    async function fetchTenders() {
      try {
        const response = await tendersService.getByProject(projectId);
        
        const tendersList = response.data || response;
        
        setTenders(Array.isArray(tendersList) ? tendersList : []);
      } catch (error) {
        setTenders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTenders();
  }, [projectId, isAuthLoading, user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-none">Abierta</Badge>;
      case 'AWARDED': return <Badge className="bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 border-none">Adjudicada</Badge>;
      case 'CLOSED': return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-none">Cerrada</Badge>;
      case 'CANCELLED': return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-none">Cancelada</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (isAuthLoading || (user && (user.role === 'empresa_approver' || user.role === 'empresa_viewer'))) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push(`/companies/projects/${projectId}`)}>
            <ArrowLeft className="h-4 w-4"/>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-brand-dark">Licitaciones del Proyecto</h2>
            <p className="text-gray-500">Publica necesidades y recibe propuestas de proveedores.</p>
          </div>
        </div>
        
        <Button 
          className="bg-brand-salmon hover:bg-brand-salmon/90 text-white shadow-md"
          onClick={() => router.push(`/companies/projects/${projectId}/tenders/new`)}
        >
          <Plus className="mr-2 h-4 w-4" /> Crear Licitación
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-blue h-10 w-10" /></div>
      ) : tenders.length === 0 ? (
        <Card className="border-dashed border-2 bg-gray-50/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <Megaphone className="h-8 w-8 text-brand-salmon" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aún no hay licitaciones</h3>
            <p className="text-gray-500 max-w-md text-center mb-6">
              Crea una licitación para que los proveedores de la plataforma puedan verla y enviar sus propuestas económicas.
            </p>
            <Button 
              onClick={() => router.push(`/companies/projects/${projectId}/tenders/new`)}
              className="bg-brand-blue hover:bg-brand-blue/90"
            >
              Crear primera licitación
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tenders.map((tender) => (
            <Card key={tender._id} className="hover:shadow-md transition-all flex flex-col">
              <CardHeader className="pb-3 border-b">
                <div className="flex justify-between items-start mb-2">
                  {getStatusBadge(tender.status)}
                  <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                    {tender.category?.label || 'Categoría'}
                  </span>
                </div>
                <CardTitle className="text-lg line-clamp-1" title={tender.title}>{tender.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 min-h-[40px]">
                  {tender.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                    Presupuesto: ${tender.budgetM2?.toLocaleString() || '0'} /m²
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 text-brand-blue mr-2" />
                    Límite: {new Date(tender.deadline).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 pt-4">
                <Button 
                  variant="outline" 
                  className="w-full border-brand-blue text-brand-blue hover:bg-brand-blue/10"
                  onClick={() => router.push(`/companies/projects/${projectId}/tenders/${tender._id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" /> Ver Postulaciones
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}