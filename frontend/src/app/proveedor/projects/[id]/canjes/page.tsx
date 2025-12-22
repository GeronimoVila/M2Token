"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { canjesService } from "@/services/canjesService";
import { projectsService } from "@/services/projectsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, RefreshCw, Flame } from "lucide-react";
import { CreateCanjeModal } from "@/components/proveedor/CreateCanjeModal";

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
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En Revisión</Badge>;
      case 'APROBADO_PAGANDO':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Procesando Pago</Badge>;
      case 'COMPLETADO':
        return <Badge className="bg-green-600 hover:bg-green-700"><Flame className="w-3 h-3 mr-1"/> Quemado</Badge>;
      case 'RECHAZADO':
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  return (
    <div className="container py-8 space-y-6">
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5"/>
           </Button>
           <div>
             <h1 className="text-2xl font-bold text-slate-900">
               Canjes: {project?.name || "Cargando..."}
             </h1>
             <p className="text-sm text-gray-500">Historial de retiros para esta obra.</p>
           </div>
        </div>
        
        <CreateCanjeModal projectId={projectId} onSuccess={fetchData} />

      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Historial</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => { setLoading(true); fetchData(); }}>
            <RefreshCw className="w-4 h-4"/>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 font-medium">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Tokens</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Tx</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {canjes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        No hay canjes registrados para este proyecto.
                      </td>
                    </tr>
                  ) : (
                    canjes.map((c) => (
                      <tr key={c._id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-xs font-mono">{c.tipo}</td>
                        <td className="px-4 py-3 font-bold text-red-600">-{c.amountTokens}</td>
                        <td className="px-4 py-3">{getStatusBadge(c.estado)}</td>
                        <td className="px-4 py-3 font-mono text-xs text-blue-500">
                          {c.txHash ? (
                            <a href={`https://sepolia.etherscan.io/tx/${c.txHash}`} target="_blank" rel="noreferrer" className="hover:underline">
                                {c.txHash.slice(0, 10)}...
                            </a>
                          ) : '-'}
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