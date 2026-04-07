"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { dashboardService } from '@/services/dashboardService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, FileText, Pickaxe, Coins, Loader2, Activity, Clock, ScrollText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const COLORS = ['#577399', '#FE5F55', '#495867', '#BDD5EA', '#F7F7FF'];

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await dashboardService.getSuperAdminDashboard();
        const realData = dashboardData.data || dashboardData; 
        setData(realData);
      } catch (error: any) {
        console.error("Error al cargar dashboard superadmin:", error);
        if (error?.response?.status === 403 || error?.response?.status === 401) {
          router.push('/unauthorized');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-blue" />
          <p className="text-slate-500 font-medium animate-pulse">Cargando métricas globales...</p>
        </div>
      </div>
    );
  }

  const usersPieData = data?.usersByRole?.map((role: any) => ({
    name: role._id.replace('_', ' ').toUpperCase(),
    value: role.count
  })) || [];

  const remitosBarData = data?.remitosStats?.map((stat: any) => ({
    name: stat._id.toUpperCase(),
    Tokens: stat.totalMonto,
    Cantidad: stat.count
  })) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Tokens M2T Emitidos</p>
                <h3 className="text-3xl font-bold text-slate-900">
                  {data?.kpis?.totalTokenized?.toLocaleString('es-AR') || '0'}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                <Coins className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4 flex items-center gap-1">
              <Activity className="h-3 w-3" /> Respaldados on-chain
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Remitos Totales</p>
                <h3 className="text-3xl font-bold text-slate-900">{data?.kpis?.totalRemitos || 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
                <FileText className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">Histórico de carga</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Obras Activas</p>
                <h3 className="text-3xl font-bold text-slate-900">{data?.kpis?.totalProjects || 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm">
                <Pickaxe className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">Proyectos en ejecución</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Usuarios</p>
                <h3 className="text-3xl font-bold text-slate-900">{data?.kpis?.totalUsers || 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">Registrados en la red</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        <Card className="lg:col-span-4 border-none shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Volumen de Tokens por Estado
            </CardTitle>
            <CardDescription>Distribución de montos según validación de remitos</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={remitosBarData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="Tokens" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-slate-800">Distribución de Roles</CardTitle>
            <CardDescription>Usuarios activos por jerarquía</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={usersPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {usersPieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px', fontWeight: '500'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}