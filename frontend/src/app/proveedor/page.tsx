"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { remitosService } from '@/services/remitosService';
import { assignmentsService } from '@/services/assignmentsService';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  CheckCircle2, 
  Building2, 
  Clock, 
  Loader2, 
  ArrowRight,
  Activity,
  AlertCircle,
  TrendingUp,
  History
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  AreaChart, Area
} from 'recharts';

interface DashboardData {
  stats: {
    projectsCount: number;
    totalRemitos: number;
    pendingRemitos: number;
    approvedRemitos: number;
    rejectedRemitos: number;
  };
  recentRemitos: any[];
  statusChart: any[];
  trendChart: any[];
}

export default function ProveedorDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token') || '';

      try {
        const [remitosRes, projectsRes] = await Promise.all([
            remitosService.getMyRemitos(token).catch(() => []),
            assignmentsService.getMyProjects(token).catch(() => [])
        ]);
        
        const remitosArray = Array.isArray(remitosRes?.data) ? remitosRes.data : (Array.isArray(remitosRes) ? remitosRes : []);
        const projectsArray = Array.isArray(projectsRes?.data) ? projectsRes.data : (Array.isArray(projectsRes) ? projectsRes : []);

        const pending = remitosArray.filter((r: any) => r.estado?.toLowerCase() === 'pendiente').length;
        const approved = remitosArray.filter((r: any) => r.estado?.toLowerCase() === 'aprobado').length;
        const rejected = remitosArray.filter((r: any) => r.estado?.toLowerCase() === 'rechazado').length;

        const statusChart = [
          { name: 'Pendientes', cantidad: pending, color: '#F59E0B' },
          { name: 'Aprobados', cantidad: approved, color: '#10B981' },
          { name: 'Rechazados', cantidad: rejected, color: '#EF4444' },
        ];

        const baseCount = remitosArray.length > 0 ? remitosArray.length : 5;
        const trendChart = [
          { name: 'Ene', entregas: Math.floor(baseCount * 0.2) },
          { name: 'Feb', entregas: Math.floor(baseCount * 0.5) },
          { name: 'Mar', entregas: Math.floor(baseCount * 0.3) },
          { name: 'Abr', entregas: Math.floor(baseCount * 0.8) },
          { name: 'May', entregas: baseCount },
        ];

        const recentRemitos = [...remitosArray]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 4);

        setData({
          stats: {
            projectsCount: projectsArray.length,
            totalRemitos: remitosArray.length,
            pendingRemitos: pending,
            approvedRemitos: approved,
            rejectedRemitos: rejected,
          },
          recentRemitos,
          statusChart,
          trendChart
        });

      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-pulse min-h-screen">
        <div className="space-y-2 mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded-md" />
          <div className="h-4 w-48 bg-gray-100 rounded-md" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl border border-gray-200" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="h-80 bg-gray-100 rounded-2xl" />
          <div className="h-80 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { stats, recentRemitos, statusChart, trendChart } = data;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 min-h-[calc(100vh-6rem)]">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-dark">
            Hola, {user?.name?.split(' ')[0] || 'Proveedor'} 👋
          </h1>
          <p className="text-gray-500 font-medium mt-1">Resumen general de tu actividad y entregas.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-white overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-blue" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Obras Asignadas</CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform">
              <Building2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-brand-dark">{stats.projectsCount}</div>
            <p className="text-xs font-medium text-gray-400 mt-1">Proyectos activos</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-white overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pendientes</CardTitle>
            <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-brand-dark">{stats.pendingRemitos}</div>
            <p className="text-xs font-medium text-gray-400 mt-1">Remitos en revisión</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-white overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Aprobados</CardTitle>
            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-brand-dark">{stats.approvedRemitos}</div>
            <p className="text-xs font-medium text-gray-400 mt-1">Listos para cobrar/canjear</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-white overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gray-700" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Entregas</CardTitle>
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 group-hover:scale-110 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-brand-dark">{stats.totalRemitos}</div>
            <p className="text-xs font-medium text-gray-400 mt-1">Histórico completo</p>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <Card className="border-gray-100 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2 border-b border-gray-50">
            <CardTitle className="text-lg text-brand-dark flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-blue" />
              Estado de tus Entregas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[280px] w-full">
              {stats.totalRemitos > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12, fontWeight: 600}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                    <RechartsTooltip 
                      cursor={{fill: '#F3F4F6', opacity: 0.4}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                      {statusChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <FileText className="h-12 w-12 text-gray-200 mb-2" />
                  <p>Aún no hay entregas registradas.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm flex flex-col">
          <CardHeader className="pb-2 border-b border-gray-50">
            <CardTitle className="text-lg text-brand-dark flex items-center gap-2">
              <History className="h-5 w-5 text-gray-500" />
              Últimos Remitos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex-1 flex flex-col">
            {recentRemitos.length > 0 ? (
              <div className="space-y-4">
                {recentRemitos.map((remito) => (
                  <div key={remito._id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      remito.estado?.toLowerCase() === 'aprobado' ? 'bg-emerald-50 text-emerald-600' : 
                      remito.estado?.toLowerCase() === 'rechazado' ? 'bg-red-50 text-red-600' : 
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {remito.estado?.toLowerCase() === 'aprobado' ? <CheckCircle2 className="h-4 w-4" /> : 
                       remito.estado?.toLowerCase() === 'rechazado' ? <AlertCircle className="h-4 w-4" /> : 
                       <Clock className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-300 truncate">Remito #{remito.numero || 'S/N'}</p>
                      <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                        {remito.proyecto?.name || 'Proyecto no especificado'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <p className="text-sm text-gray-400 mb-4">No hay actividad reciente.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}