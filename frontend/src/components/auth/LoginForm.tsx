"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";

import { loginUser } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(1, "La contraseña es requerida."),
});

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const registered = searchParams.get("registered");
  const message = searchParams.get("message");

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

async function onSubmit(values: z.infer<typeof loginSchema>) {
    setFormError(null);
    try {
      // 1. Llamada al backend
      const response = await loginUser(values);

      // 🕵️‍♂️ DEBUG: Mira la consola del navegador (F12) para ver qué llega exactamente
      console.log("Respuesta del Backend:", response);

      // 2. 🛡️ FIX ROBUSTO: Buscamos el token con ambos nombres posibles
      const token = response.accessToken || response.access_token;

      if (token) {
        // Guardamos el token
        localStorage.setItem("access_token", token);
        
        // (Opcional) Si el backend envía el usuario, también podrías guardarlo
        // if (response.user) localStorage.setItem("user", JSON.stringify(response.user));
      } else {
        // Si llegamos aquí, mira el console.log para ver por qué falló
        throw new Error("No se recibió el token de acceso. Revisa la consola.");
      }

      // 3. Refrescar y Redirigir
      router.refresh(); 
      router.push("/"); 
      
    } catch (error) {
      console.error(error); // Para ver el error real
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Credenciales inválidas o error de conexión.");
      }
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
        <CardDescription>Ingresa a tu cuenta para continuar.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
            
            {registered && (
              <Alert className="border-green-500 text-green-700 bg-green-50">
                <AlertTitle>¡Registro Exitoso!</AlertTitle>
                <AlertDescription>Ahora puedes iniciar sesión con tu cuenta.</AlertDescription>
              </Alert>
            )}
            
            {message === 'company_created' && (
              <Alert className="border-blue-500 text-blue-700 bg-blue-50">
                <AlertTitle>¡Empresa Creada!</AlertTitle>
                <AlertDescription>Inicia sesión nuevamente para actualizar tus permisos.</AlertDescription>
              </Alert>
            )}

            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="usuario@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} {...field} />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Ingresar"}
            </Button>
            <div className="text-center text-sm">
              ¿No tienes cuenta? <Link href="/auth/register" className="underline text-primary">Regístrate</Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}