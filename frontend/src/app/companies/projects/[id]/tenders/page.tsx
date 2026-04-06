'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tendersService } from '@/services/tendersService';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Loader2, 
  ArrowLeft, 
  Plus, 
  Calendar, 
  DollarSign, 
  Megaphone, 
  Eye,
  LayoutGrid,
  Clock
} from 'lucide-react';

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

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'OPEN': return { badge: 'bg-emerald-50 text-emerald-600 border-emerald-200', border: 'bg-emerald-500' };
      case 'AWARDED': return { badge: 'bg-brand-blue/10 text-brand-blue border-brand-blue/20', border: 'bg-brand-blue' };
      case 'CLOSED': return { badge: 'bg-gray-100 text-gray-600 border-gray-200', border: 'bg-gray-400' };
      case 'CANCELLED': return { badge: 'bg-red-50 text-red-600 border-red-200', border: 'bg-red-500' };
      default: return { badge: 'bg-gray-50 text-gray-700 border-gray-200', border: 'bg-gray-300' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Abierta';
      case 'AWARDED': return 'Adjudicada';
      case 'CLOSED': return 'Cerrada';
      case 'CANCELLED': return 'Cancelada';
      default: return status;
    }
  };

  if (loading || isAuthLoading) {
    return (
      <div className="p-4 sm:p-8 space-y-8 animate-pulse min-h-screen">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-gray-200 rounded-xl" />
            <div className="space-y-2"><div className="h-8 w-64 bg-gray-200 rounded-md" /><div className="h-4 w-40 bg-gray-100 rounded-md" /></div>
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded-xl" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl border border-gray-200" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 min-h-[calc(100vh-6rem)]">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-start sm:items-center gap-4">
          <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-gray-200 text-gray-500 hover:text-brand-dark hover:bg-gray-100 shrink-0 transition-colors" onClick={() => router.push(`/companies/projects/${projectId}`)}>
            <ArrowLeft className="h-5 w-5"/>
          </Button>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-brand-dark">Licitaciones del Proyecto</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">Publica necesidades de obra y recibe propuestas de proveedores.</p>
          </div>
        </div>
        
        <Button 
          className="bg-brand-salmon hover:bg-brand-salmon/90 text-white shadow-lg shadow-brand-salmon/20 h-11 px-6 rounded-xl transition-transform hover:scale-105"
          onClick={() => router.push(`/companies/projects/${projectId}/tenders/new`)}
        >
          <Plus className="mr-2 h-5 w-5" /> Crear Licitación
        </Button>
      </div>

      {tenders.length === 0 ? (
        
        <div className="flex flex-col items-center justify-center py-24 px-4 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50 text-center animate-in zoom-in-95 duration-500">
          <div className="h-20 w-20 bg-brand-salmon/10 rounded-full flex items-center justify-center mb-6">
            <Megaphone className="h-10 w-10 text-brand-salmon" />
          </div>
          <h3 className="text-2xl font-bold text-brand-dark mb-2">Aún no hay licitaciones</h3>
          <p className="text-gray-500 max-w-md mb-8">
            Crea una licitación para que los proveedores puedan verla y enviar sus propuestas económicas.
          </p>
          <Button 
            onClick={() => router.push(`/companies/projects/${projectId}/tenders/new`)}
            className="bg-brand-dark hover:bg-brand-dark/90 text-white shadow-xl shadow-brand-dark/10 h-11 px-6 rounded-xl"
          >
            <Plus className="mr-2 h-5 w-5" /> Crear primera licitación
          </Button>
        </div>

      ) : (

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tenders.map((tender) => {
            const styles = getStatusStyles(tender.status);

            return (
              <Card key={tender._id} className="group relative overflow-hidden rounded-2xl border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-blue/10 flex flex-col h-full">
                
                <div className={cn("absolute top-0 left-0 w-full h-1.5 transition-opacity", styles.border)} />
                
                <CardHeader className="pb-3 pt-6 border-b border-gray-50">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <span className={cn("px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border shadow-sm", styles.badge)}>
                      {getStatusLabel(tender.status)}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md">
                      <LayoutGrid className="h-3 w-3" />
                      {tender.category?.label || 'General'}
                    </span>
                  </div>
                  <CardTitle className="text-xl font-extrabold text-brand-dark line-clamp-2 leading-tight group-hover:text-brand-blue transition-colors" title={tender.title}>
                    {tender.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-5 flex-1 space-y-4">
                  <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
                    {tender.description || "Sin descripción detallada."}
                  </p>
                  
                  <div className="space-y-3 pt-2 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4.5 w-4.5 text-emerald-600 mr-3 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Presupuesto Ref.</span>
                        <span className="font-bold text-brand-dark">
                          ${tender.budgetM2?.toLocaleString() || '0'} <span className="text-xs text-gray-500 font-medium">/m²</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Clock className="h-4.5 w-4.5 text-brand-blue mr-3 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Fecha Límite</span>
                        <span className="font-semibold text-gray-700">
                          {tender.deadline ? new Date(tender.deadline).toLocaleDateString() : 'No definida'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="bg-white pt-4 pb-5 px-6 border-t border-gray-50">
                  <Button 
                    variant="outline" 
                    className="w-full h-10 rounded-xl border-brand-light/50 text-brand-blue hover:bg-brand-blue hover:text-white hover:border-brand-blue font-semibold transition-all duration-300"
                    onClick={() => router.push(`/companies/projects/${projectId}/tenders/${tender._id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" /> Ver Detalles y Postulaciones
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}