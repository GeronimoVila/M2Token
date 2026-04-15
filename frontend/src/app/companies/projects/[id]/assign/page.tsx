'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usersService } from "@/services/usersService";
import { getActiveCategories } from "@/services/categoriesService";
// 👇 1. Agregamos el servicio de asignaciones
import { assignmentsService } from '@/services/assignmentsService';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { 
  UserPlus, 
  Package, 
  Phone, 
  Mail, 
  ArrowLeft, 
  Loader2, 
  Users, 
  Search, 
  MapPin, 
  Star, 
  Briefcase,
  CheckCircle2,
  Filter
} from 'lucide-react';
// 👇 2. Agregamos toast de sonner
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AssignedProvidersPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [viewMode, setViewMode] = useState<'assigned' | 'directory'>('assigned');
  
  const [groupedProviders, setGroupedProviders] = useState<Record<string, any[]>>({});
  const [loadingAssigned, setLoadingAssigned] = useState(true);

  const [providers, setProviders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [locationTerm, setLocationTerm] = useState("");
  const { user, isLoading: isAuthLoading } = useAuthStore();
  
  // 👇 3. Estado para saber qué proveedor estamos asignando y mostrar el spinner
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user) {
      if (user.role === 'empresa_approver' || user.role === 'empresa_viewer') {
        router.push('/companies/dashboard');
      }
    }
  }, [user, isAuthLoading, router]);

  // 👇 4. Extraemos fetchAssignments a un useCallback para poder llamarlo después de asignar
  const fetchAssignments = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token') || '';
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/assignments/project/${projectId}`, {
        headers,
        credentials: 'include', 
      });
      const json = await res.json();
      
      if (!res.ok) {
         throw new Error(json.message || "Error al cargar proveedores");
      }

      const dataToSet = json.success ? json.data : json;
      setGroupedProviders(typeof dataToSet === 'object' && !Array.isArray(dataToSet) ? dataToSet : {});
    } catch (error) {
      console.error("Error cargando asignaciones:", error);
    } finally {
      setLoadingAssigned(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isAuthLoading || (user && (user.role === 'empresa_approver' || user.role === 'empresa_viewer'))) return;
    fetchAssignments();
  }, [fetchAssignments, isAuthLoading, user]);

  useEffect(() => {
    if (isAuthLoading || (user && (user.role === 'empresa_approver' || user.role === 'empresa_viewer'))) return;

    async function fetchCategories() {
      const data = await getActiveCategories();
      if (Array.isArray(data)) setCategories(data);
    }
    fetchCategories();
  }, [isAuthLoading, user]);

  const fetchDirectoryProviders = useCallback(async () => {
    if (viewMode !== 'directory') return;
    
    setLoadingDirectory(true);
    try {
      const data = await usersService.getProviders({
        search: searchTerm,
        category: selectedCategory,
        location: locationTerm,
      });
      setProviders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching providers:", error);
    } finally {
      setLoadingDirectory(false);
    }
  }, [searchTerm, selectedCategory, locationTerm, viewMode]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDirectoryProviders();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchDirectoryProviders]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setLocationTerm("");
  };

  // 👇 5. Agregamos la función que hace el contrato real en esta misma vista
  const handleAssign = async (providerId: string) => {
    setAssigningId(providerId);
    try {
      await assignmentsService.assignProvider({ projectId, providerId });
      
      toast.success("Proveedor asignado", {
        description: "El profesional ha sido incorporado al proyecto exitosamente."
      });
      
      // Cambiamos a la vista de "Asignados" y recargamos la lista
      setViewMode('assigned');
      fetchAssignments();
      
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error("No se pudo asignar", {
        description: errorMsg || 'Es posible que este proveedor ya esté asignado a la obra.'
      });
    } finally {
      setAssigningId(null);
    }
  };

  const assignedCategoriesKeys = Object.keys(groupedProviders);

  const getInitials = (name: string) => {
    if (!name) return 'PR';
    return name.substring(0, 2).toUpperCase();
  };

  if (isAuthLoading || (user && (user.role === 'empresa_approver' || user.role === 'empresa_viewer'))) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4 animate-in fade-in duration-500">
        <div className="h-16 w-16 bg-brand-light/20 rounded-2xl flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        </div>
        <span className="text-brand-dark font-medium animate-pulse">Verificando accesos del proyecto...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 min-h-[calc(100vh-6rem)]">
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-start sm:items-center gap-4">
          <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-gray-200 text-gray-500 hover:text-brand-dark hover:bg-gray-100 shrink-0 transition-colors" onClick={() => router.push(`/companies/projects/${projectId}`)}>
            <ArrowLeft className="h-5 w-5"/>
          </Button>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-brand-dark">Gestión de proveedores</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">Administra los proveedores de tu obra o busca nuevos talentos.</p>
          </div>
        </div>
        
        <div className="flex bg-gray-100/80 p-1 rounded-xl w-full lg:w-auto border border-gray-200/50 shadow-inner">
          <button 
            onClick={() => setViewMode('assigned')} 
            className={cn(
              "flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300",
              viewMode === 'assigned' 
                ? "bg-white shadow-sm text-brand-blue ring-1 ring-gray-200/50" 
                : "text-gray-500 hover:text-brand-dark hover:bg-gray-200/50"
            )}
          >
            <Users className="h-4 w-4" /> Asignados
          </button>
          <button 
            onClick={() => setViewMode('directory')} 
            className={cn(
              "flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300",
              viewMode === 'directory' 
                ? "bg-white shadow-sm text-brand-salmon ring-1 ring-gray-200/50" 
                : "text-gray-500 hover:text-brand-dark hover:bg-gray-200/50"
            )}
          >
            <Search className="h-4 w-4" /> Explorar Directorio
          </button>
        </div>
      </div>

      {viewMode === 'assigned' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {loadingAssigned ? (
            <div className="space-y-6 animate-pulse">
              {[1, 2].map(i => (
                <div key={i} className="h-48 bg-gray-100 rounded-2xl border border-gray-200" />
              ))}
            </div>
          ) : assignedCategoriesKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50 text-center">
               <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mb-6">
                  <Users className="h-10 w-10 text-brand-blue" />
               </div>
               <h3 className="text-2xl font-bold text-brand-dark mb-2">Sin proveedores asignados</h3>
               <p className="text-gray-500 max-w-md mx-auto mb-8">
                 Actualmente no hay proveedores trabajando en esta obra. Explora el directorio para reclutar.
               </p>
               <Button onClick={() => setViewMode('directory')} className="bg-brand-blue hover:bg-brand-blue/90 text-white shadow-lg shadow-brand-blue/20 h-11 px-6 rounded-xl">
                  <Search className="mr-2 h-5 w-5" /> Buscar Proveedores
               </Button>
            </div>
          ) : (
            assignedCategoriesKeys.map((category) => {
              const providersList = Array.isArray(groupedProviders[category]) ? groupedProviders[category] : [];
              return (
                <div key={category} className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-blue border border-gray-200">
                        <Package className="h-5 w-5" />
                      </div>
                      <h3 className="font-extrabold text-lg capitalize text-brand-dark">{category}</h3>
                      <span className="text-xs bg-brand-dark text-white px-2.5 py-1 rounded-full font-bold shadow-sm">
                        {providersList.length}
                      </span>
                  </div>
                  <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {providersList.map((item: any) => {
                      const providerName = item.provider?.name || item.provider?.razonSocial || 'Proveedor';
                      return (
                        <Card key={item.assignmentId || Math.random()} className="group relative overflow-hidden rounded-xl border border-gray-200 hover:shadow-lg hover:shadow-brand-blue/5 hover:-translate-y-1 transition-all duration-300">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-blue transition-opacity" />
                          <CardContent className="p-5 flex flex-col gap-4">
                              <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-blue to-[#495867] flex items-center justify-center text-white font-bold text-lg shadow-inner shrink-0">
                                  {getInitials(providerName)}
                                </div>
                                <div className="flex flex-col">
                                  <h4 className="font-extrabold text-brand-dark line-clamp-1 group-hover:text-brand-blue transition-colors">{providerName}</h4>
                                  <span className="text-[10px] uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold w-fit mt-1 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3"/> Asignado
                                  </span>
                                </div>
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-3 space-y-2 mt-2 border border-gray-100">
                                  <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Mail className="h-4 w-4 text-brand-blue shrink-0"/> 
                                    <span className="line-clamp-1 font-medium">{item.provider?.email || 'No especificado'}</span>
                                  </div>
                                  {item.provider?.phone && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                      <Phone className="h-4 w-4 text-brand-blue shrink-0"/> 
                                      <span className="font-medium">{item.provider.phone}</span>
                                    </div>
                                  )}
                              </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {viewMode === 'directory' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

          <Card className="bg-white border-gray-200 shadow-md shadow-brand-dark/5 rounded-2xl overflow-hidden">
            <div className="h-1.5 w-full bg-brand-salmon" />
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4 text-brand-dark font-bold">
                <Filter className="w-5 h-5 text-brand-salmon" /> 
                Filtros de Búsqueda
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre, palabra clave..."
                    className="pl-11 h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-brand-salmon font-medium text-brand-dark"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:ring-brand-salmon font-medium text-brand-dark">
                      <SelectValue placeholder="Categoría Especializada" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all" className="font-bold text-brand-salmon">🌐 Todas las categorías</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id} className="cursor-pointer focus:bg-brand-salmon/10">
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {loadingDirectory ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-pulse">
               {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-48 bg-white border border-gray-200 rounded-2xl" />
               ))}
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-24 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-brand-dark">Directorio sin resultados</h3>
              <p className="text-gray-500 mt-2 max-w-sm mx-auto">Intenta ajustar tu búsqueda o limpiar los filtros de categoría.</p>
              <Button onClick={handleClearFilters} variant="outline" className="mt-6 border-brand-salmon text-brand-salmon hover:bg-brand-salmon/10 rounded-xl">
                Limpiar Filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {providers.map((provider) => {
                const provName = provider.razonSocial || provider.name;
                
                return (
                  <Card key={provider._id} className="flex flex-col sm:flex-row hover:shadow-xl hover:shadow-brand-salmon/10 transition-all duration-300 overflow-hidden rounded-2xl border-gray-200 group">
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-brand-light/30 border border-brand-light flex items-center justify-center text-brand-blue font-extrabold text-xl shrink-0 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                              {getInitials(provName)}
                            </div>
                            <div className="flex flex-col">
                              <CardTitle className="text-lg font-extrabold text-brand-dark line-clamp-1 group-hover:text-brand-salmon transition-colors">
                                {provName}
                              </CardTitle>
                              {provider.category && (
                                <span className="text-[11px] font-bold text-brand-blue uppercase tracking-wider mt-0.5">
                                  {provider.category.label}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-md shadow-sm">
                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 mr-1.5" />
                            <span className="text-xs font-extrabold text-amber-700">{provider.rating > 0 ? provider.rating : "N/A"}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-500 mt-4 line-clamp-2 min-h-[2.5rem]">
                          {provider.description || "Proveedor verificado de la red. Sin descripción detallada en su perfil."}
                        </p>

                        {provider.specialties && provider.specialties.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {provider.specialties.slice(0, 3).map((spec: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-[10px] uppercase font-bold tracking-wider bg-brand-light/10 text-brand-blue border-brand-light/50">
                                {spec}
                              </Badge>
                            ))}
                            {provider.specialties.length > 3 && (
                              <Badge variant="outline" className="text-[10px] bg-gray-50 text-gray-500 border-gray-200 font-bold">
                                +{provider.specialties.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-gray-100 pt-5 gap-4">
                          <div className="flex items-center text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
                             <MapPin className="h-4 w-4 mr-2 text-brand-salmon shrink-0" />
                             <span className="line-clamp-1 max-w-[150px] sm:max-w-[180px]">{provider.address || 'Ubicación no especificada'}</span>
                          </div>
                          
                          {/* 👇 6. Actualizamos el botón para que ejecute la nueva función */}
                          <Button 
                            className="bg-brand-salmon hover:bg-brand-salmon/90 text-white w-full sm:w-auto rounded-xl shadow-md shadow-brand-salmon/20 transition-transform hover:-translate-y-0.5"
                            onClick={() => handleAssign(provider._id)}
                            disabled={assigningId === provider._id}
                          >
                            {assigningId === provider._id ? (
                              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Asignando...</>
                            ) : (
                              <><UserPlus className="h-4 w-4 mr-2" /> Asignar a Obra</>
                            )}
                          </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}