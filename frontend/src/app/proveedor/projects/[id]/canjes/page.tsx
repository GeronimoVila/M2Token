"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { canjesService } from "@/services/canjesService";
import { projectsService } from "@/services/projectsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateCanjeModal } from "@/components/proveedor/CreateCanjeModal";
import { cn } from "@/lib/utils";
import { 
  Loader2, 
  ArrowLeft, 
  RefreshCw, 
  Flame,
  Clock,
  XCircle,
  ExternalLink,
  Inbox,
  ArrowRightLeft
} from "lucide-react";

export default function ProjectCanjesPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [canjes, setCanjes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const projectData = await projectsService.getById(projectId);
      setProject(projectData);

      const allCanjes = await canjesService.getMyCanjes();
      
      const projectCanjes = Array.isArray(allCanjes) 
        ? allCanjes.filter((c: any) => {
            const cPid = (c.projectId && typeof c.projectId === 'object' && '_id' in c.projectId)
              ? c.projectId._id 
              : c.projectId;
            return String(cPid) === String(projectId);
          })
        : [];
        
      setCanjes(projectCanjes);
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
        setLoading(true);
        fetchData();
    }
  }, [projectId]);

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200 shadow-sm gap-1.5">
            <Clock className="w-3 h-3"/> En Revisión
          </span>
        );
      case 'APROBADO_PAGANDO':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200 shadow-sm gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin"/> Procesando Pago
          </span>
        );
      case 'COMPLETADO':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm gap-1.5">
            <Flame className="w-3.5 h-3.5 text-emerald-500"/> Quemado
          </span>
        );
      case 'RECHAZADO':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200 shadow-sm gap-1.5">
            <XCircle className="w-3 h-3"/> Rechazado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-gray-50 text-gray-600 border border-gray-200 shadow-sm">
            {estado}
          </span>
        );
    }
  };

  if (loading && !project) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-pulse min-h-screen">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-gray-200 rounded-xl" />
            <div className="space-y-2"><div className="h-8 w-64 bg-gray-200 rounded-md" /><div className="h-4 w-40 bg-gray-100 rounded-md" /></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-xl" />
        </div>
        <div className="h-96 bg-white rounded-2xl border border-gray-100" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 min-h-[calc(100vh-6rem)]">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-start sm:items-center gap-4">
           <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-gray-200 text-gray-500 hover:text-brand-dark hover:bg-gray-100 shrink-0 transition-colors" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5"/>
           </Button>
           <div>
             <h1 className="text-2xl font-extrabold text-brand-dark tracking-tight flex items-center gap-2">
               Solicitudes de Retiro
               {project?.name && (
                 <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-bold bg-brand-light/20 text-brand-blue ml-2">
                   {project.name}
                 </span>
               )}
             </h1>
             <p className="text-sm font-medium text-gray-500 mt-1">Historial de canjes y quemado de tokens para esta obra.</p>
           </div>
        </div>
        
        <div className="shrink-0">
          <CreateCanjeModal projectId={projectId} onSuccess={fetchData} />
        </div>
      </div>

      <Card className="rounded-2xl border-gray-100 shadow-md shadow-brand-dark/5 overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-brand-dark" />
        <CardHeader className="flex flex-row items-center justify-between bg-white border-b border-gray-50 pb-4 pt-6">
          <CardTitle className="text-lg text-brand-dark flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-gray-400" />
            Historial de Transacciones
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { setLoading(true); fetchData(); }} 
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
                   <div className="h-8 w-24 bg-gray-100 rounded-md" />
                   <div className="h-8 w-16 bg-gray-100 rounded-md" />
                   <div className="h-8 w-20 bg-gray-100 rounded-md" />
                 </div>
               ))}
             </div>
          ) : (
            <div className="relative w-full overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/80 text-gray-500 font-semibold uppercase text-[10px] tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Fecha de Solicitud</th>
                    <th className="px-6 py-4">Tipo de Retiro</th>
                    <th className="px-6 py-4">Tokens Solicitados</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Blockchain Tx</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {canjes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20">
                         <div className="flex flex-col items-center justify-center text-center">
                            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                              <Inbox className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Aún no hay retiros</h3>
                            <p className="text-gray-500 mt-1 max-w-sm">No has solicitado ningún canje de tokens para este proyecto todavía.</p>
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
                          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider">
                            {c.tipo}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 font-extrabold text-red-600 text-base">
                            -<Flame className="w-3.5 h-3.5 opacity-50" /> {c.amountTokens} <span className="text-xs font-bold text-red-400">m²</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(c.estado)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {c.txHash ? (
                            <a 
                              href={`https://sepolia.etherscan.io/tx/${c.txHash}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors"
                              title="Ver transacción en el explorador"
                            >
                                {c.txHash.slice(0, 8)}...{c.txHash.slice(-4)}
                                <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-gray-400 text-xs font-medium">No disponible</span>
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