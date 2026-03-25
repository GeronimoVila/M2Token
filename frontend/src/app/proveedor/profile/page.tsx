"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usersService, UserProfileData } from '@/services/usersService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Wallet, Save, Loader2, Building2, User, Phone } from 'lucide-react';

export default function ProviderProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<UserProfileData>({
    name: '',
    password: '',
    razonSocial: '',
    cuit: '',
    cbu: '',
    alias: '',
    walletAddress: '',
    category: '', 
    phone: '',
    website: '',
  });

  // NUEVO: Estado para saber qué había originalmente en la base de datos
  const [originalData, setOriginalData] = useState<UserProfileData>({});

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem('access_token') || '';
      
      try {
        const user = await usersService.getMe(token);
        
        const loadedData = {
            name: user.name || '',
            password: '', 
            razonSocial: user.razonSocial || user.datosProveedor?.razonSocial || '',
            cuit: user.cuit || user.cuil || user.datosProveedor?.cuil || '',
            cbu: user.cbu || user.datosProveedor?.cbu || '',
            alias: user.alias || user.datosProveedor?.alias || '',
            walletAddress: user.walletAddress || '',
            category: user.category || '', 
            phone: user.phone || '',
            website: user.website || '',
        };

        // Guardamos en ambos estados
        setOriginalData(loadedData);
        setFormData(loadedData);
      } catch (e) {
        console.error("No se pudo cargar perfil previo o no hay sesión activa.");
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
    const token = localStorage.getItem('access_token') || '';
    
    try {
      // 1. Buscamos solo los campos que el usuario realmente modificó
      const dataToSubmit: any = {};
      
      // Tip: Usamos Object.keys de formData para iterar dinámicamente
      (Object.keys(formData) as Array<keyof UserProfileData>).forEach((key) => {
        if (formData[key] !== originalData[key]) {
          dataToSubmit[key] = formData[key];
        }
      });

      // 2. Limpieza para class-validator (Evitamos enviar strings vacíos en campos estrictos)
      if (dataToSubmit.password === '') {
        delete dataToSubmit.password;
      }
      
      // Si la wallet cambió pero la dejó vacía, la eliminamos del payload para que no explote
      if (dataToSubmit.walletAddress === '') {
        delete dataToSubmit.walletAddress; 
      }
      // Hacemos lo mismo para website por si tienes un @IsUrl() en el backend
      if (dataToSubmit.website === '') {
        delete dataToSubmit.website; 
      }

      // 3. Si después de limpiar no hay nada que actualizar, cortamos acá
      if (Object.keys(dataToSubmit).length === 0) {
        alert("No hay cambios para actualizar.");
        setSaving(false);
        return;
      }

      // 4. Enviamos la actualización
      await usersService.updateProfile(dataToSubmit, token);
      
      // Actualizamos la data original con los nuevos cambios exitosos
      setOriginalData(prev => ({ ...prev, ...dataToSubmit }));
      setFormData(prev => ({ ...prev, password: '' })); 
      
      alert("✅ Perfil actualizado correctamente");
    } catch (error: any) {
      // Capturamos el error que viene del backend (si viene como array, lo unimos)
      const errorMsg = error.response?.data?.message || error.message;
      const formattedError = Array.isArray(errorMsg) ? errorMsg.join("\n") : errorMsg;
      
      alert(`❌ Error al actualizar:\n${formattedError}`);
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
            <h1 className="text-2xl font-bold text-slate-900">Mi Perfil</h1>
            <p className="text-sm text-gray-500">Configura tus datos personales, de cobro y fiscales.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
            
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                        <User className="w-5 h-5" />
                        <CardTitle className="text-lg">Datos de la Cuenta</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input id="name" placeholder="Tu nombre" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Nueva Contraseña</Label>
                            <Input id="password" type="password" placeholder="Dejar en blanco para no cambiar" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-5 h-5" />
                        <CardTitle className="text-lg">Información de Contacto</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input id="phone" placeholder="+54 9 11 1234-5678" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Sitio Web</Label>
                            <Input id="website" placeholder="https://www.tuempresa.com" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} />
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
                    <CardDescription>Aquí recibirás los tokens $M2T cuando se aprueben tus remitos.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="wallet">Dirección de Wallet (0x...)</Label>
                        <Input id="wallet" placeholder="0x1234..." value={formData.walletAddress} onChange={(e) => setFormData({...formData, walletAddress: e.target.value})} className="font-mono text-sm" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                        <Building2 className="w-5 h-5" />
                        <CardTitle className="text-lg">Datos Fiscales y Bancarios</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="razonSocial">Razón Social</Label>
                            <Input id="razonSocial" placeholder="Tu Nombre o Empresa S.A." value={formData.razonSocial} onChange={(e) => setFormData({...formData, razonSocial: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cuit">CUIT / CUIL</Label>
                            <Input id="cuit" placeholder="20-12345678-9" value={formData.cuit} onChange={(e) => setFormData({...formData, cuit: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Categoría / Rubro</Label>
                            <Input id="category" placeholder="Ej: Materiales Eléctricos" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cbu">CBU / CVU</Label>
                            <Input id="cbu" placeholder="000000..." value={formData.cbu} onChange={(e) => setFormData({...formData, cbu: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="alias">Alias</Label>
                            <Input id="alias" placeholder="mi.alias.banco" value={formData.alias} onChange={(e) => setFormData({...formData, alias: e.target.value})} />
                        </div>
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