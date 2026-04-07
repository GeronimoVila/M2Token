"use client";

import { useEffect, useState } from 'react';
import { settingsService } from '@/services/settingsService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, Coins, Pickaxe, Settings, Plus, Trash2, Info, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminSettingsPage() {
  const [precioM2, setPrecioM2] = useState<number | ''>('');
  const [tokensPorM2, setTokensPorM2] = useState<number | ''>('');
  const [savingGlobal, setSavingGlobal] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, categoriesRes] = await Promise.all([
        settingsService.getGlobalSettings().catch(() => null),
        settingsService.getCategories().catch(() => [])
      ]);

      if (settingsRes) {
        setPrecioM2(settingsRes.precioM2 || '');
        setTokensPorM2(settingsRes.tokensPorM2 || '');
      }
      if (categoriesRes) {
        setCategories(categoriesRes);
      }
    } catch (error) {
      console.error("Error al cargar configuraciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveGlobal = async () => {
    if (!precioM2 || !tokensPorM2) return alert("Completa todos los campos financieros");
    
    setSavingGlobal(true);
    try {
      await settingsService.updateGlobalSettings({ 
        precioM2: Number(precioM2), 
        tokensPorM2: Number(tokensPorM2) 
      });
      alert("Configuraciones globales guardadas exitosamente.");
    } catch (error) {
      console.error("Error guardando configuraciones:", error);
      alert("Hubo un error al guardar las configuraciones.");
    } finally {
      setSavingGlobal(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setAddingCategory(true);
    try {
      await settingsService.createCategory(newCategoryName);
      setNewCategoryName('');
      fetchData();
    } catch (error) {
      console.error("Error agregando categoría:", error);
      alert("Error al crear la categoría.");
    } finally {
      setAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    try {
      await settingsService.deleteCategory(id);
      setCategories(categories.filter(c => c._id !== id && c.id !== id));
    } catch (error) {
      console.error("Error eliminando categoría:", error);
      alert("No se pudo eliminar la categoría (podría estar en uso).");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-blue" />
          <p className="text-slate-500 font-medium animate-pulse">Cargando configuraciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      <Tabs defaultValue="tokenization" className="w-full">
        <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-100 p-1 text-slate-500 mb-8">
          <TabsTrigger 
            value="tokenization" 
            className="rounded-lg px-6 py-2 text-sm font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm"
          >
            Economía & Tokens
          </TabsTrigger>
          <TabsTrigger 
            value="categories" 
            className="rounded-lg px-6 py-2 text-sm font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm"
          >
            Catálogo de Rubros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tokenization" className="mt-0 outline-none">
          <Card className="border-none shadow-md max-w-3xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-sm border border-amber-100">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">Variables Maestras del Token</CardTitle>
                  <CardDescription className="text-slate-500 font-medium">Control de la matemática financiera de M2T</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    Precio M2 Sugerido (USD)
                    <Info className="w-3 h-3 text-slate-300" />
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-brand-blue transition-colors">USD</div>
                    <Input 
                      type="number" 
                      placeholder="1000" 
                      className="pl-14 h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-lg font-bold"
                      value={precioM2}
                      onChange={(e) => setPrecioM2(e.target.value ? Number(e.target.value) : '')}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed italic">
                    Referencia del costo de obra por metro cuadrado.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    Tokens por M2 (Ratio)
                    <Info className="w-3 h-3 text-slate-300" />
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-brand-blue transition-colors">M2T</div>
                    <Input 
                      type="number" 
                      placeholder="100" 
                      className="pl-14 h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-lg font-bold"
                      value={tokensPorM2}
                      onChange={(e) => setTokensPorM2(e.target.value ? Number(e.target.value) : '')}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed italic">
                    Divisibilidad del token. 100 significa que 1 M2T equivale al 1% de un M2.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3 items-start">
                <div className="h-5 w-5 rounded-full bg-brand-blue flex items-center justify-center shrink-0 mt-0.5">
                   <Info className="h-3 w-3 text-white" />
                </div>
                <div className="text-xs text-brand-blue/80 font-medium leading-relaxed">
                  <strong>Impacto:</strong> Cambiar estos valores afectará automáticamente los cálculos de todos los remitos que se validen a partir de este momento. El sistema registrará los valores vigentes en cada transacción para auditoría.
                </div>
              </div>

            </CardContent>
            <CardFooter className="bg-slate-50/80 border-t border-slate-100 p-6 flex justify-end">
              <Button 
                onClick={handleSaveGlobal} 
                disabled={savingGlobal} 
                className="h-11 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold px-8 shadow-md shadow-brand-blue/20 transition-all"
              >
                {savingGlobal ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Guardar Configuración
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-0 outline-none">
          <div className="grid md:grid-cols-5 gap-8">
            
            <Card className="md:col-span-2 border-none shadow-md h-fit bg-white overflow-hidden">
              <CardHeader className="bg-emerald-50/30 border-b border-emerald-50">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-emerald-700">
                  <Plus className="w-5 h-5" />
                  Nuevo Rubro
                </CardTitle>
                <CardDescription className="text-emerald-600/60">Categorización para proveedores</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
                    <Input 
                      placeholder="Ej: Pinturerías, Sanitarios..." 
                      className="rounded-xl border-slate-200 h-11"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={addingCategory || !newCategoryName} 
                    className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-200 transition-all"
                  >
                    {addingCategory ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                    Agregar al Sistema
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="md:col-span-3 border-none shadow-md bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <Briefcase className="w-5 h-5 text-brand-blue" />
                    Categorías Activas
                  </CardTitle>
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-extrabold border border-slate-200">
                    {categories.length} RUBROS
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {categories.length > 0 ? (
                  <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
                    {categories.map((cat: any) => (
                      <div key={cat._id || cat.id} className="flex items-center justify-between px-6 py-4 group hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px] group-hover:bg-brand-blue group-hover:text-white transition-colors">
                            {cat.name.substring(0, 1).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{cat.name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteCategory(cat._id || cat.id)} 
                          className="rounded-full text-slate-300 hover:text-brand-salmon hover:bg-brand-salmon/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                    <Settings className="w-16 h-16 mb-4 opacity-5 animate-spin-slow" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sin registros</p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}