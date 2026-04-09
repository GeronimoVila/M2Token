"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { completeSocialRegistration } from "@/services/authService";
import { usersService } from "@/services/usersService";
import { getActiveCategories } from "@/services/categoriesService";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Truck, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

function ProfileFormContent() {
  const [loading, setLoading] = useState<"EMPRESA" | "PROVEEDOR" | "SUBMIT" | null>(null);
  const [selectedRole, setSelectedRole] = useState<"EMPRESA" | "PROVEEDOR" | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    category: "",
    specialties: "",
    address: "", 
    description: "",
  });

  useEffect(() => {
    async function fetchCategories() {
      const data = await getActiveCategories();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    const step = searchParams.get("step");
    if (step === "proveedor") {
      setSelectedRole("PROVEEDOR");
    }
  }, [searchParams]);

  const handleSelection = async (type: "EMPRESA" | "PROVEEDOR") => {
    if (type === "EMPRESA") {
      setLoading("EMPRESA");
      try {
        const result = await completeSocialRegistration({ type });
        if (result.user?.companyId) {
          router.push("/companies/dashboard");
        } else {
          router.push("/companies/onboarding");
        }
      } catch (error) {
        toast.error("Error de selección", {
          description: "Hubo un error al procesar tu selección. Inténtalo de nuevo."
        });
        setLoading(null);
      }
    } else {
      setSelectedRole("PROVEEDOR");
    }
  };

  const handleProviderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("SUBMIT");

    try {
      await completeSocialRegistration({ type: "PROVEEDOR" });

      const specialtiesArray = formData.specialties
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");

      await usersService.updateProfile({
        category: formData.category,
        specialties: specialtiesArray,
        address: formData.address, 
        description: formData.description,
      });

      toast.success("¡Perfil completado!", {
        description: "Tus datos se han guardado correctamente."
      });
      router.push("/proveedor");
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar", {
        description: "No se pudo completar el perfil. Verifica tu conexión e intenta nuevamente."
      });
      setLoading(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">
          {selectedRole === "PROVEEDOR" ? "Completa tu perfil de Proveedor" : "¡Bienvenido!"}
        </CardTitle>
        <CardDescription className="text-lg">
          {selectedRole === "PROVEEDOR"
            ? "Cuéntanos más sobre lo que ofreces para que las empresas te encuentren."
            : "Para empezar, cuéntanos cómo vas a usar la plataforma."}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        {!selectedRole && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center p-6 border-2 rounded-xl hover:border-primary transition-colors bg-card cursor-pointer" onClick={() => handleSelection("EMPRESA")}>
              <Building2 className="w-16 h-16 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Soy una Empresa</h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Quiero tokenizar mis proyectos y gestionar la cadena de pagos.
              </p>
              <Button className="w-full" disabled={loading !== null}>
                {loading === "EMPRESA" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Elegir Empresa
              </Button>
            </div>

            <div className="flex flex-col items-center p-6 border-2 rounded-xl hover:border-primary transition-colors bg-card cursor-pointer" onClick={() => handleSelection("PROVEEDOR")}>
              <Truck className="w-16 h-16 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Soy un Proveedor</h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Quiero recibir pagos mediante tokens y canjearlos por productos.
              </p>
              <Button variant="outline" className="w-full" disabled={loading !== null}>
                Elegir Proveedor
              </Button>
            </div>
          </div>
        )}

        {selectedRole === "PROVEEDOR" && (
          <form onSubmit={handleProviderSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría Principal <span className="text-red-500">*</span></Label>
              <Select 
                required 
                value={formData.category} 
                onValueChange={(val) => setFormData({ ...formData, category: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el rubro principal" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.label || cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialties">Especialidades (separadas por coma) <span className="text-red-500">*</span></Label>
              <Input
                id="specialties"
                required
                placeholder="Ej: Ladrillos, Cemento, Arena..."
                value={formData.specialties}
                onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Ubicación <span className="text-red-500">*</span></Label>
                <Input
                  id="address"
                  required
                  placeholder="Ej: Mendoza, Argentina"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Breve descripción de tus servicios</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  router.push("/auth/complete-profile");
                  setSelectedRole(null);
                }}
                disabled={loading === "SUBMIT"}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver
              </Button>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading === "SUBMIT" || !formData.category || !formData.specialties.trim() || !formData.address.trim()}
              >
                {loading === "SUBMIT" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Completar Perfil
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function CompleteProfilePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Suspense fallback={<Loader2 className="animate-spin text-primary w-10 h-10" />}>
        <ProfileFormContent />
      </Suspense>
    </main>
  );
}