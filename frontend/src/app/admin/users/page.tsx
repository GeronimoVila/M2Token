"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usersService } from '@/services/usersService'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Users, ShieldAlert, ShieldCheck, ChevronLeft, ChevronRight, X, Mail, Phone, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Hubo un error al cambiar el estado del usuario.');
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 tracking-tight">Directorio de Cuentas</h3>
                <p className="text-xs text-slate-500 font-medium">{totalItems} usuarios registrados</p>
              </div>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Nombre, email o CUIT..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-8 bg-white text-slate-900 border-slate-200 focus:ring-brand-blue/20"
                />
                {search && (
                  <button type="button" onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-salmon transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button type="submit" className="bg-brand-blue hover:bg-brand-blue/90 text-white px-6">
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-slate-400 uppercase tracking-widest bg-slate-50/80 border-b border-slate-100 font-bold">
                  <tr>
                    <th className="px-8 py-4">Usuario / Identificación</th>
                    <th className="px-6 py-4">Información de Contacto</th>
                    <th className="px-6 py-4">Jerarquía</th>
                    <th className="px-6 py-4 text-center">Estado Operativo</th>
                    <th className="px-8 py-4 text-right">Gestión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((user) => (
                    <tr key={user._id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                           <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200 group-hover:bg-brand-blue group-hover:text-white group-hover:border-brand-blue transition-colors">
                             {user.name?.substring(0, 2).toUpperCase() || 'U'}
                           </div>
                           <div className="flex flex-col">
                             <span className="font-bold text-slate-900 leading-tight">{user.name || user.razonSocial || 'Sin Nombre'}</span>
                             {user.cuit && (
                               <span className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                                 <Hash className="w-3 h-3" /> {user.cuit}
                               </span>
                             )}
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-300" />
                            <span className="text-xs font-medium">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-slate-400">
                              <Phone className="w-3.5 h-3.5 text-slate-300" />
                              <span className="text-[11px]">{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-[9px] font-extrabold tracking-tighter uppercase border border-slate-200">
                          {formatRole(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-colors",
                          user.isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-red-50 text-red-700 border-red-100'
                        )}>
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full animate-pulse",
                            user.isActive ? 'bg-emerald-500' : 'bg-red-500'
                          )}></span>
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
                              "rounded-xl h-9 px-4 transition-all font-bold text-xs",
                              user.isActive 
                                ? 'text-slate-400 hover:bg-red-50 hover:text-red-600' 
                                : 'text-emerald-600 hover:bg-emerald-50'
                            )}
                          >
                            {actionLoading === user._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : user.isActive ? (
                              <><ShieldAlert className="w-4 h-4 mr-2" /> Suspender</>
                            ) : (
                              <><ShieldCheck className="w-4 h-4 mr-2" /> Reactivar</>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-300">
              <Users className="w-20 h-20 mb-4 opacity-5" />
              <p className="text-base font-bold text-slate-400">Sin coincidencias</p>
              <p className="text-xs">No encontramos usuarios para los filtros aplicados.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-8 py-4 border-t border-slate-50 bg-slate-50/30">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                Página <span className="text-slate-900">{page}</span> de <span className="text-slate-900">{totalPages}</span>
              </span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchUsers(page - 1)} 
                  disabled={page === 1} 
                  className="rounded-xl border-slate-200 text-slate-600 hover:bg-white transition-all shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchUsers(page + 1)} 
                  disabled={page === totalPages} 
                  className="rounded-xl border-slate-200 text-slate-600 hover:bg-white transition-all shadow-sm"
                >
                  Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}