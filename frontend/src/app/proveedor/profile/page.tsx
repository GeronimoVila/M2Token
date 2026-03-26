"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usersService, UserProfileData } from '@/services/usersService';
import { getActiveCategories } from '@/services/categoriesService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Wallet, Save, Loader2, Building2, User, Phone, Tags } from 'lucide-react';

interface FormState extends Omit<UserProfileData, 'specialties'> {
  specialties: string;
}

export default function ProviderProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<FormState>({
    name: '',
    password: '',
    razonSocial: '',
    cuit: '',
    cbu: '',
    alias: '',
    walletAddress: '',
    category: '', 
    specialties: '', 
    address: '',
    description: '',
    phone: '',
    website: '',
  });

  const [originalData, setOriginalData] = useState<FormState>({} as FormState);

  useEffect(() => {
    const loadProfileAndCategories = async () => {
      const token = localStorage.getItem('access_token') || '';
      
      try {
        const [user, catsData] = await Promise.all([
          usersService.getMe(token),
          getActiveCategories()
        ]);

        if (Array.isArray(catsData)) {
          setCategories(catsData);
        }

        const categoryId = typeof user.category === 'object' && user.category !== null 
          ? user.category._id 
          : (user.category || '');

        let formattedSpecialties = '';
        if (Array.isArray(user.specialties)) {
            formattedSpecialties = user.specialties.join(', ');
        } else if (typeof user.specialties === 'string') {
            formattedSpecialties = user.specialties;
        }

        const loadedData: FormState = {
            name: user.name || '',
            password: '', 
            razonSocial: user.razonSocial || user.datosProveedor?.razonSocial || '',
            cuit: user.cuit || user.cuil || user.datosProveedor?.cuil || '',
            cbu: user.cbu || user.datosProveedor?.cbu || '',
            alias: user.alias || user.datosProveedor?.alias || '',
            walletAddress: user.walletAddress || '',
            category: categoryId, 
            specialties: formattedSpecialties,
            address: user.address || '',
            description: user.description || '',
            phone: user.phone || '',
            website: user.website || '',
        };

        setOriginalData(loadedData);
        setFormData(loadedData);
      } catch (e) {
        console.error("No se pudo cargar perfil previo o no hay sesión activa.");
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    loadProfileAndCategories();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('access_token') || '';
    
    try {
      const dataToSubmit: any = {};
      
      (Object.keys(formData) as Array<keyof FormState>).forEach((key) => {
        if (formData[key] !== originalData[key]) {
          dataToSubmit[key] = formData[key];
        }
      });

      if (dataToSubmit.password === '') delete dataToSubmit.password;
      if (dataToSubmit.walletAddress === '') delete dataToSubmit.walletAddress; 
      if (dataToSubmit.website === '') delete dataToSubmit.website; 

      if (dataToSubmit.specialties !== undefined) {
        dataToSubmit.specialties = dataToSubmit.specialties
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s !== '');
      }

      if (Object.keys(dataToSubmit).length === 0) {
        alert("No hay cambios para actualizar.");
        setSaving(false);
        return;
      }

      await usersService.updateProfile(dataToSubmit, token);
      
      setOriginalData(prev => ({ ...prev, ...formData }));
      setFormData(prev => ({ ...prev, password: '' })); 
      
      alert("✅ Perfil actualizado correctamente");
    } catch (error: any) {
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
            <p className="text-sm text-gray-500">Configura tus datos personales, de cobro y comerciales.</p>
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
                            <Input id="name" placeholder="Tu nombre" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Nueva Contraseña</Label>
                            <Input id="password" type="password" placeholder="Dejar en blanco para no cambiar" value={formData.password || ''} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                        <Tags className="w-5 h-5" />
                        <CardTitle className="text-lg">Perfil Comercial</CardTitle>
                    </div>
                    <CardDescription>Esta información ayudará a las empresas a encontrarte.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Categoría Principal</Label>
                            <Select 
                              value={formData.category} 
                              onValueChange={(val) => setFormData({ ...formData, category: val })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un rubro" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat._id} value={cat._id}>
                                    {cat.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Ubicación</Label>
                            <Input id="address" placeholder="Ej: Mendoza, Argentina" value={formData.address || ''} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="specialties">Especialidades (separadas por coma)</Label>
                        <Input id="specialties" placeholder="Ej: Ladrillos, Cemento, Arena..." value={formData.specialties || ''} onChange={(e) => setFormData({...formData, specialties: e.target.value})} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Breve descripción de tus servicios</Label>
                        <textarea
                          id="description"
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          placeholder="Somos un corralón con más de 20 años de experiencia..."
                          value={formData.description || ''}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
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
                            <Input id="phone" placeholder="+54 9 11 1234-5678" value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Sitio Web</Label>
                            <Input id="website" placeholder="https://www.tuempresa.com" value={formData.website || ''} onChange={(e) => setFormData({...formData, website: e.target.value})} />
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
                        <Input id="wallet" placeholder="0x1234..." value={formData.walletAddress || ''} onChange={(e) => setFormData({...formData, walletAddress: e.target.value})} className="font-mono text-sm" />
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
                            <Input id="razonSocial" placeholder="Tu Nombre o Empresa S.A." value={formData.razonSocial || ''} onChange={(e) => setFormData({...formData, razonSocial: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cuit">CUIT / CUIL</Label>
                            <Input id="cuit" placeholder="20-12345678-9" value={formData.cuit || ''} onChange={(e) => setFormData({...formData, cuit: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cbu">CBU / CVU</Label>
                            <Input id="cbu" placeholder="000000..." value={formData.cbu || ''} onChange={(e) => setFormData({...formData, cbu: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="alias">Alias</Label>
                            <Input id="alias" placeholder="mi.alias.banco" value={formData.alias || ''} onChange={(e) => setFormData({...formData, alias: e.target.value})} />
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