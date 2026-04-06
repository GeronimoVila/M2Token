'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usersService } from '@/services/usersService';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { 
  Loader2, 
  UserPlus, 
  Shield, 
  HardHat, 
  Eye, 
  ArrowLeft, 
  Mail, 
  CalendarDays, 
  X, 
  Copy, 
  CheckCircle2, 
  Users,
  User,
  Briefcase
} from 'lucide-react';

const roleMap: Record<string, { label: string, color: string, icon: any }> = {
  'empresa_owner': { label: 'Propietario', color: 'bg-brand-dark text-white shadow-sm border-transparent', icon: Shield },
  'empresa_admin': { label: 'Administrador', color: 'bg-brand-blue/10 text-brand-blue border-brand-blue/20', icon: Shield },
  'empresa_approver': { label: 'Jefe de Obra (Aprobador)', color: 'bg-brand-salmon/10 text-brand-salmon border-brand-salmon/20', icon: HardHat },
  'empresa_viewer': { label: 'Auditor (Lectura)', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: Eye },
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
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4 animate-in fade-in duration-500">
        <div className="h-16 w-16 bg-brand-light/20 rounded-2xl flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        </div>
        <span className="text-brand-dark font-medium animate-pulse">Cargando equipo de trabajo...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 min-h-[calc(100vh-6rem)] relative">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-brand-dark">Equipo de Trabajo</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">Gestiona los accesos y roles dentro de tu empresa.</p>
          </div>
        </div>
        
        {canInvite && (
          <Button 
            className="bg-brand-blue hover:bg-brand-blue/90 text-white shadow-lg shadow-brand-blue/20 h-11 px-6 rounded-xl transition-transform hover:scale-105"
            onClick={() => setIsModalOpen(true)}
          >
            <UserPlus className="mr-2 h-5 w-5" /> Invitar Miembro
          </Button>
        )}
      </div>

      <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-brand-blue" />
        <CardHeader className="bg-white border-b border-gray-50 pb-5 pt-6 px-6 sm:px-8">
          <CardTitle className="text-xl text-brand-dark flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-blue" />
            Miembros Activos 
            <span className="bg-brand-light/30 text-brand-blue text-xs px-2.5 py-1 rounded-full ml-2">
              {team.length}
            </span>
          </CardTitle>
          <CardDescription className="text-gray-500 mt-1 font-medium">
            Todos los usuarios que tienen acceso a la plataforma en nombre de tu empresa.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-8 bg-gray-50/50">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-white border border-gray-100 rounded-xl" />
              ))}
            </div>
          ) : team.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900">Equipo vacío</h3>
              <p className="text-gray-500 mt-1">Invita al primer miembro para comenzar a colaborar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {team.map((member) => {
                const RoleIcon = roleMap[member.role]?.icon || Shield;
                
                return (
                  <div key={member._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-brand-light/50 transition-all duration-300 group">
                    
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-brand-blue to-brand-dark flex items-center justify-center text-white font-extrabold text-xl shadow-inner">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className={cn(
                          "absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white",
                          member.isActive ? "bg-emerald-500" : "bg-gray-400"
                        )} title={member.isActive ? "Activo" : "Inactivo"} />
                      </div>
                      
                      <div>
                        <h3 className="font-extrabold text-lg text-brand-dark group-hover:text-brand-blue transition-colors">
                          {member.name}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-500 font-medium mt-1">
                          <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {member.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-0 flex flex-col sm:items-end gap-3 pl-14 sm:pl-0">
                      <span className={cn(
                        "px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border flex items-center gap-1.5 w-fit",
                        roleMap[member.role]?.color || 'bg-gray-100 text-gray-600 border-gray-200'
                      )}>
                        <RoleIcon className="h-3.5 w-3.5" />
                        {roleMap[member.role]?.label || member.role}
                      </span>
                      <div className="flex items-center text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                        Ingresó el {formatDate(member.createdAt)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 rounded-2xl overflow-hidden border-0">
            <div className={cn("h-1.5 w-full", successData ? "bg-emerald-500" : "bg-brand-blue")} />
            
            <CardHeader className="relative pb-4 pt-6 px-6">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full h-8 w-8"
                onClick={resetAndCloseModal}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl font-extrabold text-brand-dark">
                {successData ? '¡Invitación Exitosa!' : 'Invitar al Equipo'}
              </CardTitle>
              <CardDescription className="font-medium text-gray-500 mt-1">
                {successData 
                  ? 'El usuario ya ha sido registrado en la empresa.' 
                  : 'Agrega un nuevo miembro y asignale su nivel de permisos.'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-6 pb-6">
              {successData ? (
                <div className="space-y-6 text-center">
                  <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-brand-dark font-bold">{successData.message}</p>
                    
                    {successData.tempPassword ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mt-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                        <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3 text-left flex items-center gap-2">
                           <Shield className="w-4 h-4"/> Contraseña Temporal Generada
                        </p>
                        
                        <div className="flex items-center justify-between bg-white border border-amber-200 rounded-lg px-4 py-3 shadow-sm">
                          <code className="text-xl font-mono font-black text-brand-dark tracking-widest">
                            {successData.tempPassword}
                          </code>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn("h-8 w-8 transition-colors rounded-md border", copied ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200 hover:bg-gray-100")} 
                            onClick={() => copyToClipboard(successData.tempPassword!)}
                          >
                            {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                          </Button>
                        </div>
                        <p className="text-[11px] text-amber-600 mt-3 font-bold text-left leading-tight">
                          ⚠️ Cópiala ahora. El usuario deberá usarla para iniciar sesión por primera vez.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-blue-50 text-brand-blue border border-brand-light p-4 rounded-xl text-sm font-medium mt-4 text-left">
                        El usuario ya tenía una cuenta, por lo que puede iniciar sesión con su contraseña habitual.
                      </div>
                    )}
                  </div>
                  <Button className="w-full h-11 rounded-xl bg-brand-dark hover:bg-brand-dark/90 font-bold" onClick={resetAndCloseModal}>
                    Entendido, cerrar
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleInviteSubmit} className="space-y-5">
                  {inviteError && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-2">
                      <X className="h-4 w-4 shrink-0" />
                      {inviteError}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre Completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Ej: Juan Pérez" 
                        className="pl-10 h-11 rounded-xl border-gray-200 focus-visible:ring-brand-blue font-medium"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Correo Electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        type="email"
                        placeholder="juan@tuempresa.com" 
                        className="pl-10 h-11 rounded-xl border-gray-200 focus-visible:ring-brand-blue font-medium"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rol en la Empresa</label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(val) => setFormData({...formData, role: val})}
                    >
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                        <SelectTrigger className="pl-10 h-11 rounded-xl border-gray-200 focus:ring-brand-blue font-medium text-brand-dark">
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                      </div>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="empresa_admin" className="font-bold text-brand-blue focus:bg-brand-blue/10">Administrador (Gestión Total)</SelectItem>
                        <SelectItem value="empresa_approver" className="font-bold text-brand-salmon focus:bg-brand-salmon/10">Jefe de Obra (Aprueba Entregas)</SelectItem>
                        <SelectItem value="empresa_viewer" className="font-bold text-gray-100 focus:bg-gray-900">Auditor (Solo Lectura)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 flex gap-3 border-t border-gray-100 mt-2">
                    <Button type="button" variant="outline" className="flex-1 h-11 rounded-xl border-gray-200 font-bold text-gray-600" onClick={resetAndCloseModal}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1 h-11 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold shadow-md shadow-brand-blue/20" disabled={isSubmitting}>
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