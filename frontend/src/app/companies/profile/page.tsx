'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usersService } from '@/services/usersService';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  Wallet, 
  Save, 
  Loader2, 
  Building2, 
  User, 
  Phone, 
  MapPin,
  Lock,
  Globe,
  CreditCard,
  Hash
} from 'lucide-react';

export default function CompanyProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { user } = useAuthStore();
  
  const canManageAll = user?.role === 'empresa_owner' || user?.role === 'empresa_admin';

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    phone: '',
    website: '',
    walletAddress: '',
    cbu: '',
    alias: '',
    companyName: '',
    companyRazonSocial: '',
    companyCuit: '',
    companyAddress: '',
  });

  const [originalCompanyData, setOriginalCompanyData] = useState<any>({});

  useEffect(() => {
    const loadProfile = async () => {
      let rawToken = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
      const token = rawToken.replace(/['"]+/g, '').trim(); 
      
      try {
        const [userData, companyData] = await Promise.all([
          usersService.getMe(token),
          usersService.getMyCompany(token).catch(err => {
            console.warn("No se pudo cargar la empresa", err);
            return {};
          })
        ]);

        setOriginalCompanyData({
          name: companyData.name || '',
          razonSocial: companyData.razonSocial || '',
          cuit: companyData.cuit || '',
          address: companyData.address || '',
        });

        setFormData({
            name: userData.name || '',
            password: '', 
            phone: userData.phone || '',
            website: userData.website || '',
            walletAddress: userData.walletAddress || '',
            cbu: userData.cbu || '',
            alias: userData.alias || '',
            companyName: companyData.name || '',
            companyRazonSocial: companyData.razonSocial || '',
            companyCuit: companyData.cuit || '',
            companyAddress: companyData.address || '',
        });
      } catch (e) {
        console.error("No se pudo cargar perfil previo.", e);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let rawToken = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
    const token = rawToken.replace(/['"]+/g, '').trim(); 
    
    try {
      const userToSubmit: any = { 
        name: formData.name,
      };
      
      if (formData.password) userToSubmit.password = formData.password;

      if (canManageAll) {
        userToSubmit.phone = formData.phone;
        userToSubmit.website = formData.website;
        userToSubmit.cbu = formData.cbu;
        userToSubmit.alias = formData.alias;
        
        if (formData.walletAddress && formData.walletAddress.trim() !== '') {
          userToSubmit.walletAddress = formData.walletAddress;
        }
      }

      await usersService.updateProfile(userToSubmit, token);

      if (canManageAll) {
        const companyUpdates: any = {};
        
        if (formData.companyName !== originalCompanyData.name) companyUpdates.name = formData.companyName;
        if (formData.companyRazonSocial !== originalCompanyData.razonSocial) companyUpdates.razonSocial = formData.companyRazonSocial;
        if (formData.companyCuit !== originalCompanyData.cuit) companyUpdates.cuit = formData.companyCuit;
        if (formData.companyAddress !== originalCompanyData.address) companyUpdates.address = formData.companyAddress;

        if (Object.keys(companyUpdates).length > 0) {
          await usersService.updateMyCompany(companyUpdates, token);
          setOriginalCompanyData({
            ...originalCompanyData,
            ...companyUpdates
          });
        }
      }

      alert("✅ Perfil actualizado correctamente");
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (error: any) {
      console.error(error);
      const backendError = error.response?.data?.error || error.response?.data?.message;
      const errorMsg = Array.isArray(backendError) ? backendError.join(', ') : backendError;
      alert(`❌ Error: ${errorMsg || 'Ocurrió un error inesperado al actualizar'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-pulse">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-10 w-10 bg-gray-200 rounded-xl" />
          <div className="space-y-2"><div className="h-8 w-48 bg-gray-200 rounded-md" /><div className="h-4 w-64 bg-gray-100 rounded-md" /></div>
        </div>
        <div className="h-48 bg-slate-900 rounded-2xl" />
        {canManageAll && <div className="h-80 bg-slate-900 rounded-2xl" />}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-8 space-y-8 animate-in fade-in duration-500 min-h-[calc(100vh-6rem)]">
      
      <div className="flex items-center gap-4 mb-2">
        <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-brand-dark">Configuración de Perfil</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">Gestiona tus datos personales y corporativos.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-12">

          <Card className="rounded-2xl border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-slate-800 pb-5 pt-6 px-6 sm:px-8">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-slate-400" />
                      Tus Datos Personales
                  </CardTitle>
                  <CardDescription className="text-slate-400 font-medium">
                    Información de tu cuenta de acceso individual.
                  </CardDescription>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 bg-slate-900/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <Label htmlFor="name" className="text-slate-300 font-semibold">Nombre Personal</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                            <Input id="name" className="pl-10 h-11 rounded-xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-blue" placeholder="Tu nombre" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="password" className="text-slate-300 font-semibold">Cambiar Contraseña</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                            <Input id="password" type="password" className="pl-10 h-11 rounded-xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-blue" placeholder="Dejar en blanco para no cambiar" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                          </div>
                      </div>
                  </div>
              </CardContent>
          </Card>

          {canManageAll && (
            <>
              <Card className="rounded-2xl border-slate-800 bg-slate-900 shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-1.5 w-full bg-blue-500" />
                  <CardHeader className="border-b border-slate-800 pb-5 pt-6 px-6 sm:px-8">
                      <CardTitle className="text-lg text-blue-400 flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          Datos Corporativos (Empresa)
                      </CardTitle>
                      <CardDescription className="text-slate-400 font-medium">
                        Esta información es la que representa a tu compañía globalmente en la plataforma.
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 sm:p-8 bg-slate-900/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="companyName" className="text-slate-300 font-semibold">Nombre Comercial</Label>
                              <div className="relative">
                                <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input id="companyName" className="pl-10 h-11 rounded-xl bg-slate-800 border-slate-700 text-white font-bold placeholder:text-slate-500 focus-visible:ring-blue-500" placeholder="Tu Empresa S.A." value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="companyRazonSocial" className="text-slate-300 font-semibold">Razón Social</Label>
                              <div className="relative">
                                <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input id="companyRazonSocial" className="pl-10 h-11 rounded-xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500" placeholder="Sociedad Anónima..." value={formData.companyRazonSocial} onChange={(e) => setFormData({...formData, companyRazonSocial: e.target.value})} />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="companyCuit" className="text-slate-300 font-semibold">CUIT de la Empresa</Label>
                              <div className="relative">
                                <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input id="companyCuit" className="pl-10 h-11 rounded-xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500" placeholder="30-12345678-9" value={formData.companyCuit} onChange={(e) => setFormData({...formData, companyCuit: e.target.value})} />
                              </div>
                          </div>
                          <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="companyAddress" className="text-slate-300 font-semibold">Dirección Física</Label>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input id="companyAddress" className="pl-10 h-11 rounded-xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500" placeholder="Av. Siempre Viva 742..." value={formData.companyAddress} onChange={(e) => setFormData({...formData, companyAddress: e.target.value})} />
                              </div>
                          </div>
                      </div>
                  </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
                  <CardHeader className="border-b border-slate-800 pb-5 pt-6 px-6 sm:px-8">
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                          <Phone className="w-5 h-5 text-slate-400" />
                          Contacto y Bancos
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 sm:p-8 bg-slate-900/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                              <Label htmlFor="phone" className="text-slate-300 font-semibold">Teléfono Comercial</Label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input id="phone" className="pl-10 h-11 rounded-xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-blue" placeholder="+54 9 11..." value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="website" className="text-slate-300 font-semibold">Sitio Web</Label>
                              <div className="relative">
                                <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input id="website" className="pl-10 h-11 rounded-xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-blue" placeholder="https://www.tuempresa.com" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="cbu" className="text-slate-300 font-semibold">CBU / CVU</Label>
                              <div className="relative">
                                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input id="cbu" className="pl-10 h-11 rounded-xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-blue" placeholder="0000000000000000000000" value={formData.cbu} onChange={(e) => setFormData({...formData, cbu: e.target.value})} />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="alias" className="text-slate-300 font-semibold">Alias Bancario</Label>
                              <div className="relative">
                                <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input id="alias" className="pl-10 h-11 rounded-xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-blue" placeholder="alias.banco.empresa" value={formData.alias} onChange={(e) => setFormData({...formData, alias: e.target.value})} />
                              </div>
                          </div>
                      </div>
                  </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-800 bg-[#1e1515] shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-1.5 w-full bg-brand-salmon" />
                  <CardHeader className="border-b border-slate-800 pb-5 pt-6 px-6 sm:px-8">
                      <CardTitle className="text-lg text-brand-salmon flex items-center gap-2 font-extrabold">
                          <Wallet className="w-5 h-5" />
                          Billetera Crypto (Web3)
                      </CardTitle>
                      <CardDescription className="text-slate-400 font-medium">
                        Dirección para recibir o gestionar tokens de tus proyectos.
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 sm:p-8 bg-[#150f0f]/50">
                      <div className="space-y-2">
                          <Label htmlFor="wallet" className="text-slate-300 font-bold">Dirección de Wallet Operativa (Ethereum/Polygon)</Label>
                          <Input 
                            id="wallet" 
                            className="h-11 rounded-xl bg-slate-900 border-brand-salmon/30 focus-visible:ring-brand-salmon font-mono text-sm text-white placeholder:text-slate-600" 
                            placeholder="0x..." 
                            value={formData.walletAddress} 
                            onChange={(e) => setFormData({...formData, walletAddress: e.target.value})} 
                          />
                      </div>
                  </CardContent>
              </Card>
            </>
          )}

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold shadow-xl shadow-brand-blue/20 transition-transform hover:-translate-y-1" 
              disabled={saving}
            >
                {saving ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Guardando Cambios...</>
                ) : (
                  <><Save className="mr-2 h-5 w-5" /> Guardar Configuración</>
                )}
            </Button>
          </div>
      </form>
    </div>
  );
}

function FileText(props: any) {
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
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}