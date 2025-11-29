import { type LoginData } from "@common/schemas/auth.schema";
import { z } from "zod";

const NESTJS_BACKEND_URL = "http://localhost:4000";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  cuil_cuit: number;
  role: "empresa" | "proveedor";
}

/**
 * Llama al endpoint /auth/login de la API de NestJS.
 * NO maneja el token (el navegador lo hace automáticamente
 * gracias a la cookie HttpOnly).
 *
 * @param data Los datos del formulario (email y password)
 * @returns Los datos del usuario (sin el token)
 * @throws Un error si las credenciales son incorrectas o el servidor falla
 */
export async function loginUser(data: LoginData) {
  try {
    const response = await fetch(`${NESTJS_BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include", 
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Credenciales inválidas. Por favor, verifica tu email y contraseña."
        );
      }
      throw new Error("Error en el servidor. Inténtalo de nuevo más tarde.");
    }

    const result = await response.json();

    return result;
  } catch (error) {
    console.error("Error en loginUser:", error);

    if (error instanceof z.ZodError) {
      throw new Error("Datos del formulario con formato inválido.");
    }

    throw error;
  }
}

/**
 * Llama al endpoint /auth/register para crear un nuevo usuario.
 *
 * @param data Los datos del formulario de registro
 * @returns La respuesta del servidor (usualmente el usuario creado)
 */
export async function registerUser(data: RegisterData) {
  try {
    const response = await fetch(`${NESTJS_BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include", 
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al registrar usuario.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en registerUser:", error);
    throw error;
  }
}