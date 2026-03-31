'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tendersService } from '@/services/tendersService';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, DollarSign, Calendar, Megaphone, Building2 } from 'lucide-react';

export default function ProviderMarketplacePage() {
  const router = useRouter();
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTenders() {
      try {
        console.log("[RADAR FRONTEND] Solicitando marketplace al backend...");
        const response = await tendersService.getOpenTenders();
        
        console.log("[RADAR FRONTEND] Respuesta del backend:", response);
        const tendersList = response.data || response;
        
        setTenders(Array.isArray(tendersList) ? tendersList : []);
      } catch (error: any) {
        console.error("[RADAR FRONTEND] ❌ Error (Network/Auth):", error.response?.status, error.response?.data?.message || error.message);
        setTenders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTenders();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-brand-dark">Mercado de Licitaciones</h2>
        <p className="text-gray-500">Encuentra nuevas oportunidades de trabajo y envía tus propuestas.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-blue h-10 w-10" /></div>
      ) : tenders.length === 0 ? (
        <Card className="border-dashed border-2 bg-gray-50/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <Megaphone className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay licitaciones abiertas</h3>
            <p className="text-gray-500 max-w-md text-center">
              Actualmente no hay empresas buscando proveedores. Vuelve a revisar más tarde.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tenders.map((tender) => (
            <Card key={tender._id} className="hover:shadow-md transition-all flex flex-col">
              <CardHeader className="pb-3 border-b bg-gray-50/50">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold bg-brand-light/30 text-brand-blue px-2 py-1 rounded-md">
                    {tender.category?.label || 'Categoría'}
                  </span>
                  <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">Abierta</Badge>
                </div>
                <CardTitle className="text-lg line-clamp-1">{tender.title}</CardTitle>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Building2 className="h-3 w-3 mr-1" />
                  {tender.company?.name || tender.company?.razonSocial || 'Empresa Privada'}
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                  {tender.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                    Presupuesto tope: ${tender.budgetM2?.toLocaleString() || '0'} /m²
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 text-brand-salmon mr-2" />
                    {tender.project?.address || 'Ubicación no especificada'}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 text-brand-blue mr-2" />
                    Límite: {new Date(tender.deadline).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t">
                <Button 
                  className="w-full bg-brand-dark hover:bg-brand-dark/90 text-white"
                  onClick={() => router.push(`/proveedor/tenders/${tender._id}`)}
                >
                  Ver Detalles y Postularse
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}