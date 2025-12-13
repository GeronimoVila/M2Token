"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { remitosService } from '@/services/remitosService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  ArrowLeft, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock 
} from 'lucide-react';

export default function ProviderProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [remitos, setRemitos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRemitos = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return router.push('/auth/login');

      try {
        const allMyRemitos = await remitosService.getMyRemitos(token);
        
        const filtered = Array.isArray(allMyRemitos) 
          ? allMyRemitos.filter((r: any) => {
              const rPid = typeof r.projectId === 'object' ? r.projectId._id : r.projectId;
              return rPid === projectId;
            })
          : [];
        
        setRemitos(filtered);
      } catch (error) {
        console.error("Error cargando remitos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRemitos();
  }, [projectId, router]);

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'validado':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 gap-1 border border-green-200">
            <CheckCircle2 className="w-3 h-3"/> Aprobado
          </span>
        );
      case 'rechazado':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 gap-1 border border-red-200">
            <XCircle className="w-3 h-3"/> Rechazado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 gap-1 border border-yellow-200">
            <Clock className="w-3 h-3"/> Pendiente
          </span>
        );
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="container py-8 space-y-6">
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5"/>
            </Button>
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Gestión de Remitos</h1>
                <p className="text-sm text-gray-500">Historial de entregas para esta obra.</p>
            </div>
        </div>
        
        <Button onClick={() => router.push(`/proveedor/remitos/new?projectId=${projectId}`)}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Remito
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Listado de Documentos</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="relative w-full overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 font-medium">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">N° Remito</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Evidencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {remitos.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                            Aún no has cargado remitos para esta obra.
                        </td>
                    </tr>
                ) : (
                    remitos.map((r) => (
                        <tr key={r._id} className="hover:bg-gray-50/50 text-slate-100">
                            <td className="px-4 py-3">
                                {new Date(r.fechaEntrega).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-100">
                                {r.numeroRemito}
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-100">
                                ${r.monto.toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                                {getStatusBadge(r.estado)}
                            </td>
                            <td className="px-4 py-3">
                                <a 
                                    href={`https://gateway.pinata.cloud/ipfs/${r.evidenceHash}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    <FileText className="w-4 h-4"/> Ver PDF
                                </a>
                            </td>
                        </tr>
                    ))
                )}
              </tbody>
            </table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}