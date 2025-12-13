"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usersService, UserProfileData } from '@/services/usersService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Wallet, Save, Loader2, Building2 } from 'lucide-react';

export default function ProviderProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<UserProfileData>({
    razonSocial: '',
    cuil: '',
    cbu: '',
    alias: '',
    walletAddress: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return router.push('/auth/login');
      
      try {
        try {
            const user = await usersService.getMe(token);
            setFormData({
                razonSocial: user.datosProveedor?.razonSocial || '',
                cuil: user.datosProveedor?.cuil || '',
                cbu: user.datosProveedor?.cbu || '',
                alias: user.datosProveedor?.alias || '',
                walletAddress: user.walletAddress || '',
            });
        } catch (e) {
            console.log("No se pudo cargar perfil previo o es la primera vez.");
        }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('access_token');
    
    try {
      if (!token) throw new Error("No hay sesión");
      
      await usersService.updateProfile(formData, token);
      alert("✅ Perfil actualizado correctamente");
    } catch (error: any) {
      alert(`❌ Error: ${error.message || "No se pudo actualizar"}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5"/>
        </Button>
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Mi Perfil</h1>
            <p className="text-sm text-gray-500">Configura tus datos de cobro y fiscales.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
            
            <Card className="border-brand-blue/50 shadow-md">
                <CardHeader className="bg-blue-50/50 pb-4">
                    <div className="flex items-center gap-2 text-blue-700">
                        <Wallet className="w-5 h-5" />
                        <CardTitle className="text-lg">Billetera Crypto (Web3)</CardTitle>
                    </div>
                    <CardDescription>
                        Aquí recibirás los tokens $M2T cuando se aprueben tus remitos.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="wallet">Dirección de Wallet (0x...)</Label>
                        <Input 
                            id="wallet" 
                            placeholder="0x1234..." 
                            value={formData.walletAddress}
                            onChange={(e) => setFormData({...formData, walletAddress: e.target.value})}
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-gray-400">
                            Debe ser una dirección compatible con Ethereum/Polygon (Metamask).
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                        <Building2 className="w-5 h-5" />
                        <CardTitle className="text-lg">Datos Fiscales</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="razonSocial">Razón Social</Label>
                            <Input 
                                id="razonSocial" 
                                placeholder="Tu Nombre o Empresa S.A." 
                                value={formData.razonSocial}
                                onChange={(e) => setFormData({...formData, razonSocial: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cuil">CUIT / CUIL</Label>
                            <Input 
                                id="cuil" 
                                placeholder="20-12345678-9" 
                                value={formData.cuil}
                                onChange={(e) => setFormData({...formData, cuil: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cbu">CBU / CVU</Label>
                            <Input 
                                id="cbu" 
                                placeholder="000000..." 
                                value={formData.cbu}
                                onChange={(e) => setFormData({...formData, cbu: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="alias">Alias</Label>
                            <Input 
                                id="alias" 
                                placeholder="mi.alias.banco" 
                                value={formData.alias}
                                onChange={(e) => setFormData({...formData, alias: e.target.value})}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={saving}>
                {saving ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                    </>
                )}
            </Button>

        </div>
      </form>
    </div>
  );
}