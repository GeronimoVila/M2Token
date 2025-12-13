'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, Package, Phone, Mail, ArrowLeft, Loader2, Users } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AssignedProvidersPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [groupedProviders, setGroupedProviders] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${API_URL}/assignments/project/${projectId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        setGroupedProviders(json.success ? json.data : json);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchAssignments();
  }, [projectId]);

  const categories = Object.keys(groupedProviders);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
             <Button variant="outline" size="icon" onClick={() => router.push(`/companies/projects/${projectId}`)}>
                <ArrowLeft className="h-4 w-4"/>
             </Button>
             <div>
                <h2 className="text-3xl font-bold tracking-tight text-brand-dark">Proveedores Asignados</h2>
                <p className="text-gray-500">Equipo actual y licitaciones activas.</p>
             </div>
        </div>
        
        <Button 
          className="bg-brand-salmon hover:bg-brand-salmon/90 text-white shadow-md"
          onClick={() => router.push(`/companies/projects/${projectId}/assign/new`)}
        >
          <UserPlus className="mr-2 h-4 w-4" /> Agregar Nuevo
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
           <div className="flex justify-center p-8"><Loader2 className="animate-spin text-brand-blue" /></div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/30">
             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
             </div>
             <h3 className="text-lg font-medium text-gray-900">Sin proveedores asignados</h3>
             <p className="text-gray-500 max-w-sm mx-auto mb-6">Actualmente no hay proveedores trabajando en esta obra.</p>
             <Button variant="outline" onClick={() => router.push(`/companies/projects/${projectId}/assign/new`)}>
                Buscar Proveedores
             </Button>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category} className="border rounded-xl bg-white shadow-sm overflow-hidden">
              <div className="bg-gray-50 p-4 border-b flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-brand-light/30 flex items-center justify-center text-brand-blue">
                    <Package className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-lg capitalize text-brand-dark">{category}</h3>
                  <span className="text-xs bg-white border px-2 py-1 rounded-full text-gray-500 font-medium">
                    {groupedProviders[category].length}
                  </span>
              </div>
              <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupedProviders[category].map((item: any) => (
                  <Card key={item.assignmentId} className="border-l-4 border-l-brand-blue shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-800">{item.provider.name}</h4>
                            <span className="text-[10px] uppercase tracking-wide bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Activo</span>
                        </div>
                        <div className="text-sm text-gray-500 space-y-1">
                            <div className="flex items-center gap-2"><Mail className="h-3 w-3"/> {item.provider.email}</div>
                            {item.provider.phone && <div className="flex items-center gap-2"><Phone className="h-3 w-3"/> {item.provider.phone}</div>}
                        </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}