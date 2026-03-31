'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tendersService } from '@/services/tendersService';
import { bidsService } from '@/services/bidsService';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, DollarSign, Calendar, Mail, CheckCircle, XCircle, Trophy, User, Phone } from 'lucide-react';
import Link from 'next/link';

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
    if (!confirm(`¿Estás seguro de adjudicar esta obra a ${providerName} por $${bid.amount}/m²? Esta acción no se puede deshacer y rechazará a los demás postulantes.`)) return;

    setProcessingId(bid._id);
    try {
      await bidsService.adjudicate(bid._id);
      alert('¡Licitación adjudicada exitosamente! El proveedor ya fue asignado al proyecto.');
      fetchData();
    } catch (error: any) {
      console.error("Error adjudicando:", error);
      alert(error.response?.data?.message || 'Ocurrió un error al adjudicar la licitación.');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-none">Abierta</Badge>;
      case 'AWARDED': return <Badge className="bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 border-none">Adjudicada</Badge>;
      case 'CLOSED': return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-none">Cerrada</Badge>;
      case 'CANCELLED': return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-none">Cancelada</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getBidStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Pendiente</Badge>;
      case 'ACCEPTED': return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-none"><Trophy className="w-3 h-3 mr-1"/> Ganador</Badge>;
      case 'REJECTED': return <Badge className="bg-red-50 text-red-600 hover:bg-red-100 border-none"><XCircle className="w-3 h-3 mr-1"/> Rechazada</Badge>;
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

  if (loading) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-brand-blue h-10 w-10" /></div>;
  }

  if (!tender) {
    return <div className="text-center py-20 text-gray-500">Licitación no encontrada.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href={`/companies/projects/${projectId}/tenders`}>
            <Button variant="outline" size="icon" className="h-9 w-9 mt-1">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight text-brand-dark">{tender.title}</h2>
              {getStatusBadge(tender.status)}
            </div>
            <p className="text-gray-500 flex items-center gap-2">
              <span className="bg-gray-100 px-2 py-0.5 rounded-md text-xs font-semibold">{tender.category?.label || 'Categoría'}</span>
              Publicado para el proyecto {tender.project?.name}
            </p>
          </div>
        </div>
        
        {tender.status === 'AWARDED' && (
          <Button 
            variant="outline" 
            className="border-brand-blue text-brand-blue bg-blue-50"
            onClick={() => router.push(`/companies/projects/${projectId}/assign`)}
          >
            Ver Equipo Asignado
          </Button>
        )}
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-1">Descripción del Trabajo</h3>
                <p className="text-gray-800 whitespace-pre-wrap">{tender.description}</p>
              </div>
            </div>
            <div className="space-y-4 border-l md:pl-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-1">Presupuesto Tope</h3>
                <div className="flex items-center text-xl font-bold text-green-700">
                  <DollarSign className="h-5 w-5 mr-1" />
                  {tender.budgetM2?.toLocaleString()} <span className="text-sm font-normal text-gray-500 ml-1">/m²</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-1">Fecha Límite</h3>
                <div className="flex items-center text-gray-800 font-medium">
                  <Calendar className="h-4 w-4 text-brand-blue mr-2" />
                  {new Date(tender.deadline).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="pt-6 border-t">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-brand-dark">
            Postulaciones Recibidas ({bids.length})
          </h3>
          {tender.status === 'OPEN' && bids.length > 0 && (
            <span className="text-sm text-gray-500">Ordenadas de menor a mayor precio</span>
          )}
        </div>

        {bids.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Mail className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900">Aún no hay ofertas</h4>
            <p className="text-gray-500">Los proveedores todavía no han enviado postulaciones para esta licitación.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {bids.map((bid) => {
              const isWinner = bid.status === 'ACCEPTED';
              const isBudgetExceeded = bid.amount > tender.budgetM2;
              
              return (
                <Card 
                  key={bid._id} 
                  className={`overflow-hidden transition-all ${isWinner ? 'border-2 border-green-500 shadow-md bg-green-50/10' : 'hover:shadow-md'}`}
                >
                  <CardHeader className={`pb-3 ${isWinner ? 'bg-green-50/50' : 'bg-gray-50/50'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${isWinner ? 'bg-green-600' : 'bg-brand-dark'}`}>
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-md font-bold">
                            {bid.provider?.razonSocial || bid.provider?.name || 'Proveedor'}
                          </CardTitle>
                          <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
                            <span className="flex items-center"><Mail className="h-3 w-3 mr-1"/> {bid.provider?.email}</span>
                            {bid.provider?.phone && <span className="flex items-center"><Phone className="h-3 w-3 mr-1"/> {bid.provider?.phone}</span>}
                          </div>
                        </div>
                      </div>
                      {getBidStatusBadge(bid.status)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-4">
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Propuesta Económica</p>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-bold ${isWinner ? 'text-green-700' : 'text-brand-dark'}`}>
                          ${bid.amount.toLocaleString()} <span className="text-sm font-normal text-gray-500">/m²</span>
                        </span>
                        {isBudgetExceeded && tender.status === 'OPEN' && (
                          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 text-[10px]">Excede Presupuesto</Badge>
                        )}
                      </div>
                    </div>
                    
                    {bid.message && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Mensaje del Proveedor</p>
                        <p className="text-sm text-gray-700 italic">"{bid.message}"</p>
                      </div>
                    )}
                  </CardContent>

                  {tender.status === 'OPEN' && bid.status === 'PENDING' && (
                    <CardFooter className="bg-gray-50 pt-4 border-t">
                      <Button 
                        className="w-full bg-brand-dark hover:bg-brand-dark/90 text-white"
                        onClick={() => handleAdjudicate(bid)}
                        disabled={!!processingId}
                      >
                        {processingId === bid._id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Adjudicar Licitación
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