import { z } from "zod";

export interface LoginData {
  email: string;
  password: string;
}

const NESTJS_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  type: "EMPRESA" | "PROVEEDOR";
}

export async function loginUser(data: LoginData) {
  try {
    const response = await fetch(`${NESTJS_BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Credenciales inválidas.");
      }
      throw new Error("Error en el servidor.");
    }

    const result = await response.json();

    // 🔴 FIX: Si la respuesta viene envuelta por el Interceptor, devolvemos solo la data
    if (result.success && result.data) {
      return result.data;
    }

    return result;
  } catch (error) {
    console.error("Error en loginUser:", error);
    throw error;
  }
}

export async function registerUser(data: RegisterData) {
  try {
    const response = await fetch(`${NESTJS_BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include", 
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Si el error también viene envuelto (por el ExceptionFilter), extraemos el mensaje
      const errorMessage = errorData.error || errorData.message || "Error al registrar usuario.";
      throw new Error(errorMessage);
    }

    const result = await response.json();

    // 🔴 FIX: Desempaquetado para consistencia
    if (result.success && result.data) {
      return result.data;
    }

    return result;
  } catch (error) {
    console.error("Error en registerUser:", error);
    throw error;
  }
}