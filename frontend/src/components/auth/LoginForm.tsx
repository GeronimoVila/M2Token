"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";

import { loginUser } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(1, "La contraseña es requerida."),
});

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  const registered = searchParams.get("registered");
  const message = searchParams.get("message");
  const intendedRole = searchParams.get("role");
  const urlError = searchParams.get("error");

  useEffect(() => {
    if (urlError === "account_suspended") {
      setFormError("Tu sesión ha sido cerrada porque tu cuenta fue suspendida.");
    }
    
    if (message === "company_created") {
      toast.success("¡Empresa creada con éxito!", {
        description: "Por favor, inicia sesión nuevamente.",
        duration: 6000,
      });
      router.replace('/auth/login', { scroll: false });
    }
  }, [urlError, message, router]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { isSubmitting } = form.formState;

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/google`;
  };

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setFormError(null);
    try {
      const response = await loginUser(values);
      const token = response.accessToken || response.access_token;
      
      if (token) {
        localStorage.setItem("access_token", token);
      } else {
        throw new Error("No se recibió el token de acceso.");
      }
      
      await fetchUser();

      router.refresh(); 

      if (intendedRole === "proveedor") {
        router.push("/auth/complete-profile?step=proveedor");
      } else {
        const userRole = response.user?.role || response.role || "user"; 
        
        if (["empresa", "empresa_owner", "empresa_admin"].includes(userRole)) {
          router.push("/companies/dashboard");
        } else if (userRole === "proveedor") {
          router.push("/proveedor");
        } else if (userRole === "superadmin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    } catch (error: any) {
      const backendError = error.response?.data?.error || error.response?.data?.message;
      setFormError(backendError || error.message || "Credenciales inválidas.");
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
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
            
            {message && message !== "company_created" && (
              <Alert className="border-blue-500 text-blue-700 bg-blue-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
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
                  <FormControl><Input placeholder="usuario@ejemplo.com" {...field} /></FormControl>
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
                      <Input type={showPassword ? "text" : "password"} {...field} placeholder="••••••••" />
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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Ingresar"}
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">O continúa con</span></div>
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <div className="text-center text-sm text-muted-foreground">
              ¿No tienes cuenta? <Link href="/auth/register" className="underline text-primary">Regístrate</Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>}>
      <LoginFormContent />
    </Suspense>
  );
}