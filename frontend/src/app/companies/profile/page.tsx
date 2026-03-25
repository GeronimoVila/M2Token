"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usersService } from '@/services/usersService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Wallet, Save, Loader2, Building2, User, Phone, MapPin } from 'lucide-react';

export default function CompanyProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
        // Obtenemos user y company en paralelo, usando los métodos seguros de axios
        const [user, companyData] = await Promise.all([
          usersService.getMe(token),
          usersService.getMyCompany(token).catch(err => {
            console.warn("No se pudo cargar la empresa", err);
            return {};
          })
        ]);

        // Guardamos el estado original para la actualización parcial
        setOriginalCompanyData({
          name: companyData.name || '',
          razonSocial: companyData.razonSocial || '',
          cuit: companyData.cuit || '',
          address: companyData.address || '',
        });

        // Poblamos el formulario
        setFormData({
            name: user.name || '',
            password: '', 
            phone: user.phone || '',
            website: user.website || '',
            walletAddress: user.walletAddress || '',
            cbu: user.cbu || '',
            alias: user.alias || '',
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
      // 1. Actualizar Usuario
      const userToSubmit: any = { 
        name: formData.name,
        phone: formData.phone,
        website: formData.website,
        walletAddress: formData.walletAddress,
        cbu: formData.cbu,
        alias: formData.alias,
      };
      if (formData.password) userToSubmit.password = formData.password;
      await usersService.updateProfile(userToSubmit, token);

      // 2. Actualizar Empresa (Actualización Parcial)
      const companyUpdates: any = {};
      
      if (formData.companyName !== originalCompanyData.name) companyUpdates.name = formData.companyName;
      if (formData.companyRazonSocial !== originalCompanyData.razonSocial) companyUpdates.razonSocial = formData.companyRazonSocial;
      if (formData.companyCuit !== originalCompanyData.cuit) companyUpdates.cuit = formData.companyCuit;
      if (formData.companyAddress !== originalCompanyData.address) companyUpdates.address = formData.companyAddress;

      if (Object.keys(companyUpdates).length > 0) {
        // Usamos nuestro nuevo método súper seguro
        await usersService.updateMyCompany(companyUpdates, token);

        setOriginalCompanyData({
          ...originalCompanyData,
          ...companyUpdates
        });
      }

      alert("✅ Perfil actualizado correctamente");
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (error: any) {
      console.error(error);
      alert(`❌ Error: Ocurrió un error inesperado al actualizar`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5"/>
        </Button>
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Perfil de la Empresa</h1>
            <p className="text-sm text-gray-500">Configura los datos corporativos, cuenta de administrador y billetera blockchain.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">

            <Card className="border-brand-blue/30 shadow-md">
                <CardHeader className="bg-brand-blue/5 pb-4">
                    <div className="flex items-center gap-2 text-brand-blue">
                        <Building2 className="w-5 h-5" />
                        <CardTitle className="text-lg">Datos Corporativos (Empresa)</CardTitle>
                    </div>
                    <CardDescription>Esta información es la que representa a tu compañía globalmente.</CardDescription>
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
                        {/* NUEVO INPUT PARA DIRECCIÓN */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="companyAddress" className="flex items-center gap-1"><MapPin className="w-4 h-4"/> Dirección Física</Label>
                            <Input id="companyAddress" placeholder="Av. Siempre Viva 742..." value={formData.companyAddress} onChange={(e) => setFormData({...formData, companyAddress: e.target.value})} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                        <User className="w-5 h-5" />
                        <CardTitle className="text-lg">Tus Datos de Administrador</CardTitle>
                    </div>
                    <CardDescription>Información personal del administrador activo.</CardDescription>
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

            <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : <><Save className="mr-2 h-4 w-4" /> Guardar Cambios</>}
            </Button>
        </div>
      </form>
    </div>
  );
}