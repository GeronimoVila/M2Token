'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { tendersService } from '@/services/tendersService';
import { getActiveCategories } from '@/services/categoriesService';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Loader2, 
  Megaphone, 
  FileText, 
  Tag, 
  DollarSign, 
  CalendarDays, 
  AlertTriangle 
} from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  category: z.string().min(1, 'Selecciona una categoría'),
  budgetM2: z.coerce.number().min(1, 'El presupuesto debe ser mayor a 0'),
  deadline: z.string().min(1, 'Ingresa una fecha límite'),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewTenderPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const { user, isLoading: isAuthLoading } = useAuthStore();

  useEffect(() => {
    if (!isAuthLoading && user) {
      if (user.role === 'empresa_approver' || user.role === 'empresa_viewer') {
        router.push('/companies/dashboard');
      }
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (isAuthLoading || (user && (user.role === 'empresa_approver' || user.role === 'empresa_viewer'))) return;

    async function fetchCategories() {
      try {
        const data = await getActiveCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error cargando categorías', err);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, [isAuthLoading, user]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any, 
    defaultValues: {
      title: '',
      description: '',
      category: '',
      budgetM2: 0,
      deadline: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        ...values,
        project: projectId,
      };
      
      await tendersService.create(payload);
      
      router.refresh(); 
      router.push(`/companies/projects/${projectId}/tenders`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al crear la licitación');
    } finally {
      setIsLoading(false);
    }
  }

  if (isAuthLoading || (user && (user.role === 'empresa_approver' || user.role === 'empresa_viewer'))) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4 animate-in fade-in duration-500">
        <div className="h-16 w-16 bg-brand-light/20 rounded-2xl flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-salmon" />
        </div>
        <span className="text-brand-dark font-medium animate-pulse">Verificando permisos de acceso...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 min-h-[calc(100vh-6rem)]">

      <div className="flex items-center gap-4">
        <Link href={`/companies/projects/${projectId}/tenders`}>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-gray-200 text-gray-500 hover:text-brand-dark hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-dark">Nueva Licitación</h2>
          <p className="text-sm font-medium text-gray-500">
            Publica una necesidad para que los proveedores te envíen sus propuestas.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="rounded-2xl border-gray-100 shadow-lg shadow-gray-200/40 overflow-hidden">
          <div className="h-2 w-full bg-brand-salmon" />
          
          <CardHeader className="bg-white border-b border-gray-50 pb-6 pt-8 px-8">
            <CardTitle className="text-xl text-brand-dark flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-brand-salmon" />
              Detalles del Trabajo
            </CardTitle>
            <CardDescription className="text-gray-500">
              Especifica qué necesitas y cuánto estás dispuesto a pagar por metro cuadrado.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 bg-gray-50/30">
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
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-white font-semibold">Título de la Licitación <span className="text-brand-salmon">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input className="pl-10 h-11 rounded-xl border-gray-200 focus-visible:ring-brand-blue" placeholder="Ej: Instalación Eléctrica Completa Torre B" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-white font-semibold">Categoría / Especialidad requerida <span className="text-brand-salmon">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingCategories}>
                        <FormControl>
                          <div className="relative">
                            <Tag className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                            <SelectTrigger className="pl-10 h-11 rounded-xl border-gray-200 focus:ring-brand-blue">
                              <SelectValue placeholder={loadingCategories ? "Cargando categorías..." : "Selecciona una categoría..."} />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          {categories.map(cat => (
                            <SelectItem key={cat._id} value={cat._id} className="font-medium cursor-pointer focus:bg-brand-blue/10 focus:text-brand-blue">
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-white font-semibold">Descripción y Requisitos <span className="text-brand-salmon">*</span></FormLabel>
                      <FormControl>
                        <textarea 
                          className="flex min-h-[140px] w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-shadow resize-y"
                          placeholder="Describe detalladamente qué materiales se necesitan, plazos de entrega, normativas, y cualquier requisito excluyente..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <FormField
                    control={form.control}
                    name="budgetM2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-brand-white font-semibold">Presupuesto Referencia <span className="text-brand-salmon">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                                className="pl-10 h-11 rounded-xl border-gray-200 focus-visible:ring-brand-blue font-bold text-brand-white"
                                type="number" 
                                placeholder="0.00" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.value)} 
                            />
                            <span className="absolute right-4 top-3 text-xs font-bold text-gray-400 uppercase">USD / m²</span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-brand-white font-semibold">Fecha Límite para Postularse <span className="text-brand-salmon">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                            <Input 
                              type="date" 
                              className="pl-10 h-11 rounded-xl border-gray-200 focus-visible:ring-brand-blue"
                              {...field}
                              min={new Date().toISOString().split("T")[0]}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-8 mt-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
                  <Link href={`/companies/projects/${projectId}/tenders`} className="w-full sm:w-auto">
                    <Button type="button" variant="outline" className="w-full h-11 rounded-xl border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold">
                      Cancelar
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto h-11 rounded-xl bg-brand-salmon hover:bg-brand-salmon/90 text-white font-semibold shadow-md shadow-brand-salmon/20 transition-all">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Publicando...
                      </>
                    ) : (
                      <>
                        <Megaphone className="mr-2 h-5 w-5" /> Publicar Licitación
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