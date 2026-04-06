'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tendersService } from '@/services/tendersService';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  MapPin, 
  DollarSign, 
  CalendarDays, 
  Megaphone, 
  Building2,
  LayoutGrid,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-pulse min-h-screen">
        <div className="space-y-2 mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded-md" />
          <div className="h-4 w-96 bg-gray-100 rounded-md" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-72 bg-white rounded-2xl border border-gray-100 shadow-sm" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 min-h-[calc(100vh-6rem)]">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-brand-salmon shrink-0">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-brand-dark">Mercado de Licitaciones</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">Encuentra nuevas oportunidades de trabajo y envía tus propuestas.</p>
          </div>
        </div>
      </div>

      {tenders.length === 0 ? (
        
        <div className="flex flex-col items-center justify-center py-24 px-4 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50 text-center animate-in zoom-in-95 duration-500">
          <div className="h-20 w-20 bg-brand-light/20 rounded-full flex items-center justify-center mb-6">
            <Megaphone className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-brand-dark mb-2">No hay licitaciones abiertas</h3>
          <p className="text-gray-500 max-w-md mb-8 font-medium">
            Actualmente no hay empresas buscando proveedores. Vuelve a revisar más tarde para nuevas oportunidades.
          </p>
        </div>

      ) : (

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tenders.map((tender) => (
            <Card key={tender._id} className="group relative overflow-hidden rounded-2xl border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-salmon/10 flex flex-col h-full">
              
              <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-salmon transition-opacity" />
              
              <CardHeader className="pb-3 pt-6 border-b border-gray-50">
                <div className="flex justify-between items-start mb-3 gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border shadow-sm bg-emerald-50 text-emerald-600 border-emerald-200 flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Abierta
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md">
                    <LayoutGrid className="h-3 w-3" />
                    {tender.category?.label || 'Categoría'}
                  </span>
                </div>
                <CardTitle className="text-xl font-extrabold text-brand-dark line-clamp-2 leading-tight group-hover:text-brand-salmon transition-colors" title={tender.title}>
                  {tender.title}
                </CardTitle>
                <div className="flex items-center text-xs font-bold text-brand-blue mt-2">
                  <Building2 className="h-3.5 w-3.5 mr-1.5" />
                  {tender.company?.name || tender.company?.razonSocial || 'Empresa Privada'}
                </div>
              </CardHeader>

              <CardContent className="pt-5 flex-1 flex flex-col">
                <p className="text-sm text-gray-500 font-medium line-clamp-2 min-h-[2.5rem] mb-4">
                  {tender.description || "Sin descripción detallada."}
                </p>
                
                <div className="space-y-3 bg-gray-50/80 p-4 rounded-xl border border-gray-100 mt-auto">
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4.5 w-4.5 text-emerald-600 mr-3 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Presupuesto Tope</span>
                      <span className="font-bold text-brand-dark">
                        ${tender.budgetM2?.toLocaleString() || '0'} <span className="text-xs text-gray-500 font-medium">/m²</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4.5 w-4.5 text-brand-salmon mr-3 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Ubicación Obra</span>
                      <span className="font-semibold text-gray-700 line-clamp-1" title={tender.project?.address}>
                        {tender.project?.address || 'No especificada'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm">
                    <CalendarDays className="h-4.5 w-4.5 text-brand-blue mr-3 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Fecha Límite</span>
                      <span className="font-semibold text-gray-700">
                        {tender.deadline ? new Date(tender.deadline).toLocaleDateString() : 'No definida'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-white pt-4 pb-5 px-6 border-t border-gray-50">
                <Button 
                  className="w-full h-11 rounded-xl bg-brand-dark hover:bg-brand-dark/90 text-white font-bold shadow-md shadow-brand-dark/20 transition-all duration-300 group-hover:bg-brand-salmon group-hover:shadow-brand-salmon/20"
                  onClick={() => router.push(`/proveedor/tenders/${tender._id}`)}
                >
                  Ver Detalles y Postularse <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}