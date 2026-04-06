"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import RemitoForm from '@/components/proveedor/RemitoForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertTriangle, FileText } from 'lucide-react';

export default function NewRemitoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4 animate-in fade-in duration-500">
        <div className="h-16 w-16 bg-brand-light/20 rounded-2xl flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        </div>
        <span className="text-brand-dark font-medium animate-pulse">Preparando entorno seguro...</span>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-8 min-h-[calc(100vh-6rem)] flex items-center justify-center animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center text-center p-8 bg-amber-50 border-2 border-dashed border-amber-200 rounded-3xl max-w-md shadow-sm">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="h-10 w-10 text-amber-600" />
          </div>
          <h3 className="text-2xl font-extrabold text-brand-dark mb-2">Falta Información</h3>
          <p className="text-amber-700 font-medium mb-8">
            No has seleccionado a qué proyecto u obra pertenece este remito. Debes iniciar este proceso desde el panel de un proyecto.
          </p>
          <Button 
            onClick={() => router.back()}
            className="bg-brand-dark hover:bg-brand-dark/90 text-white shadow-lg shadow-brand-dark/20 h-11 px-8 rounded-xl"
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> Volver al Proyecto
          </Button>
        </div>
      </div>
    );
  }

  const token = typeof window !== 'undefined' ? (localStorage.getItem('access_token') || '') : '';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 min-h-[calc(100vh-6rem)]">
      
      <div className="flex items-start sm:items-center gap-4">
        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-gray-200 text-gray-500 hover:text-brand-dark hover:bg-gray-100 shrink-0 transition-colors" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5"/>
        </Button>
        <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-brand-dark flex items-center gap-3">
              Cargar Remito
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-light/20 text-brand-blue border border-brand-blue/10">
                <FileText className="w-3.5 h-3.5" /> Nuevo Documento
              </span>
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Carga tu comprobante de entrega o avance para solicitar la certificación y tokenización.
            </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-brand-dark/5 border border-gray-100 overflow-hidden">
        <div className="h-1.5 w-full bg-brand-blue" />
        <div className="p-1">
          <RemitoForm projectId={projectId} token={token} />
        </div>
      </div>

    </div>
  );
}