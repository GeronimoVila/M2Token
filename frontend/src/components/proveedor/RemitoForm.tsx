"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { remitosService } from '@/services/remitosService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface RemitoFormProps {
  projectId: string;
  token: string;
}

export default function RemitoForm({ projectId, token }: RemitoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    numeroRemito: '',
    descripcion: '',
    monto: '',
    fechaEntrega: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Por favor adjunta el PDF del remito');

    setLoading(true);
    try {
      await remitosService.upload({
        projectId,
        numeroRemito: formData.numeroRemito,
        descripcion: formData.descripcion,
        monto: Number(formData.monto),
        fechaEntrega: formData.fechaEntrega,
        file: file
      }, token);

      alert('✅ Remito cargado correctamente');
      router.refresh();
      router.push('/proveedor');

    } catch (error: any) {
      alert(`❌ Error: ${error.message || 'Falló la carga'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Cargar Nuevo Remito</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numeroRemito">N° Remito / Factura</Label>
              <Input
                id="numeroRemito"
                required
                placeholder="Ej: A-0001-12345678"
                value={formData.numeroRemito}
                onChange={(e) => setFormData({...formData, numeroRemito: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaEntrega">Fecha de Entrega</Label>
              <Input
                id="fechaEntrega"
                type="date"
                required
                value={formData.fechaEntrega}
                onChange={(e) => setFormData({...formData, fechaEntrega: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monto">Monto Total ($)</Label>
            <Input
              id="monto"
              type="number"
              required
              placeholder="0.00"
              value={formData.monto}
              onChange={(e) => setFormData({...formData, monto: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción / Materiales</Label>
            <textarea
              id="descripcion"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Detalle breve de lo entregado..."
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Evidencia (PDF)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
              <Input
                id="file"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <Label htmlFor="file" className="cursor-pointer block">
                {file ? (
                  <span className="text-green-600 font-semibold flex items-center justify-center gap-2">
                    📄 {file.name}
                  </span>
                ) : (
                  <span className="text-gray-500">
                    Click para subir PDF o arrastra aquí
                  </span>
                )}
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Subiendo a Blockchain...' : 'Guardar y Enviar'}
          </Button>

        </form>
      </CardContent>
    </Card>
  );
}