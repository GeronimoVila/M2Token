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
import { 
  ArrowLeft, 
  Wallet, 
  Save, 
  Loader2, 
  Building2, 
  User, 
  Phone, 
  Tags,
  Lock,
  MapPin,
  FileText,
  Globe,
  CreditCard,
  Hash
} from 'lucide-react';

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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-pulse">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-10 w-10 bg-gray-200 rounded-xl" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded-md" />
            <div className="h-4 w-64 bg-gray-100 rounded-md" />
          </div>
        </div>
        <div className="h-48 bg-slate-900 rounded-2xl" />
        <div className="h-80 bg-slate-900 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-8 space-y-8 animate-in fade-in duration-500 min-h-[calc(100vh-6rem)]">
      
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 hover:bg-gray-100 rounded-xl">
            <ArrowLeft className="w-5 h-5"/>
        </Button>
        <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-brand-dark">Mi Perfil</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">Configura tus datos personales, de cobro y comerciales.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-12">
        
        {/* Card: Datos Personales */}
        <Card className="rounded-2xl border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-800 pb-5 pt-6 px-6 sm:px-8">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-slate-400" />
                    Datos de la Cuenta
                </CardTitle>
                <CardDescription className="text-slate-400 font-medium">
                  Información de tu cuenta de acceso individual.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 bg-slate-900/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-300 font-semibold">Nombre Completo</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input id="name" className="pl-10 h-11 rounded-xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-blue" placeholder="Tu nombre" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-300 font-semibold">Nueva Contraseña</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input id="password" type="password" className="pl-10 h-11 rounded-xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-blue" placeholder="Dejar en blanco para no cambiar" value={formData.password || ''} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Card: Perfil Comercial */}
        <Card className="rounded-2xl border-slate-800 bg-slate-900 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 left-0 h-1.5 w-full bg-blue-500" />
            <CardHeader className="border-b border-slate-800 pb-5 pt-6 px-6 sm:px-8">
                <CardTitle className="text-lg text-blue-400 flex items-center gap-2">
                    <Tags className="w-5 h-5" />
                    Perfil Comercial
                </CardTitle>
                <CardDescription className="text-slate-400 font-medium">Esta información ayudará a las empresas a encontrarte.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 bg-slate-900/50 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="category" className="text-slate-300 font-semibold">Categoría Principal</Label>
                        <Select 
                          value={formData.category} 
                          onValueChange={(val) => setFormData({ ...formData, category: val })}
                        >
                          <SelectTrigger className="h-11 rounded-xl bg-slate-800 border-slate-700 text-white focus:ring-blue-500">
                            <SelectValue placeholder="Selecciona un rubro" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            {categories.map((cat) => (
                              <SelectItem key={cat._id} value={cat._id} className="focus:bg-slate-700 focus:text-white cursor-pointer">
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address" className="text-slate-300 font-semibold">Ubicación</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input id="address" className="pl-10 h-11 rounded-xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500" placeholder="Ej: Mendoza, Argentina" value={formData.address || ''} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                        </div>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="specialties" className="text-slate-300 font-semibold">Especialidades (separadas por coma)</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input id="specialties" className="pl-10 h-11 rounded-xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500" placeholder="Ej: Ladrillos, Cemento, Arena..." value={formData.specialties || ''} onChange={(e) => setFormData({...formData, specialties: e.target.value})} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="text-slate-300 font-semibold">Breve descripción de tus servicios</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <textarea
                        id="description"
                        className="pl-10 flex min-h-[100px] w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        placeholder="Somos un corralón con más de 20 años de experiencia..."
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Card: Datos Fiscales y Bancarios */}
        <Card className="rounded-2xl border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-800 pb-5 pt-6 px-6 sm:px-8">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-slate-400" />
                    Datos Fiscales y Bancarios
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 bg-slate-900/50 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="razonSocial" className="text-slate-300 font-semibold">Razón Social</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input id="razonSocial" className="pl-10 h-11 rounded-xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-blue" placeholder="Tu Nombre o Empresa S.A." value={formData.razonSocial || ''} onChange={(e) => setFormData({...formData, razonSocial: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cuit" className="text-slate-300 font-semibold">CUIT / CUIL</Label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input id="cuit" className="pl-10 h-11 rounded-xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-blue" placeholder="20-12345678-9" value={formData.cuit || ''} onChange={(e) => setFormData({...formData, cuit: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="cbu" className="text-slate-300 font-semibold">CBU / CVU</Label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input id="cbu" className="pl-10 h-11 rounded-xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-blue" placeholder="000000..." value={formData.cbu || ''} onChange={(e) => setFormData({...formData, cbu: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="alias" className="text-slate-300 font-semibold">Alias</Label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input id="alias" className="pl-10 h-11 rounded-xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-blue" placeholder="mi.alias.banco" value={formData.alias || ''} onChange={(e) => setFormData({...formData, alias: e.target.value})} />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Card: Información de Contacto */}
        <Card className="rounded-2xl border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-800 pb-5 pt-6 px-6 sm:px-8">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Phone className="w-5 h-5 text-slate-400" />
                    Información de Contacto
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 bg-slate-900/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-300 font-semibold">Teléfono</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input id="phone" className="pl-10 h-11 rounded-xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-blue" placeholder="+54 9 11 1234-5678" value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="website" className="text-slate-300 font-semibold">Sitio Web</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input id="website" className="pl-10 h-11 rounded-xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-blue" placeholder="https://www.tuempresa.com" value={formData.website || ''} onChange={(e) => setFormData({...formData, website: e.target.value})} />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Card: Billetera Crypto (Web3) */}
        <Card className="rounded-2xl border-slate-800 bg-[#1e1515] shadow-xl overflow-hidden relative">
            <div className="absolute top-0 left-0 h-1.5 w-full bg-brand-salmon" />
            <CardHeader className="border-b border-slate-800 pb-5 pt-6 px-6 sm:px-8">
                <CardTitle className="text-lg text-brand-salmon flex items-center gap-2 font-extrabold">
                    <Wallet className="w-5 h-5" />
                    Billetera Crypto (Web3)
                </CardTitle>
                <CardDescription className="text-slate-400 font-medium">Aquí recibirás los tokens $M2T cuando se aprueben tus remitos.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 bg-[#150f0f]/50">
                <div className="space-y-2">
                    <Label htmlFor="wallet" className="text-slate-300 font-bold">Dirección de Wallet (0x...)</Label>
                    <Input 
                      id="wallet" 
                      className="h-11 rounded-xl bg-slate-900 border-brand-salmon/30 focus-visible:ring-brand-salmon font-mono text-sm text-white placeholder:text-slate-600" 
                      placeholder="0x1234..." 
                      value={formData.walletAddress || ''} 
                      onChange={(e) => setFormData({...formData, walletAddress: e.target.value})} 
                    />
                </div>
            </CardContent>
        </Card>

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