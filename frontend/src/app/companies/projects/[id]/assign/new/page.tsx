'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usersService } from '@/services/usersService';
import { assignmentsService } from '@/services/assignmentsService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, Loader2, Briefcase, ArrowLeft } from 'lucide-react';

export default function SearchProvidersPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    async function loadProviders() {
      try {
        const data = await usersService.getProviders();
        setProviders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadProviders();
  }, []);

  async function handleAssign(providerId: string) {
    setAssigningId(providerId);
    try {
      await assignmentsService.assignProvider({ projectId, providerId });
      router.push(`/companies/projects/${projectId}/assign`);
    } catch (error: any) {
      alert(error.message || 'Error al asignar (¿Ya está asignado?)');
    } finally {
      setAssigningId(null);
    }
  }

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push(`/companies/projects/${projectId}/assign`)}>
            <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h2 className="text-2xl font-bold tracking-tight text-brand-dark">Explorar Proveedores</h2>
            <p className="text-muted-foreground">Busca en nuestra red de profesionales y asígnalos al proyecto.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Filtrar por nombre, email o rubro (ej: cemento)..." 
          className="pl-10 h-12 bg-white text-lg shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-brand-blue" /></div>
      ) : (
        <div className="grid gap-3">
            {filteredProviders.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
                    No se encontraron proveedores que coincidan.
                </div>
            ) : (
                filteredProviders.map((provider) => (
                <Card key={provider._id} className="flex items-center justify-between p-4 border-gray-200 hover:border-brand-blue transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-brand-light/20 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                        <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-brand-dark text-lg">{provider.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{provider.email}</span>
                            {provider.category && (
                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium border border-blue-100 uppercase">
                                    {provider.category}
                                </span>
                            )}
                        </div>
                    </div>
                    </div>
                    
                    <Button 
                        onClick={() => handleAssign(provider._id)} 
                        disabled={assigningId === provider._id}
                        className="bg-brand-blue hover:bg-brand-blue/90 text-white min-w-[120px]"
                    >
                        {assigningId === provider._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Contratar"}
                    </Button>
                </Card>
                ))
            )}
        </div>
      )}
    </div>
  );
}