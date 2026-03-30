'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usersService } from '@/services/usersService';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus, Shield, HardHat, Eye, ArrowLeft, Mail, Calendar, X, Copy, CheckCircle2 } from 'lucide-react';

const roleMap: Record<string, { label: string, color: string, icon: any }> = {
  'empresa_owner': { label: 'Propietario', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200', icon: Shield },
  'empresa_admin': { label: 'Administrador', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200', icon: Shield },
  'empresa_approver': { label: 'Jefe de Obra (Aprobador)', color: 'bg-amber-100 text-amber-700 hover:bg-amber-200', icon: HardHat },
  'empresa_viewer': { label: 'Auditor (Lectura)', color: 'bg-slate-100 text-slate-700 hover:bg-slate-200', icon: Eye },
};

export default function TeamSettingsPage() {
  const router = useRouter();
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { user, isLoading: isAuthLoading } = useAuthStore();
  const canInvite = user?.role === 'empresa_owner' || user?.role === 'empresa_admin';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [successData, setSuccessData] = useState<{ tempPassword?: string | null, message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'empresa_approver'
  });

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const data = await usersService.getTeam();
      setTeam(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar el equipo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setInviteError('');
    
    try {
      const response = await usersService.inviteUser(formData);
      setSuccessData({
        message: response.message,
        tempPassword: response.tempPassword
      });
      fetchTeam();
    } catch (error: any) {
      setInviteError(error.response?.data?.message || 'Ocurrió un error al enviar la invitación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndCloseModal = () => {
    setIsModalOpen(false);
    setSuccessData(null);
    setInviteError('');
    setFormData({ name: '', email: '', role: 'empresa_approver' });
    setCopied(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8 space-y-6 animate-in fade-in duration-500 relative">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5"/>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Equipo de Trabajo</h1>
            <p className="text-slate-500">Gestiona los accesos y roles dentro de tu empresa.</p>
          </div>
        </div>
        
        {canInvite && (
          <Button 
            className="bg-brand-blue hover:bg-brand-blue/90 text-white shadow-sm"
            onClick={() => setIsModalOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" /> Invitar Miembro
          </Button>
        )}
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-brand-blue" />
            Miembros Activos ({team.length})
          </CardTitle>
          <CardDescription>
            Todos los usuarios que tienen acceso a la plataforma en nombre de tu empresa.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
            </div>
          ) : team.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-500">No se encontraron miembros en el equipo.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {team.map((member) => {
                const RoleIcon = roleMap[member.role]?.icon || Shield;
                return (
                  <div key={member._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 hover:bg-slate-50 transition-colors">
                    
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-brand-light/30 flex items-center justify-center text-brand-blue font-bold text-lg shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900">{member.name}</h3>
                          {member.isActive ? (
                            <span className="h-2 w-2 rounded-full bg-green-500" title="Activo"></span>
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-red-500" title="Inactivo"></span>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-slate-500 mt-1">
                          <Mail className="h-3 w-3 mr-1" /> {member.email}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-0 flex flex-col sm:items-end gap-2">
                      <Badge variant="secondary" className={`${roleMap[member.role]?.color || 'bg-slate-100 text-slate-700'} flex items-center gap-1.5`}>
                        <RoleIcon className="h-3 w-3" />
                        {roleMap[member.role]?.label || member.role}
                      </Badge>
                      <div className="flex items-center text-xs text-slate-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        Se unió el {formatDate(member.createdAt)}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && canInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-xl animate-in zoom-in-95 duration-200">
            <CardHeader className="relative pb-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                onClick={resetAndCloseModal}
              >
                <X className="h-5 w-5" />
              </Button>
              <CardTitle className="text-xl">
                {successData ? '¡Invitación Exitosa!' : 'Invitar al Equipo'}
              </CardTitle>
              <CardDescription>
                {successData 
                  ? 'El usuario ya tiene acceso a la empresa.' 
                  : 'Agrega un nuevo miembro y asignale su nivel de permisos.'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {successData ? (
                <div className="space-y-6 py-4 text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-600 font-medium">{successData.message}</p>
                    
                    {successData.tempPassword ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-4">
                        <p className="text-sm text-slate-500 mb-2">Contraseña Temporal Generada:</p>
                        <div className="flex items-center justify-between bg-white border border-slate-300 rounded-md px-3 py-2">
                          <code className="text-lg font-mono font-bold text-brand-dark tracking-wider">
                            {successData.tempPassword}
                          </code>
                          <Button variant="ghost" size="icon" onClick={() => copyToClipboard(successData.tempPassword!)}>
                            {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-slate-500" />}
                          </Button>
                        </div>
                        <p className="text-xs text-amber-600 mt-2 font-medium">
                          ⚠️ Cópiala ahora. El usuario deberá usarla para iniciar sesión por primera vez.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-sm">
                        El usuario ya tenía una cuenta, por lo que puede iniciar sesión con su contraseña habitual.
                      </div>
                    )}
                  </div>
                  <Button className="w-full" onClick={resetAndCloseModal}>Entendido</Button>
                </div>
              ) : (
                <form onSubmit={handleInviteSubmit} className="space-y-4">
                  {inviteError && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                      {inviteError}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Nombre Completo</label>
                    <Input 
                      placeholder="Ej: Juan Pérez" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Correo Electrónico</label>
                    <Input 
                      type="email"
                      placeholder="juan@tuempresa.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Rol en la Empresa</label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(val) => setFormData({...formData, role: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="empresa_admin">Administrador (Gestión Total)</SelectItem>
                        <SelectItem value="empresa_approver">Jefe de Obra (Aprueba Entregas)</SelectItem>
                        <SelectItem value="empresa_viewer">Auditor (Solo Lectura)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <Button type="button" variant="outline" className="flex-1" onClick={resetAndCloseModal}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1 bg-brand-blue hover:bg-brand-blue/90 text-white" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                      Enviar Invitación
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}