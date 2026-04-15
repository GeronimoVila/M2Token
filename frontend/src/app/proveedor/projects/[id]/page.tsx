'use client';

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
  Wallet,
  ArrowRightLeft,
  Inbox,
  ShieldCheck,
  Building2,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProviderProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [remitos, setRemitos] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [balanceData, setBalanceData] = useState<any>(null);
  const [projectName, setProjectName] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    const initData = async () => {
      const token = localStorage.getItem('access_token') || '';

      try {
        try {
          const projRes = await api.get(`/projects/${projectId}`);
          const projectData = projRes.data.data || projRes.data;
          setProjectName(projectData.name || '');
        } catch (error) {
          console.error("Acceso denegado. No estás asignado a esta obra.");
          router.push('/proveedor/projects');
          return;
        }

        const userRes = await api.get('/users/me');
        const userData = userRes.data.data || userRes.data; 

        setUser(userData);

        const allMyRemitos = await remitosService.getMyRemitos(token);
        const remitosArray = Array.isArray(allMyRemitos?.data) ? allMyRemitos.data : (Array.isArray(allMyRemitos) ? allMyRemitos : []);
        
        const filtered = remitosArray.filter((r: any) => {
          const rPid = typeof r.projectId === 'object' ? r.projectId._id : r.projectId;
          return rPid === projectId;
        });
        setRemitos(filtered);

      } catch (error) {
        console.error("Error inicializando datos:", error);
        if ((error as any)?.response?.status === 401) {
          router.push('/auth/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      initData();
    }
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
    switch (estado?.toLowerCase()) {
      case 'aprobado':
      case 'validado':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5"/> Aprobado
          </span>
        );
      case 'rechazado':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200 shadow-sm gap-1.5">
            <XCircle className="w-3.5 h-3.5"/> Rechazado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200 shadow-sm gap-1.5">
            <Clock className="w-3.5 h-3.5"/> Pendiente
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-pulse min-h-screen">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-gray-200 rounded-xl" />
            <div className="space-y-2"><div className="h-8 w-64 bg-gray-200 rounded-md" /><div className="h-4 w-40 bg-gray-100 rounded-md" /></div>
          </div>
          <div className="flex gap-2">
             <div className="h-10 w-32 bg-gray-200 rounded-xl" />
             <div className="h-10 w-32 bg-brand-blue/30 rounded-xl" />
          </div>
        </div>
        <div className="h-40 bg-slate-900 rounded-2xl md:w-1/3" />
        <div className="h-96 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 min-h-[calc(100vh-6rem)]">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-start sm:items-center gap-4">
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-gray-200 text-gray-500 hover:text-brand-dark hover:bg-gray-100 shrink-0 transition-colors" onClick={() => router.push('/proveedor/projects')}>
                <ArrowLeft className="w-5 h-5"/>
            </Button>
            <div>
                <h1 className="text-2xl font-extrabold text-brand-dark tracking-tight flex items-center gap-2">
                  Gestión de Obra
                  {projectName && (
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-light/20 text-brand-blue ml-2">
                      <Building2 className="w-3.5 h-3.5" /> {projectName}
                    </span>
                  )}
                </h1>
                <p className="text-sm font-medium text-gray-500 mt-1">Control de tus activos digitales y entregas (remitos).</p>
            </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="h-11 rounded-xl border-gray-200 text-white hover:bg-gray-600 font-bold w-full sm:w-auto shadow-sm"
              onClick={() => router.push(`/proveedor/projects/${projectId}/canjes`)}
            >
                <ArrowRightLeft className="mr-2 h-4 w-4" /> Solicitar Canje
            </Button>

            <Button 
              className="h-11 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold w-full sm:w-auto shadow-lg shadow-brand-blue/20 transition-transform hover:-translate-y-0.5"
              onClick={() => router.push(`/proveedor/remitos/new?projectId=${projectId}`)}
            >
                <Plus className="mr-2 h-4 w-4" /> Cargar Remito
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-yellow-500" />
          
          <CardHeader className="pb-2 pt-6">
            <CardTitle className="text-sm font-bold text-slate-400 flex items-center justify-between uppercase tracking-wider">
              <span className="flex items-center gap-2"><Wallet className="h-4 w-4 text-slate-500" /> Mis Tokens M2</span>
              <Coins className="h-5 w-5 text-amber-400" />
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {loadingBalance ? (
               <div className="flex items-center text-sm font-medium text-brand-blue bg-brand-blue/10 px-3 py-2 rounded-lg w-fit">
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sincronizando con Blockchain...
               </div>
            ) : balanceData ? (
              <div className="space-y-4 mt-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white tracking-tighter">
                    {balanceData.m2 !== undefined ? balanceData.m2 : '--'}
                  </span>
                  <span className="text-lg font-bold text-amber-400">m²</span>
                </div>
                
                <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/50 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Equivalencia:</span>
                    <span className="text-slate-200 font-bold">{balanceData.balance} M2T</span>
                  </div>
                  <div className="h-px w-full bg-slate-700" />
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 
                    <span className="truncate" title={user?.walletAddress}>{user?.walletAddress}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 mt-2">
                <div className="text-4xl font-black text-slate-700 tracking-tighter">-- m²</div>
                {!user?.walletAddress && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-300 font-medium leading-relaxed">
                        No tienes una Wallet configurada. Ve a tu perfil para agregarla y ver tu saldo.
                      </p>
                    </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-white border-b border-gray-50 pb-5 pt-6 px-6 sm:px-8">
            <CardTitle className="text-lg text-brand-dark flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-blue" />
                Historial de Remitos (Entregas)
            </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
            <div className="relative w-full overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Fecha de Carga</th>
                  <th className="px-6 py-4">N° Remito / Factura</th>
                  <th className="px-6 py-4">Monto Solicitado</th>
                  <th className="px-6 py-4">Estado de Revisión</th>
                  <th className="px-6 py-4">Documentos</th>
                  <th className="px-6 py-4 text-right">Blockchain Tx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {remitos.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="py-16">
                           <div className="flex flex-col items-center justify-center text-center">
                              <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Inbox className="h-8 w-8 text-gray-400" />
                              </div>
                              <h3 className="text-lg font-bold text-gray-900">Aún no hay remitos</h3>
                              <p className="text-gray-500 mt-1">Carga tu primer remito usando el botón de arriba.</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    remitos.map((r) => (
                        <tr key={r._id} className="hover:bg-brand-light/5 transition-colors group">
                            <td className="px-6 py-4 font-medium text-gray-600">
                                {new Date(r.createdAt || r.fechaEntrega).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 font-mono font-bold text-brand-dark">
                                #{r.numeroRemito || 'S/N'}
                            </td>
                            <td className="px-6 py-4">
                                <span className="font-extrabold text-brand-dark text-base">{r.monto?.toLocaleString()}</span>
                                <span className="text-xs font-bold text-gray-400 ml-1 uppercase">m²</span>
                            </td>
                            <td className="px-6 py-4">
                                {getStatusBadge(r.estado)}
                            </td>
                            <td className="px-6 py-4">
                                {(r.evidenceHash || r.pdfCID) ? (
                                    <a 
                                        href={`https://gateway.pinata.cloud/ipfs/${r.evidenceHash || r.pdfCID}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-gray-50 hover:bg-brand-blue hover:text-white text-brand-blue transition-colors border border-gray-200 hover:border-brand-blue"
                                        title="Ver Documento PDF"
                                    >
                                        <FileText className="w-4 h-4"/>
                                    </a>
                                ) : (
                                    <span className="text-gray-400 text-xs font-medium">Sin documento</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {r.txHash ? (
                                <a 
                                  href={`https://sepolia.etherscan.io/tx/${r.txHash}`} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors"
                                  title="Ver transacción en el explorador"
                                >
                                    {r.txHash.slice(0, 8)}...{r.txHash.slice(-4)}
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
        </CardContent>
      </Card>
    </div>
  );
}