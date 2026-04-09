"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { canjesService } from "@/services/canjesService";
import { projectsService } from "@/services/projectsService";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Inbox,
  ArrowRightLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CompanyProjectCanjesPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { user, isLoading: isAuthLoading } = useAuthStore();

  const [project, setProject] = useState<any>(null);
  const [canjes, setCanjes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user) {
      if (user.role === 'empresa_approver' || user.role === 'empresa_viewer') {
        router.push('/companies/dashboard');
      }
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (isAuthLoading || (user && (user.role === 'empresa_approver' || user.role === 'empresa_viewer'))) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const projectData = await projectsService.getById(projectId);
        setProject(projectData);

        const data = await canjesService.getCanjesByProject(projectId);
        setCanjes(data);
      } catch (error) {
        console.error("Error cargando canjes", error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchData();
  }, [projectId, isAuthLoading, user]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await canjesService.getCanjesByProject(projectId);
      setCanjes(data);
    } catch (error) {
      console.error("Error recargando canjes", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (canje: any) => {
    if (!confirm(`¿Confirmas que has pagado al proveedor y deseas QUEMAR ${canje.amountTokens} tokens?`)) return;

    setProcessingId(canje._id);
    try {
      const result = await canjesService.confirmPaymentAndBurn(canje._id);

      toast.success("Tokens Quemados Exitosamente", {
        description: `Transacción confirmada. Hash: ${result.txHash || 'Ok'}`
      });
      
      handleRefresh();
    } catch (error: any) {
      console.error("Error en quema:", error);
      toast.error("Error en la transacción", {
         description: error.response?.data?.message || error.message || "No se pudo procesar la quema de tokens."
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return (
          <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit shadow-sm">
            <Clock className="w-3.5 h-3.5"/> Pendiente
          </span>
        );
      case 'COMPLETADO':
        return (
          <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5"/> Completado
          </span>
        );
      default:
        return <Badge variant="outline" className="text-[11px] uppercase tracking-wider">{estado}</Badge>;
    }
  };

  if (isAuthLoading || (user && (user.role === 'empresa_approver' || user.role === 'empresa_viewer'))) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4 animate-in fade-in duration-500">
        <div className="h-16 w-16 bg-brand-light/20 rounded-2xl flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        </div>
        <span className="text-brand-dark font-medium animate-pulse">Verificando autorizaciones financieras...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 min-h-[calc(100vh-6rem)]">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-gray-200 text-gray-500 hover:text-brand-dark hover:bg-gray-100 transition-colors" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5"/>
           </Button>
           <div>
             <h1 className="text-2xl font-extrabold text-brand-dark tracking-tight flex items-center gap-2">
               Solicitudes de Retiro
               {project?.name && (
                 <span className="bg-brand-light/20 text-brand-blue text-sm px-3 py-1 rounded-full font-bold ml-2">
                   {project.name}
                 </span>
               )}
             </h1>
             <p className="text-sm font-medium text-gray-500 mt-1">Autoriza pagos fiat y gestiona la quema de tokens M2.</p>
           </div>
        </div>
      </div>

      <Card className="rounded-2xl border-gray-100 shadow-lg shadow-brand-blue/5 overflow-hidden">
        <div className="h-1.5 w-full bg-brand-dark" />
        
        <CardHeader className="flex flex-row items-center justify-between bg-white border-b border-gray-50 pb-4 pt-6">
          <CardTitle className="text-lg text-brand-dark flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-brand-blue" />
            Cola de Solicitudes
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={loading}
            className="h-9 px-3 text-brand-blue border-brand-light/50 hover:bg-brand-blue hover:text-white transition-all"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")}/>
            Actualizar
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl animate-pulse">
                  <div className="h-10 w-32 bg-gray-100 rounded-md" />
                  <div className="h-10 w-24 bg-gray-100 rounded-md" />
                  <div className="h-10 w-32 bg-gray-100 rounded-md" />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative w-full overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/80 text-gray-500 font-semibold uppercase text-[10px] tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Fecha de Solicitud</th>
                    <th className="px-6 py-4">Proveedor</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Monto Solicitado</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acción Financiera</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {canjes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Inbox className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">Sin solicitudes pendientes</h3>
                          <p className="text-gray-500 max-w-sm mt-1">No hay canjes o retiros solicitados por los proveedores en este proyecto en este momento.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    canjes.map((c) => (
                      <tr key={c._id} className="hover:bg-brand-light/5 transition-colors group">
                        <td className="px-6 py-4 font-medium text-gray-600">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="font-bold text-brand-dark">{c.proveedorId?.email || 'Proveedor'}</span>
                                <span className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase">ID: {c.proveedorId?._id || '...'}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono font-bold uppercase">
                            {c.tipo}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-extrabold text-brand-dark text-base">{c.amountTokens}</span>
                          <span className="text-xs text-brand-blue font-bold ml-1">M2</span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(c.estado)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {c.estado === 'PENDIENTE' && (
                            <Button 
                                size="sm" 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 font-semibold h-9 transition-all hover:-translate-y-0.5"
                                onClick={() => handleApprove(c)}
                                disabled={!!processingId}
                            >
                                {processingId === c._id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-1.5"/> 
                                        Aprobar y Quemar 
                                        <Flame className="w-3.5 h-3.5 ml-1.5 text-emerald-200"/>
                                    </>
                                )}
                            </Button>
                          )}
                          
                          {c.estado === 'COMPLETADO' && (
                             <div className="flex items-center justify-end gap-1.5 text-gray-400 group-hover:text-brand-blue transition-colors">
                                <Wallet className="w-4 h-4"/> 
                                <span className="text-xs font-bold tracking-wide uppercase">Tokens Quemados</span>
                             </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}