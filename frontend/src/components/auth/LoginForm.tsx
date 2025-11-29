"use client";

// --- 1. IMPORTS ---
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // <--- Importamos Link para la navegación
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
// Agregamos los iconos del ojo
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

import { loginUser } from "@/services/authService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Esquema de validación para Login
const loginSchema = z.object({
  email: z.string().email({
    message: "Por favor ingresa un email válido.",
  }),
  password: z.string().min(1, {
    message: "La contraseña no puede estar vacía.",
  }),
});

// Tipo inferido
type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  
  // Estado para ver/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);

    try {
      await loginUser(values);
      router.push("/admin"); 
      router.refresh(); 
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Ocurrió un error inesperado.");
      }
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
        <CardDescription>
          Ingresa tu email y contraseña para acceder a tu panel.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
            
            {/* Mensaje de Error */}
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error de Autenticación</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {/* Campo Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="empresa@ejemplo.com" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Contraseña con Ojo */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        {...field} 
                        disabled={isSubmitting}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {/* Botón de Submit */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>

            {/* --- 2. NUEVO ENLACE AL REGISTRO --- */}
            <div className="text-center text-sm">
              ¿No tienes cuenta?{" "}
              <Link href="/auth/register" className="underline text-primary">
                Regístrate
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}