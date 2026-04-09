"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { remitosService } from '@/services/remitosService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  FileText, 
  CalendarDays, 
  DollarSign, 
  AlignLeft, 
  UploadCloud,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
    if (!file) {
      return toast.warning('Archivo faltante', {
        description: 'Por favor adjunta el PDF del remito antes de continuar.'
      });
    }

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

      toast.success('¡Remito Cargado!', {
        description: 'El documento se ha subido y registrado correctamente.'
      });
      
      router.refresh();
      router.push(`/proveedor/projects/${projectId}`);

    } catch (error: any) {
      toast.error('Error de carga', {
        description: error.message || 'Ocurrió un error al subir el remito.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="numeroRemito" className="text-brand-dark font-bold">N° Remito / Factura <span className="text-brand-salmon">*</span></Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
              <Input
                id="numeroRemito"
                required
                className="pl-10 h-11 rounded-xl border-gray-200 focus-visible:ring-brand-blue font-mono font-bold text-brand-dark uppercase"
                placeholder="Ej: R-0001-12345678"
                value={formData.numeroRemito}
                onChange={(e) => setFormData({...formData, numeroRemito: e.target.value.toUpperCase()})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaEntrega" className="text-brand-dark font-bold">Fecha de Emisión <span className="text-brand-salmon">*</span></Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400 pointer-events-none" />
              <Input
                id="fechaEntrega"
                type="date"
                required
                className="pl-10 h-11 rounded-xl border-gray-200 focus-visible:ring-brand-blue font-medium text-brand-dark"
                value={formData.fechaEntrega}
                onChange={(e) => setFormData({...formData, fechaEntrega: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="monto" className="text-brand-dark font-bold">Monto Total a Certificar <span className="text-brand-salmon">*</span></Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="monto"
              type="number"
              required
              className="pl-10 pr-16 h-12 rounded-xl border-gray-200 focus-visible:ring-brand-blue font-extrabold text-brand-dark text-lg"
              placeholder="0.00"
              value={formData.monto}
              onChange={(e) => setFormData({...formData, monto: e.target.value})}
              min="0.01"
              step="0.01"
            />
            <div className="absolute right-4 top-3 text-xs font-bold text-gray-400 flex flex-col leading-none text-right">
              <span>(Equivalente en)</span>
              <span className="text-brand-blue">Tokens m²</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Ingresa el monto total pactado por este avance/entrega. Este valor se convertirá en tokens m².
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion" className="text-brand-dark font-bold">Descripción del Trabajo o Materiales</Label>
          <div className="relative">
            <AlignLeft className="absolute left-3 top-3.5 h-4.5 w-4.5 text-gray-400" />
            <textarea
              id="descripcion"
              className="flex min-h-[120px] w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue disabled:cursor-not-allowed disabled:opacity-50 resize-y font-medium text-brand-dark"
              placeholder="Detalla brevemente qué se entregó o certificó en este remito..."
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-brand-dark font-bold">Evidencia Documental (PDF) <span className="text-brand-salmon">*</span></Label>
          <div className={cn(
              "relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 group overflow-hidden",
              file 
                ? "border-emerald-400 bg-emerald-50/50" 
                : "border-gray-300 bg-gray-50 hover:bg-brand-blue/5 hover:border-brand-blue/30"
          )}>
            <Input
              id="file"
              type="file"
              accept="application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleFileChange}
              required
            />
            
            <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
              {file ? (
                <>
                  <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2 shadow-sm">
                    <FileCheck className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-emerald-700 font-bold text-lg">{file.name}</p>
                    <p className="text-emerald-600/80 text-sm font-medium flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Archivo listo para tokenizar
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 font-medium bg-white px-3 py-1 rounded-full border shadow-sm mt-2">
                    Click para cambiar archivo
                  </span>
                </>
              ) : (
                <>
                  <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center text-brand-blue shadow-sm mb-2 group-hover:scale-110 transition-transform duration-300">
                    <UploadCloud className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-brand-dark font-bold text-lg">Sube o arrastra el documento</p>
                    <p className="text-gray-500 text-sm font-medium">Solo se permiten archivos en formato .PDF</p>
                  </div>
                  <Button type="button" variant="outline" className="mt-4 bg-white text-gray-900 hover:bg-gray-50 border-gray-200 pointer-events-none">
                    Seleccionar Archivo
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <Button 
            type="submit" 
            className="w-full sm:w-auto h-12 px-8 rounded-xl bg-brand-dark hover:bg-brand-dark/90 text-white font-bold shadow-xl shadow-brand-dark/20 transition-transform hover:-translate-y-1 text-lg" 
            disabled={loading || !file}
          >
            {loading ? (
              <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> Registrando en Blockchain...</>
            ) : (
              <><UploadCloud className="mr-3 h-5 w-5 text-brand-salmon" /> Guardar y Tokenizar</>
            )}
          </Button>
        </div>

      </form>
    </div>
  );
}