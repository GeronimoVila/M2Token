"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usersService } from '@/services/usersService'; 
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Users, ShieldAlert, ShieldCheck, ChevronLeft, ChevronRight, X, Mail, Phone, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const limit = 15;

  const fetchUsers = async (currentPage = 1, searchQuery = search) => {
    setLoading(true);
    try {
      const response = await usersService.getAllUsers(currentPage, limit, searchQuery);
      const resultData = response.data || response;
      
      setUsers(resultData.data || []);
      setTotalPages(resultData.pagination?.totalPages || 1);
      setTotalItems(resultData.pagination?.total || 0);
      setPage(currentPage);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        router.push('/unauthorized');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1, search);
  };

  const clearSearch = () => {
    setSearch('');
    fetchUsers(1, '');
  };

  const handleToggleStatus = async (userId: string) => {
    if (!window.confirm('¿Estás seguro de cambiar el estado de este usuario?')) return;
    
    setActionLoading(userId);
    try {
      await usersService.toggleUserStatus(userId);
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
      toast.success("Estado actualizado", {
        description: "El estado del usuario ha sido modificado exitosamente."
      });
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error("Error al actualizar", {
        description: "Hubo un error al cambiar el estado del usuario."
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatRole = (role: string) => {
    const roles: Record<string, string> = { 
      'proveedor': 'Proveedor', 
      'empresa_owner': 'Empresa', 
      'empresa_admin': 'Empresa Admin', 
      'superadmin': 'Súper Admin' 
    };
    return roles[role] || role.toUpperCase();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 px-4 sm:px-0">
      
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 gap-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 tracking-tight">Directorio de Cuentas</h3>
                <p className="text-xs text-slate-500 font-medium">{totalItems} usuarios registrados</p>
              </div>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
              <div className="relative w-full sm:flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Nombre, email o CUIT..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-8 bg-white text-slate-900 border-slate-200 focus:ring-brand-blue/20 w-full"
                />
                {search && (
                  <button type="button" onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-salmon transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button type="submit" className="bg-brand-blue hover:bg-brand-blue/90 text-white w-full sm:w-auto px-6">
                Buscar
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md bg-white overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
               <Loader2 className="w-10 h-10 animate-spin text-brand-blue" />
               <p className="text-sm font-medium text-slate-400 animate-pulse">Sincronizando base de datos...</p>
            </div>
          ) : users.length > 0 ? (
            <div className="w-full">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[11px] text-slate-400 uppercase tracking-widest bg-slate-50/80 border-b border-slate-100 font-bold">
                    <tr>
                      <th className="px-8 py-4">Usuario / Identificación</th>
                      <th className="px-6 py-4">Contacto</th>
                      <th className="px-6 py-4">Jerarquía</th>
                      <th className="px-6 py-4 text-center">Estado</th>
                      <th className="px-8 py-4 text-right">Gestión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map((user) => (
                      <tr key={user._id} className="group hover:bg-slate-50/50 transition-all">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                             <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                               {user.name?.substring(0, 2).toUpperCase() || 'U'}
                             </div>
                             <div className="flex flex-col">
                               <span className="font-bold text-slate-900 leading-tight">{user.name || user.razonSocial || 'Sin Nombre'}</span>
                               {user.cuit && <span className="text-[10px] text-slate-400 font-mono mt-0.5">#{user.cuit}</span>}
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col text-xs">
                            <span className="font-medium text-slate-600">{user.email}</span>
                            <span className="text-slate-400">{user.phone || '-'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[9px] font-extrabold uppercase border border-slate-200">
                            {formatRole(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border",
                            user.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                          )}>
                            {user.isActive ? 'ACTIVO' : 'SUSPENDIDO'}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          {user.role !== 'superadmin' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleToggleStatus(user._id)}
                              disabled={actionLoading === user._id}
                              className={cn(
                                "rounded-xl font-bold text-xs",
                                user.isActive ? 'text-slate-400 hover:text-red-600' : 'text-emerald-600'
                              )}
                            >
                              {actionLoading === user._id ? <Loader2 className="w-4 h-4 animate-spin" /> : user.isActive ? 'Suspender' : 'Reactivar'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y divide-slate-100">
                {users.map((user) => (
                  <div key={user._id} className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm">
                          {user.name?.substring(0, 2).toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{user.name || user.razonSocial}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{formatRole(user.role)}</span>
                        </div>
                      </div>
                      <div className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-black border",
                        user.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                      )}>
                        {user.isActive ? 'ACTIVO' : 'OFF'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Email</span>
                        <span className="text-xs text-slate-600 truncate">{user.email}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Identificación</span>
                        <span className="text-xs text-slate-600 font-mono">{user.cuit || 'N/A'}</span>
                      </div>
                    </div>

                    {user.role !== 'superadmin' && (
                      <Button 
                        onClick={() => handleToggleStatus(user._id)}
                        disabled={actionLoading === user._id}
                        variant="outline"
                        className={cn(
                          "w-full h-10 rounded-xl font-bold text-xs shadow-sm transition-all",
                          user.isActive ? "border-red-100 text-red-500 hover:bg-red-50" : "border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                        )}
                      >
                        {actionLoading === user._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : user.isActive ? (
                          <><ShieldAlert className="w-4 h-4 mr-2" /> Suspender Cuenta</>
                        ) : (
                          <><ShieldCheck className="w-4 h-4 mr-2" /> Reactivar Cuenta</>
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-300">
              <Users className="w-20 h-20 mb-4 opacity-5" />
              <p className="text-base font-bold text-slate-400">Sin coincidencias</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-6 gap-4 border-t border-slate-50 bg-slate-50/30">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest text-center sm:text-left">
                Página <span className="text-slate-900">{page}</span> de <span className="text-slate-900">{totalPages}</span>
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchUsers(page - 1)} 
                  disabled={page === 1} 
                  className="flex-1 sm:flex-none rounded-xl border-slate-200 h-10 px-4"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> <span className="sm:inline">Anterior</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchUsers(page + 1)} 
                  disabled={page === totalPages} 
                  className="flex-1 sm:flex-none rounded-xl border-slate-200 h-10 px-4"
                >
                  <span className="sm:inline">Siguiente</span> <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}