"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import RemitoForm from '@/components/proveedor/RemitoForm';

export default function NewRemitoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 animate-pulse">Cargando...</p>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="container py-10 text-center">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg inline-block">
          <h3 className="font-bold">⚠️ Falta información del proyecto</h3>
          <p>No seleccionaste a qué obra pertenece este remito.</p>
          <button 
            onClick={() => router.back()}
            className="mt-2 text-blue-600 hover:underline"
          >
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-6">
        <button 
          onClick={() => router.back()} 
          className="text-sm text-gray-500 hover:text-gray-900 mb-2 flex items-center gap-1"
        >
          ← Volver al proyecto
        </button>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Obra</h1>
        <p className="text-muted-foreground">
          Carga de comprobantes y remitos para certificación en Blockchain.
        </p>
      </div>

      <RemitoForm projectId={projectId} token={""} />
    </div>
  );
}