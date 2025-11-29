"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

import { registerUser } from "@/services/authService";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 1. ESQUEMA
// Incluye confirmPassword y validación de coincidencia
const registerSchema = z
  .object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
    email: z.string().email("Email inválido."),
    password: z.string().min(6, "Mínimo 6 caracteres."),
    confirmPassword: z.string().min(6, "Mínimo 6 caracteres."), // Campo para confirmar
    cuil_cuit: z.coerce.number().min(1000000000, "CUIL/CUIT inválido."),
    role: z.enum(["empresa", "proveedor"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"], // El error se mostrará en este campo
  });

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  // Estados para visibilidad de contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      cuil_cuit: 0,
      role: undefined,
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setFormError(null);
    try {
      // Eliminamos confirmPassword antes de enviar al backend
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...dataToSend } = values;

      await registerUser(dataToSend);
      router.push("/auth/login?registered=true");
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
        <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
        <CardDescription>
          Regístrate para gestionar tus proyectos o proveer materiales.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {/* Nombre */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre o Razón Social</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Constructora S.A." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="contacto@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contraseña con Ojo */}
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

            {/* Confirmar Contraseña con Ojo */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repetir Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
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

            {/* CUIL/CUIT */}
            <FormField
              control={form.control}
              name="cuil_cuit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CUIL / CUIT</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="20123456789"
                      {...field}
                      // Solución al error de tipos 'unknown' vs 'string'
                      value={field.value ? String(field.value) : ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.valueAsNumber || e.target.value
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selector de Rol */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Cuenta</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    // Solución al error de tipos en Select
                    value={(field.value as string) || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="empresa">
                        Empresa Constructora
                      </SelectItem>
                      <SelectItem value="proveedor">
                        Proveedor de Materiales
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </Button>
            <div className="text-center text-sm">
              ¿Ya tienes cuenta?{" "}
              <Link href="/auth/login" className="underline text-primary">
                Inicia Sesión
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}