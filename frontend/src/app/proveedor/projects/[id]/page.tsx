"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { remitosService } from '@/services/remitosService';
import { blockchainService } from '@/services/blockchainService';
import { api } from '@/lib/api'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  ArrowLeft, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Coins, 
  Wallet 
} from 'lucide-react';

export default function ProviderProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [remitos, setRemitos] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [balanceData, setBalanceData] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    const initData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return router.push('/auth/login');

      try {
        const userRes = await api.get('/users/me');
        
        const userData = userRes.data.data || userRes.data; 

        console.log("👤 Usuario procesado:", userData);
        setUser(userData);

        const allMyRemitos = await remitosService.getMyRemitos(token);
        const filtered = Array.isArray(allMyRemitos) 
          ? allMyRemitos.filter((r: any) => {
              const rPid = typeof r.projectId === 'object' ? r.projectId._id : r.projectId;
              return rPid === projectId;
            })
          : [];
        setRemitos(filtered);

      } catch (error) {
        console.error("Error inicializando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [projectId, router]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (user?.walletAddress && projectId) {
        setLoadingBalance(true);
        try {
          const data = await blockchainService.getBalance(user.walletAddress, projectId);
          setBalanceData(data);
        } catch (error) {
          console.error("Error cargando saldo blockchain", error);
        } finally {
          setLoadingBalance(false);
        }
      }
    };

    if (user) {
        fetchBalance();
    }
  }, [projectId, user]);

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
                <h1 className="text-2xl font-bold text-slate-900">Gestión de Obra</h1>
                <p className="text-sm text-gray-500">Detalle de activos y entregas.</p>
            </div>
        </div>
        
        <Button onClick={() => router.push(`/proveedor/remitos/new?projectId=${projectId}`)}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Remito
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 text-white border-slate-800 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center justify-between">
              <span>Mis Tokens (Activos Digitales)</span>
              <Coins className="h-4 w-4 text-yellow-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingBalance ? (
               <div className="flex items-center text-sm text-slate-400">
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sincronizando Blockchain...
               </div>
            ) : balanceData ? (
              <div className="space-y-1">
               <div className="text-3xl font-bold text-white">
                {/* Agregamos una validación para que si es 0, muestre 0 */}
                {balanceData.m2 !== undefined ? balanceData.m2 : '--'} m²
              </div>
                <div className="flex flex-col gap-1 mt-2">
                  <p className="text-xs text-slate-400 font-mono">
                    Balance: {balanceData.balance} Tokens M2T
                  </p>
                  <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-800/50 p-1 rounded w-fit px-2">
                    <Wallet className="w-3 h-3" /> 
                    <span className="truncate max-w-[150px]">{user?.walletAddress}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold text-slate-500">--</div>
                {!user?.walletAddress && (
                    <p className="text-xs text-red-400">
                      ⚠️ No tienes una Wallet configurada.
                    </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Historial de Remitos</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="relative w-full overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 font-medium">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">N° Remito</th>
                  <th className="px-4 py-3">Monto (m²)</th>
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
                            <td className="px-4 py-3 font-mono text-xs">
                                {r.numeroRemito}
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-100">
                                {r.monto.toLocaleString()} m²
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
                                {r.txHash && (
                                  <span className="ml-2 inline-flex items-center text-xs text-purple-600" title="Registrado en Blockchain">
                                    <Coins className="w-3 h-3 mr-1"/> Tokenizado
                                  </span>
                                )}
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