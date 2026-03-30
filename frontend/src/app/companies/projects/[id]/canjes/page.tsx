"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { canjesService } from "@/services/canjesService";
import { projectsService } from "@/services/projectsService";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, RefreshCw, CheckCircle, Wallet } from "lucide-react";

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
      
      console.log("Burn exitoso:", result);
      alert("¡Éxito! Tokens quemados correctamente. Hash: " + (result.txHash || 'Ok'));
      
      handleRefresh();
    } catch (error: any) {
      console.error("Error en quema:", error);
      alert("Error: " + (error.response?.data?.message || error.message));
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pendiente de Pago</Badge>;
      case 'COMPLETADO':
        return <Badge className="bg-green-600">Completado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  if (isAuthLoading || (user && (user.role === 'empresa_approver' || user.role === 'empresa_viewer'))) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        <span className="ml-2 text-brand-dark font-medium">Verificando accesos...</span>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5"/>
           </Button>
           <div>
             <h1 className="text-2xl font-bold text-slate-900">
               Solicitudes de Retiro: {project?.name || 'Cargando...'}
             </h1>
             <p className="text-sm text-gray-500">Autoriza pagos y quema tokens del proveedor.</p>
           </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cola de Solicitudes</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-brand-blue" /></div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 font-medium">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Proveedor</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Monto</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {canjes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        No hay solicitudes pendientes en este proyecto.
                      </td>
                    </tr>
                  ) : (
                    canjes.map((c) => (
                      <tr key={c._id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                            <div className="flex flex-col">
                                <span className="font-medium">{c.proveedorId?.email || 'Proveedor'}</span>
                                <span className="text-xs text-gray-400 font-mono">ID: {c.proveedorId?._id || '...'}</span>
                            </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono">{c.tipo}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{c.amountTokens} m²</td>
                        <td className="px-4 py-3">{getStatusBadge(c.estado)}</td>
                        <td className="px-4 py-3 text-right">
                          {c.estado === 'PENDIENTE' && (
                            <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleApprove(c)}
                                disabled={!!processingId}
                            >
                                {processingId === c._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-1"/> Confirmar Pago
                                    </>
                                )}
                            </Button>
                          )}
                          
                          {c.estado === 'COMPLETADO' && (
                             <span className="text-xs text-gray-400 font-mono flex items-center justify-end gap-1">
                                <Wallet className="w-3 h-3"/> Tokens Quemados
                             </span>
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