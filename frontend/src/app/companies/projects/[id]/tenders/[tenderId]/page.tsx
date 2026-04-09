'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tendersService } from '@/services/tendersService';
import { bidsService } from '@/services/bidsService';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  ArrowLeft, 
  DollarSign, 
  CalendarDays, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Trophy, 
  Phone,
  LayoutGrid,
  FileText,
  AlertTriangle,
  Inbox,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function TenderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const tenderId = params.tenderId as string;
  
  const [tender, setTender] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { user, isLoading: isAuthLoading } = useAuthStore();

  useEffect(() => {
    if (!isAuthLoading && user) {
      if (user.role === 'empresa_approver' || user.role === 'empresa_viewer') {
        router.push('/companies/dashboard');
      }
    }
  }, [user, isAuthLoading, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tenderData, bidsData] = await Promise.all([
        tendersService.getById(tenderId),
        bidsService.getByTender(tenderId)
      ]);
      setTender(tenderData.data || tenderData);
      setBids(Array.isArray(bidsData.data || bidsData) ? (bidsData.data || bidsData) : []);
    } catch (error) {
      console.error("Error cargando detalles de la licitación:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading || (user && (user.role === 'empresa_approver' || user.role === 'empresa_viewer'))) return;
    fetchData();
  }, [tenderId, isAuthLoading, user]);

  const handleAdjudicate = async (bid: any) => {
    const providerName = bid.provider?.name || bid.provider?.razonSocial || 'este proveedor';
    if (!confirm(`¿Confirmas la adjudicación a ${providerName} por $${bid.amount}/m²? \n\nEsta acción es irreversible. Se rechazará automáticamente al resto de los postulantes y se asignará el proveedor a tu obra.`)) return;

    setProcessingId(bid._id);
    try {
      await bidsService.adjudicate(bid._id);
      
      toast.success("¡Licitación Adjudicada!", {
        description: "El proveedor ha sido asignado al proyecto exitosamente."
      });
      
      fetchData();
    } catch (error: any) {
      console.error("Error adjudicando:", error);
      toast.error("Error en la Adjudicación", {
        description: error.response?.data?.message || 'Ocurrió un error inesperado al procesar la solicitud.'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Abierta</span>;
      case 'AWARDED': return <span className="bg-brand-blue/10 text-brand-blue border border-brand-blue/20 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">Adjudicada</span>;
      case 'CLOSED': return <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">Cerrada</span>;
      case 'CANCELLED': return <span className="bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">Cancelada</span>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBidStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 uppercase tracking-wider text-[10px] font-bold">En Análisis</Badge>;
      case 'ACCEPTED': return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 uppercase tracking-wider text-[10px] font-bold px-2 py-1"><Trophy className="w-3.5 h-3.5 mr-1 text-emerald-600"/> Oferta Ganadora</Badge>;
      case 'REJECTED': return <Badge variant="outline" className="text-gray-500 border-gray-200 bg-gray-50 uppercase tracking-wider text-[10px] font-bold"><XCircle className="w-3.5 h-3.5 mr-1"/> Descartada</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'PR';
    return name.substring(0, 2).toUpperCase();
  };

  if (isAuthLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 animate-pulse min-h-screen">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-10 w-10 bg-gray-200 rounded-xl" />
          <div className="space-y-2"><div className="h-8 w-64 bg-gray-200 rounded-md" /><div className="h-4 w-96 bg-gray-100 rounded-md" /></div>
        </div>
        <div className="h-48 bg-gray-100 rounded-2xl border border-gray-200" />
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="h-64 bg-gray-100 rounded-2xl border border-gray-200" />
          <div className="h-64 bg-gray-100 rounded-2xl border border-gray-200" />
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-brand-dark">Licitación no encontrada</h2>
        <p className="text-gray-500">Es posible que haya sido eliminada o no tengas acceso.</p>
        <Button variant="outline" onClick={() => router.push(`/companies/projects/${projectId}/tenders`)}>Volver a Licitaciones</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 min-h-[calc(100vh-6rem)]">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-start gap-4">
          <Link href={`/companies/projects/${projectId}/tenders`}>
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-gray-200 text-gray-500 hover:text-brand-dark hover:bg-gray-100 shrink-0 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-dark">{tender.title}</h2>
              {getStatusBadge(tender.status)}
            </div>
            <div className="flex flex-wrap items-center text-sm text-gray-500 font-medium gap-2">
              <span className="bg-gray-100 px-2.5 py-1 rounded-md text-brand-dark text-xs uppercase tracking-wider font-bold">
                {tender.category?.label || tender.category?.name || 'Categoría Genérica'}
              </span>
              <span>Licitación publicada para el proyecto <strong className="text-brand-blue">{tender.project?.name}</strong></span>
            </div>
          </div>
        </div>
        
        {tender.status === 'AWARDED' && (
          <Button 
            className="bg-brand-blue hover:bg-brand-blue/90 text-white shadow-lg shadow-brand-blue/20 h-11 px-6 rounded-xl transition-transform hover:scale-105 shrink-0"
            onClick={() => router.push(`/companies/projects/${projectId}/assign`)}
          >
            Ver Equipo Asignado <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <Card className="bg-white border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="h-1 w-full bg-gray-200" />
        <CardContent className="p-6 sm:p-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" /> Descripción del Trabajo Solicitado
              </h3>
              <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100 text-gray-700 whitespace-pre-wrap leading-relaxed font-medium">
                {tender.description || "No se ha provisto una descripción detallada para esta licitación."}
              </div>
            </div>

            <div className="space-y-4 lg:pl-8 lg:border-l border-gray-100 flex flex-col justify-center">
              <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                <h3 className="text-[10px] font-bold text-emerald-700/70 mb-1 uppercase tracking-wider">Presupuesto Tope Ofertado</h3>
                <div className="flex items-end text-3xl font-extrabold text-emerald-600">
                  <DollarSign className="h-6 w-6 mr-1 mb-1 opacity-70" />
                  {tender.budgetM2?.toLocaleString() || '0'} <span className="text-sm font-bold text-emerald-600/70 ml-1 mb-1">/m²</span>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <h3 className="text-[10px] font-bold text-blue-700/70 mb-1 uppercase tracking-wider">Fecha Límite Recepción</h3>
                <div className="flex items-center text-xl font-extrabold text-brand-blue">
                  <CalendarDays className="h-5 w-5 mr-2 opacity-70" />
                  {tender.deadline ? new Date(tender.deadline).toLocaleDateString() : 'No definida'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <h3 className="text-2xl font-extrabold text-brand-dark flex items-center gap-2">
            Postulaciones Recibidas 
            <span className="bg-gray-200 text-gray-600 text-sm px-3 py-1 rounded-full">{bids.length}</span>
          </h3>
          {tender.status === 'OPEN' && bids.length > 0 && (
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-3 py-1.5 rounded-lg">
              ↓ Ordenadas por mejor precio
            </span>
          )}
        </div>

        {bids.length === 0 ? (
          
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Inbox className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-xl font-bold text-brand-dark mb-1">Aún no hay ofertas</h4>
            <p className="text-gray-500 font-medium">Los proveedores todavía no han enviado propuestas para esta licitación.</p>
          </div>

        ) : (

          <div className="grid gap-6 lg:grid-cols-2">
            {bids.map((bid) => {
              const isWinner = bid.status === 'ACCEPTED';
              const isBudgetExceeded = bid.amount > tender.budgetM2;
              const providerName = bid.provider?.razonSocial || bid.provider?.name || 'Proveedor';
              
              return (
                <Card 
                  key={bid._id} 
                  className={cn(
                    "overflow-hidden transition-all duration-300 rounded-2xl flex flex-col h-full",
                    isWinner 
                      ? "border-emerald-400 shadow-lg shadow-emerald-500/10 bg-emerald-50/20" 
                      : "border-gray-200 hover:shadow-xl hover:shadow-brand-blue/5 bg-white hover:-translate-y-1"
                  )}
                >
                  <CardHeader className={cn("pb-4 pt-5 px-6 border-b", isWinner ? "bg-emerald-50/50 border-emerald-100" : "bg-gray-50/50 border-gray-100")}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                            "h-12 w-12 rounded-full flex items-center justify-center text-white font-extrabold text-lg shadow-inner shrink-0", 
                            isWinner ? "bg-gradient-to-br from-emerald-400 to-emerald-600" : "bg-gradient-to-br from-brand-blue to-brand-dark"
                        )}>
                          {getInitials(providerName)}
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-lg font-extrabold text-brand-dark line-clamp-1" title={providerName}>
                            {providerName}
                          </CardTitle>
                          <div className="flex flex-col gap-0.5 mt-1 text-xs font-medium text-gray-500">
                            <span className="flex items-center truncate"><Mail className="h-3 w-3 mr-1.5 shrink-0 text-brand-blue"/> {bid.provider?.email || 'N/A'}</span>
                            {bid.provider?.phone && <span className="flex items-center truncate"><Phone className="h-3 w-3 mr-1.5 shrink-0 text-brand-blue"/> {bid.provider?.phone}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0">
                          {getBidStatusBadge(bid.status)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-5 px-6 flex-1 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Oferta Económica</p>
                        <div className="flex items-baseline gap-1">
                          <span className={cn("text-3xl font-black tracking-tighter", isWinner ? "text-emerald-600" : "text-brand-dark")}>
                            ${bid.amount.toLocaleString()}
                          </span>
                          <span className="text-sm font-bold text-gray-400">/m²</span>
                        </div>
                      </div>
                      
                      {isBudgetExceeded && tender.status === 'OPEN' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200 mb-1">
                           <AlertTriangle className="w-3 h-3 mr-1" /> Excede Presupuesto
                        </span>
                      )}
                    </div>
                    
                    {bid.message && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mt-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Mensaje del Proveedor</p>
                        <p className="text-sm text-gray-700 italic font-medium">"{bid.message}"</p>
                      </div>
                    )}
                  </CardContent>

                  {tender.status === 'OPEN' && bid.status === 'PENDING' && (
                    <CardFooter className="bg-white pt-4 pb-5 px-6 border-t border-gray-50 mt-auto">
                      <Button 
                        className="w-full h-11 rounded-xl bg-brand-salmon hover:bg-brand-salmon/90 text-white font-bold shadow-md shadow-brand-salmon/20 transition-all"
                        onClick={() => handleAdjudicate(bid)}
                        disabled={!!processingId}
                      >
                        {processingId === bid._id ? (
                          <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Adjudicando Obra...</>
                        ) : (
                          <><CheckCircle className="w-5 h-5 mr-2" /> Aceptar Oferta y Adjudicar</>
                        )}
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}