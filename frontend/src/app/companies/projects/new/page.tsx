'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { projectsService } from '@/services/projectsService';
import { useAuthStore } from '@/store/useAuthStore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Save, Building, AlignLeft, MapPin, DollarSign, Activity, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  address: z.string().optional(),
  budget: z.coerce.number().min(0, 'El presupuesto no puede ser negativo').optional(),
  status: z.enum(['planning', 'in_progress', 'paused', 'finished']),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewProjectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { user, isLoading: isAuthLoading } = useAuthStore();

  useEffect(() => {
    if (!isAuthLoading && user) {
      if (user.role === 'empresa_approver' || user.role === 'empresa_viewer') {
        router.push('/companies/dashboard');
      }
    }
  }, [user, isAuthLoading, router]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any, 
    defaultValues: {
      name: '',
      description: '',
      address: '',
      budget: 0,
      status: 'planning',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        ...values,
        description: values.description || undefined,
        address: values.address || undefined,
      };
      await projectsService.create(payload);
      router.refresh(); 
      router.push('/companies/projects');
    } catch (err: any) {
      setError(err.message || 'Error al crear el proyecto');
    } finally {
      setIsLoading(false);
    }
  }

  if (isAuthLoading || (user && (user.role === 'empresa_approver' || user.role === 'empresa_viewer'))) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4 animate-in fade-in duration-500">
        <div className="h-16 w-16 bg-brand-light/20 rounded-2xl flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        </div>
        <span className="text-brand-dark font-medium animate-pulse">Verificando permisos de acceso...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 min-h-[calc(100vh-6rem)]">
      
      <div className="flex items-center gap-4">
        <Link href="/companies/projects">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-gray-200 text-gray-500 hover:text-brand-dark hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-dark">Crear Proyecto</h2>
          <p className="text-sm font-medium text-gray-500">
            Define los detalles de tu nueva obra para comenzar a tokenizar.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="rounded-2xl border-gray-100 shadow-lg shadow-gray-200/40 overflow-hidden">
          <div className="h-2 w-full bg-brand-blue" />
          
          <CardHeader className="bg-white border-b border-gray-50 pb-6 pt-8 px-8">
            <CardTitle className="text-xl text-brand-dark flex items-center gap-2">
              <Building className="h-5 w-5 text-brand-blue" />
              Ficha Técnica del Proyecto
            </CardTitle>
            <CardDescription className="text-gray-500">
              Esta información será visible para los proveedores y en las licitaciones asociadas.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 bg-gray-900">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="bg-brand-blue/5 font-semibold">Nombre de la Obra / Proyecto <span className="text-brand-salmon">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input className="pl-10 h-11 rounded-xl border-gray-200 focus-visible:ring-brand-blue" placeholder="Ej: Complejo Residencial Nova..." {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="bg-brand-blue/5 font-semibold">Descripción Breve</FormLabel>
                      <FormControl>
                        <div className="relative">
                           <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                           <Input className="pl-10 h-11 rounded-xl border-gray-200 focus-visible:ring-brand-blue" placeholder="Detalla el propósito y alcance general..." {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-1">
                        <FormLabel className="bg-brand-blue/5 font-semibold">Ubicación Física</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input className="pl-10 h-11 rounded-xl border-gray-200 focus-visible:ring-brand-blue" placeholder="Ej: Av. Libertador 1234..." {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="bg-brand-blue/5 font-semibold">Presupuesto (USD)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                                className="pl-10 h-11 rounded-xl border-gray-200 focus-visible:ring-brand-blue font-medium"
                                type="number" 
                                placeholder="0.00" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.value)} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="bg-brand-blue/5 font-semibold">Estado Inicial</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl border-gray-200 focus:ring-brand-blue">
                              <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-gray-400" />
                                <SelectValue placeholder="Selecciona estado..." />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="planning" className="font-medium text-brand-blue focus:bg-brand-blue/10">📅 En Planificación</SelectItem>
                            <SelectItem value="in_progress" className="font-medium text-emerald-600 focus:bg-emerald-50">🚧 En Progreso</SelectItem>
                            <SelectItem value="paused" className="font-medium text-amber-600 focus:bg-amber-50">⏸️ Pausado</SelectItem>
                            <SelectItem value="finished" className="font-medium text-gray-600 focus:bg-gray-100">✅ Finalizado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-8 mt-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
                  <Link href="/companies/projects" className="w-full sm:w-auto">
                    <Button type="button" variant="outline" className="w-full h-11 rounded-xl border-gray-200 hover:bg-gray-900 text-red-600 font-semibold">
                      Cancelar
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto h-11 rounded-xl bg-brand-dark hover:bg-brand-dark/90 text-white font-semibold shadow-md shadow-brand-dark/20 transition-all">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Registrando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-5 w-5" /> Confirmar y Crear
                      </>
                    )}
                  </Button>
                </div>

              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}