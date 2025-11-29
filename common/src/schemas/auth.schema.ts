import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({
    message: "Por favor ingresa un email válido.",
  }),
  password: z.string().min(1, {
    message: "La contraseña no puede estar vacía.",
  }),
});

export type LoginData = z.infer<typeof loginSchema>;