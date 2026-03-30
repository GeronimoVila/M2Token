'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usersService } from "@/services/usersService";
import { getActiveCategories } from "@/services/categoriesService";
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Package, Phone, Mail, ArrowLeft, Loader2, Users, Search, MapPin, Star, Briefcase } from 'lucide-react';

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

  useEffect(() => {
    if (!isAuthLoading && user) {
      if (user.role === 'empresa_approver' || user.role === 'empresa_viewer') {
        router.push('/companies/dashboard');
      }
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (isAuthLoading || (user && (user.role === 'empresa_approver' || user.role === 'empresa_viewer'))) return;

    async function fetchAssignments() {
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
    }
    fetchAssignments();
  }, [projectId, isAuthLoading, user]);

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

  const assignedCategoriesKeys = Object.keys(groupedProviders);

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
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
             <Button variant="outline" size="icon" onClick={() => router.push(`/companies/projects/${projectId}`)}>
                <ArrowLeft className="h-4 w-4"/>
             </Button>
             <div>
                <h2 className="text-3xl font-bold tracking-tight text-brand-dark">Gestión de Proveedores</h2>
                <p className="text-gray-500">Administra tu equipo actual o busca nuevos talentos.</p>
             </div>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
          <button 
            onClick={() => setViewMode('assigned')} 
            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'assigned' ? 'bg-white shadow-sm text-brand-dark' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Equipo Asignado
          </button>
          <button 
            onClick={() => setViewMode('directory')} 
            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'directory' ? 'bg-white shadow-sm text-brand-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <span className="flex items-center justify-center gap-2">
              <Search className="h-4 w-4" /> Buscar Nuevos
            </span>
          </button>
        </div>
      </div>

      {viewMode === 'assigned' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {loadingAssigned ? (
             <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand-blue h-8 w-8" /></div>
          ) : assignedCategoriesKeys.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/30">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
               </div>
               <h3 className="text-lg font-medium text-gray-900">Sin proveedores asignados</h3>
               <p className="text-gray-500 max-w-sm mx-auto mb-6">Actualmente no hay proveedores trabajando en esta obra.</p>
               <Button onClick={() => setViewMode('directory')} className="bg-brand-blue hover:bg-brand-blue/90 text-white">
                  <Search className="mr-2 h-4 w-4" /> Explorar Directorio
               </Button>
            </div>
          ) : (
            assignedCategoriesKeys.map((category) => {
              const providersList = Array.isArray(groupedProviders[category]) ? groupedProviders[category] : [];
              return (
                <div key={category} className="border rounded-xl bg-white shadow-sm overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-brand-light/30 flex items-center justify-center text-brand-blue">
                        <Package className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-lg capitalize text-brand-dark">{category}</h3>
                      <span className="text-xs bg-white border px-2 py-1 rounded-full text-gray-500 font-medium">
                        {providersList.length}
                      </span>
                  </div>
                  <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {providersList.map((item: any) => (
                      <Card key={item.assignmentId || Math.random()} className="border-l-4 border-l-brand-blue shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-800 line-clamp-1">{item.provider?.name || item.provider?.razonSocial || 'Proveedor'}</h4>
                                <span className="text-[10px] uppercase tracking-wide bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Activo</span>
                            </div>
                            <div className="text-sm text-gray-500 space-y-1 mt-3">
                                <div className="flex items-center gap-2"><Mail className="h-3 w-3 shrink-0"/> <span className="line-clamp-1">{item.provider?.email || 'N/A'}</span></div>
                                {item.provider?.phone && <div className="flex items-center gap-2"><Phone className="h-3 w-3 shrink-0"/> {item.provider.phone}</div>}
                            </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {viewMode === 'directory' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, especialidad o palabra clave..."
                  className="pl-9 bg-gray-50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-gray-50">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loadingDirectory ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-brand-blue" />
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
              <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No hay resultados</h3>
              <p className="text-slate-500 mt-1">Intenta ajustando los filtros de búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {providers.map((provider) => (
                <Card key={provider._id} className="flex flex-col sm:flex-row hover:shadow-md transition-shadow overflow-hidden">
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-bold line-clamp-1">
                            {provider.razonSocial || provider.name}
                          </CardTitle>
                          {provider.category && (
                            <span className="inline-block mt-1 text-xs font-semibold text-brand-blue bg-blue-50 px-2 py-1 rounded-md">
                              {provider.category.label}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center bg-amber-50 px-2 py-1 rounded-md">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500 mr-1" />
                          <span className="text-xs font-bold text-amber-700">{provider.rating > 0 ? provider.rating : "N/A"}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                        {provider.description || "Sin descripción detallada."}
                      </p>

                      {provider.specialties && provider.specialties.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {provider.specialties.slice(0, 3).map((spec: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-[10px] bg-slate-50 text-slate-600 font-normal">
                              {spec}
                            </Badge>
                          ))}
                          {provider.specialties.length > 3 && (
                            <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 font-normal">
                              +{provider.specialties.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                        <div className="flex items-center text-xs text-slate-500">
                           <MapPin className="h-3 w-3 mr-1" />
                           <span className="line-clamp-1 max-w-[120px]">{provider.address || 'Ubicación no especificada'}</span>
                        </div>
                        
                        <Button 
                          size="sm"
                          className="bg-brand-salmon hover:bg-brand-salmon/90 text-white"
                          onClick={() => router.push(`/companies/projects/${projectId}/assign/new?providerId=${provider._id}`)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" /> Asignar al Proyecto
                        </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}