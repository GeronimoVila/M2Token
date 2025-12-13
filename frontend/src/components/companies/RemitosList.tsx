"use client";

import { useState } from 'react';
import { remitosService } from '@/services/remitosService';
import { Eye, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Remito {
  _id: string;
  numeroRemito: string;
  descripcion: string;
  monto: number;
  fechaEntrega: string;
  estado: 'pendiente' | 'validado' | 'rechazado';
  evidenceHash: string;
  proveedorId: {
    name: string;
    email: string;
  };
}

interface RemitosListProps {
  remitos: Remito[];
  projectId: string;
  token: string;
  onUpdate: () => void;
}

export default function RemitosList({ remitos, projectId, token, onUpdate }: RemitosListProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleValidation = async (id: string, estado: 'validado' | 'rechazado') => {
    if (!confirm(`¿Estás seguro de marcar este remito como ${estado}?`)) return;

    setProcessingId(id);
    try {
      await remitosService.validate(id, estado, token);
      onUpdate();
    } catch (error) {
      alert('Error al actualizar estado');
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const openEvidence = (hash: string) => {
    window.open(`https://gateway.pinata.cloud/ipfs/${hash}`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Control de Remitos ({remitos.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-medium">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">N° Remito</th>
                <th className="px-4 py-3">Proveedor</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Evidencia</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {remitos.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No hay remitos cargados aún.
                  </td>
                </tr>
              )}
              
              {remitos.map((remito) => (
                <tr key={remito._id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    {new Date(remito.fechaEntrega).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-medium">{remito.numeroRemito}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-100">
                        {remito.proveedorId?.name || 'Desconocido'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {remito.proveedorId?.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-100">
                    ${remito.monto.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openEvidence(remito.evidenceHash)}
                      className="gap-2"
                    >
                      <FileText className="h-4 w-4 text-blue-600" />
                      Ver PDF
                    </Button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${remito.estado === 'validado' ? 'bg-green-100 text-green-800' : 
                        remito.estado === 'rechazado' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {remito.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {remito.estado === 'pendiente' && (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          disabled={!!processingId}
                          onClick={() => handleValidation(remito._id, 'validado')}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={!!processingId}
                          onClick={() => handleValidation(remito._id, 'rechazado')}
                        >
                          <XCircle className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}