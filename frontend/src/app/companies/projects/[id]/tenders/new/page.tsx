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
import { ArrowLeft, Loader2, Megaphone } from 'lucide-react';
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
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        <span className="ml-2 text-brand-dark font-medium">Verificando accesos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href={`/companies/projects/${projectId}/tenders`}>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Nueva Licitación</h2>
          <p className="text-muted-foreground">
            Publica una necesidad para que los proveedores te envíen sus propuestas.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="rounded-xl border shadow-sm">
          <CardHeader>
            <CardTitle>Detalles del Trabajo</CardTitle>
            <CardDescription>Especifica qué necesitas y cuánto estás dispuesto a pagar por metro cuadrado.</CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
                
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
                    {error}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título de la Licitación</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Instalación Eléctrica Completa Torre B" {...field} />
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
                      <FormLabel>Categoría / Especialidad requerida</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingCategories}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={loadingCategories ? "Cargando categorías..." : "Selecciona una categoría..."} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat._id} value={cat._id}>{cat.label}</SelectItem>
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
                      <FormLabel>Descripción y Requisitos</FormLabel>
                      <FormControl>
                        <textarea 
                          className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Describe detalladamente qué materiales se necesitan, plazos de entrega, normativas, etc." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="budgetM2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Presupuesto Máximo</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                            <Input 
                                className="pl-7"
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
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha Límite para Postularse</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field}
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t">
                  <Link href={`/companies/projects/${projectId}/tenders`}>
                    <Button type="button" variant="ghost">Cancelar</Button>
                  </Link>
                  <Button type="submit" className="bg-brand-salmon hover:bg-brand-salmon/90 text-white" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publicando...
                      </>
                    ) : (
                      <>
                        <Megaphone className="mr-2 h-4 w-4" /> Publicar Licitación
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