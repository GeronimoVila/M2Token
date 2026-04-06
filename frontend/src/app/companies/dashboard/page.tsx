'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Megaphone, Coins, Users, ArrowUpRight, Activity, Clock, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { dashboardService } from '@/services/dashboardService'; 

interface RecentActivity {
  id: string;
  text: string;
  time: string;
  type: string;
}

interface DashboardData {
  kpis: {
    activeProjects: number;
    openTenders: number;
    totalTokens: number;
    activeProviders: number;
  };
  financialData: any[];
  projectStatusData: any[];
  recentActivity: RecentActivity[];
}

export default function CompanyDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const responseData = await dashboardService.getCompanyDashboard();
        
        const actualData = responseData.data ? responseData.data : responseData;
        
        setDashboardData(actualData);
      } catch (err: any) {
        console.error("Error cargando dashboard:", err);
        const backendError = err.response?.data?.error || err.response?.data?.message || err.message;
        setError(Array.isArray(backendError) ? backendError.join(', ') : backendError);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[calc(100vh-6rem)]">
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl flex flex-col items-center text-center max-w-md shadow-sm">
          <AlertTriangle className="h-10 w-10 mb-4 text-brand-salmon" />
          <h2 className="text-xl font-bold mb-2">Error de Conexión</h2>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (loading || !dashboardData) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded-xl" />
          <div className="h-96 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const kpis = dashboardData.kpis || {};
  const financialData = dashboardData.financialData || [];
  const projectStatusData = dashboardData.projectStatusData || [];
  const recentActivity = dashboardData.recentActivity || [];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 bg-brand-ghost/30 min-h-[calc(100vh-6rem)]">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Proyectos Activos</p>
                <h3 className="text-3xl font-bold text-brand-dark">{kpis?.activeProjects || 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-salmon/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Licitaciones Abiertas</p>
                <h3 className="text-3xl font-bold text-brand-dark">{kpis?.openTenders || 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-brand-salmon">
                <Megaphone className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-light/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Tokens M2 Emitidos</p>
                <h3 className="text-3xl font-bold text-brand-dark">
                  {new Intl.NumberFormat('es-AR').format(kpis?.totalTokens || 0)}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-brand-light/30 flex items-center justify-center text-brand-blue">
                <Coins className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Proveedores Red</p>
                <h3 className="text-3xl font-bold text-brand-dark">{kpis?.activeProviders || 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-brand-dark flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-blue" />
              Flujo de Tokens M2
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              {financialData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={financialData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={-10} tickFormatter={(value) => `${value / 1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ stroke: '#BDD5EA', strokeWidth: 2 }}
                    />
                    <Line type="monotone" dataKey="tokens" name="Emitidos" stroke="#577399" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="canjes" name="Canjeados" stroke="#FE5F55" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">Sin datos financieros</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-brand-dark flex items-center gap-2">
              <Building2 className="h-5 w-5 text-brand-salmon" />
              Avance por Proyecto (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              {projectStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectStatusData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                    <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#495867', fontSize: 12, fontWeight: 500}} width={100} />
                    <Tooltip 
                      cursor={{fill: '#F3F4F6'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="avance" name="% Avance" fill="#495867" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">Aún no hay proyectos activos</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-lg border-gray-100">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {recentActivity.length > 0 ? recentActivity.map((activity: any) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  activity.type === 'tender' ? 'bg-red-50 text-brand-salmon' : 
                  activity.type === 'token' ? 'bg-blue-50 text-brand-blue' : 
                  'bg-gray-100 border-gray-100'
                }`}>
                  {activity.type === 'tender' && <Megaphone className="h-4 w-4" />}
                  {activity.type === 'token' && <Coins className="h-4 w-4" />}
                  {activity.type === 'project' && <Building2 className="h-4 w-4" />}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium border-gray-100 leading-none">{activity.text}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {activity.time}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-500 py-4">No hay actividad reciente registrada</div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}