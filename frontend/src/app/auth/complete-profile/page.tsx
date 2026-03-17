"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeSocialRegistration } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Building2, Truck, Loader2 } from "lucide-react";

export default function CompleteProfilePage() {
  const [loading, setLoading] = useState<"EMPRESA" | "PROVEEDOR" | null>(null);
  const router = useRouter();

  const handleSelection = async (type: "EMPRESA" | "PROVEEDOR") => {
    setLoading(type);
    try {
      const result = await completeSocialRegistration({ type });
      
      // Lógica de redirección igual a la tradicional
      if (type === "PROVEEDOR") {
        router.push("/proveedor");
      } else {
        // Si es EMPRESA, verificamos si ya tiene compañía (usualmente no en registro nuevo)
        if (result.user.companyId) {
          router.push("/companies/dashboard");
        } else {
          router.push("/companies/onboarding");
        }
      }
    } catch (error) {
      alert("Error al procesar la selección. Inténtalo de nuevo.");
      setLoading(null);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">¡Bienvenido!</CardTitle>
          <CardDescription className="text-lg">
            Para empezar, cuéntanos cómo vas a usar la plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6 p-6">
          {/* Opción Empresa */}
          <div className="flex flex-col items-center p-6 border-2 rounded-xl hover:border-primary transition-colors bg-card">
            <Building2 className="w-16 h-16 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Soy una Empresa</h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Quiero tokenizar mis proyectos y gestionar la cadena de pagos.
            </p>
            <Button 
              className="w-full" 
              onClick={() => handleSelection("EMPRESA")}
              disabled={loading !== null}
            >
              {loading === "EMPRESA" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Elegir Empresa
            </Button>
          </div>

          {/* Opción Proveedor */}
          <div className="flex flex-col items-center p-6 border-2 rounded-xl hover:border-primary transition-colors bg-card">
            <Truck className="w-16 h-16 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Soy un Proveedor</h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Quiero recibir pagos mediante tokens y canjearlos por productos.
            </p>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handleSelection("PROVEEDOR")}
              disabled={loading !== null}
            >
              {loading === "PROVEEDOR" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Elegir Proveedor
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}