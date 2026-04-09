'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { projectsService, Project } from '@/services/projectsService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    description: '',
    address: '',
    budget: '',
    status: 'planning'
  });

  useEffect(() => {
    async function loadData() {
      try {
        const found = await projectsService.getById(projectId);
        setProject(found);
        setFormData({
          description: found.description || '',
          address: found.address || '',
          budget: found.budget?.toString() || '',
          status: found.status || 'planning'
        });
      } catch (error) {
        console.error("Error cargando proyecto:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await projectsService.update(projectId, {
        description: formData.description,
        address: formData.address,
        budget: formData.budget ? Number(formData.budget) : undefined,
        status: formData.status
      });
      
      toast.success('Proyecto actualizado', {
        description: 'La configuración de la obra se ha guardado exitosamente.'
      });
      
      router.push(`/companies/projects/${projectId}`);
    } catch (error) {
      console.error("Error actualizando:", error);
      
      toast.error('Error al actualizar', {
        description: 'Hubo un error al guardar el proyecto. Por favor, intenta nuevamente.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-gray-200 text-gray-500 hover:text-brand-dark hover:bg-gray-100 shrink-0" onClick={() => router.push(`/companies/projects/${projectId}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark tracking-tight">Configuración del Proyecto</h1>
          <p className="text-sm font-medium text-gray-500">Modifica los detalles operativos y el estado de {project?.name}</p>
        </div>
      </div>

      <Card className="border-none shadow-md bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <Building2 className="w-5 h-5 text-brand-blue" />
            Datos de la Obra
          </CardTitle>
          <CardDescription>
            Los cambios realizados aquí quedarán registrados en la auditoría del sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Estado del Proyecto</label>
              <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                <SelectTrigger className="h-12 bg-slate-50 text-slate-500 border-slate-200 rounded-xl">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  <SelectItem value="planning">Planificación</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="finished">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Descripción</label>
              <Input 
                className="h-12 bg-slate-50 text-slate-500 border-slate-200 rounded-xl"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Breve descripción del proyecto..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dirección / Ubicación</label>
              <Input 
                className="h-12 bg-slate-50 text-slate-500 border-slate-200 rounded-xl"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Ej: Av. Libertador 1234..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Presupuesto (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">USD</span>
                <Input 
                  type="number"
                  className="pl-14 h-12 bg-slate-50 text-slate-500 border-slate-200 rounded-xl"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>

          </form>
        </CardContent>
        <CardFooter className="bg-slate-50/80 border-t border-slate-100 p-6 flex justify-end">
          <Button 
            type="submit" 
            form="settings-form"
            disabled={saving} 
            className="h-11 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold px-8 shadow-md transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Guardar Cambios
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}