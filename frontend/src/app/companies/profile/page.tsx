"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usersService } from '@/services/usersService';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Wallet, Save, Loader2, Building2, User, Phone, MapPin } from 'lucide-react';

export default function CompanyProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { user } = useAuthStore();
  
  // 🔥 NUEVO: Ahora Owner y Admin tienen el mismo nivel de acceso aquí
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
        console.error("No se pudo cargar perfil previo o no hay sesión activa.", e);
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
      // 1. Actualizar Usuario: Objeto inteligente
      const userToSubmit: any = { 
        name: formData.name,
      };
      
      // La contraseña solo se envía si escribieron algo
      if (formData.password) userToSubmit.password = formData.password;

      // Estos campos SOLO se envían si el usuario tiene la jerarquía para verlos
      if (canManageAll) {
        userToSubmit.phone = formData.phone;
        userToSubmit.website = formData.website;
        userToSubmit.cbu = formData.cbu;
        userToSubmit.alias = formData.alias;
        
        // 🔥 EL FIX: Solo enviamos la wallet si realmente tiene texto. 
        // Así evitamos que un string vacío ("") rompa el validador de Ethereum del backend.
        if (formData.walletAddress && formData.walletAddress.trim() !== '') {
          userToSubmit.walletAddress = formData.walletAddress;
        }
      }

      await usersService.updateProfile(userToSubmit, token);

      // 2. Actualizar Empresa (SOLO SI ES OWNER O ADMIN)
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
      
      // Aprovechamos para atrapar el error exacto del backend si existe y mostrarlo
      const backendError = error.response?.data?.error || error.response?.data?.message;
      const errorMsg = Array.isArray(backendError) ? backendError.join(', ') : backendError;
      
      alert(`❌ Error: ${errorMsg || 'Ocurrió un error inesperado al actualizar'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-brand-blue" /></div>;

  return (
    <div className="container max-w-3xl py-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5"/>
        </Button>
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Configuración de Perfil</h1>
            <p className="text-sm text-gray-500">Configura tus datos personales y credenciales de acceso.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">

            {/* 🔥 TARJETA EMPRESA: Solo visible para Owner y Admin */}
            {canManageAll && (
              <Card className="border-brand-blue/30 shadow-md">
                  <CardHeader className="bg-brand-blue/5 pb-4">
                      <div className="flex items-center gap-2 text-brand-blue">
                          <Building2 className="w-5 h-5" />
                          <CardTitle className="text-lg">Datos Corporativos (Empresa)</CardTitle>
                      </div>
                      <CardDescription>
                        Esta información es la que representa a tu compañía globalmente en la plataforma.
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="companyName">Nombre Comercial</Label>
                              <Input id="companyName" placeholder="Tu Empresa S.A." value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="companyRazonSocial">Razón Social</Label>
                              <Input id="companyRazonSocial" placeholder="Sociedad Anónima..." value={formData.companyRazonSocial} onChange={(e) => setFormData({...formData, companyRazonSocial: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="companyCuit">CUIT de la Empresa</Label>
                              <Input id="companyCuit" placeholder="30-12345678-9" value={formData.companyCuit} onChange={(e) => setFormData({...formData, companyCuit: e.target.value})} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="companyAddress" className="flex items-center gap-1"><MapPin className="w-4 h-4"/> Dirección Física</Label>
                              <Input id="companyAddress" placeholder="Av. Siempre Viva 742..." value={formData.companyAddress} onChange={(e) => setFormData({...formData, companyAddress: e.target.value})} />
                          </div>
                      </div>
                  </CardContent>
              </Card>
            )}

            {/* 🔥 TARJETA PERSONAL: Siempre visible para todos */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                        <User className="w-5 h-5" />
                        <CardTitle className="text-lg">Tus Datos Personales</CardTitle>
                    </div>
                    <CardDescription>Información de tu cuenta de acceso.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre Personal</Label>
                            <Input id="name" placeholder="Tu nombre" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Cambiar Contraseña</Label>
                            <Input id="password" type="password" placeholder="Dejar en blanco para no cambiar" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 🔥 TARJETA CONTACTO Y BANCOS: Solo visible para Owner y Admin */}
            {canManageAll && (
              <Card>
                  <CardHeader className="pb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="w-5 h-5" />
                          <CardTitle className="text-lg">Contacto y Bancos</CardTitle>
                      </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="phone">Teléfono</Label>
                              <Input id="phone" placeholder="+54 9 11..." value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="website">Sitio Web</Label>
                              <Input id="website" placeholder="https://www.tuempresa.com" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} />
                          </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="cbu">CBU / CVU</Label>
                              <Input id="cbu" placeholder="000000..." value={formData.cbu} onChange={(e) => setFormData({...formData, cbu: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="alias">Alias</Label>
                              <Input id="alias" placeholder="alias.banco" value={formData.alias} onChange={(e) => setFormData({...formData, alias: e.target.value})} />
                          </div>
                      </div>
                  </CardContent>
              </Card>
            )}

            {/* 🔥 TARJETA WALLET: Solo visible para Owner y Admin */}
            {canManageAll && (
              <Card className="border-brand-blue/50 shadow-md">
                  <CardHeader className="bg-blue-50/50 pb-4">
                      <div className="flex items-center gap-2 text-blue-700">
                          <Wallet className="w-5 h-5" />
                          <CardTitle className="text-lg">Billetera Crypto (Web3)</CardTitle>
                      </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                      <div className="space-y-2">
                          <Label htmlFor="wallet">Dirección de Wallet Operativa (0x...)</Label>
                          <Input id="wallet" placeholder="0x1234..." value={formData.walletAddress} onChange={(e) => setFormData({...formData, walletAddress: e.target.value})} className="font-mono text-sm" />
                      </div>
                  </CardContent>
              </Card>
            )}

            <Button type="submit" className="w-full bg-brand-dark hover:bg-brand-dark/90 text-white" disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : <><Save className="mr-2 h-4 w-4" /> Guardar Cambios</>}
            </Button>
        </div>
      </form>
    </div>
  );
}