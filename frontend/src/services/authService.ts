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

export interface CompleteSocialData {
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
      if (response.status === 401) throw new Error("Credenciales inválidas.");
      throw new Error("Error en el servidor.");
    }

    const result = await response.json();
    return result.success && result.data ? result.data : result;
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
      const errorMessage = errorData.error || errorData.message || "Error al registrar usuario.";
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.success && result.data ? result.data : result;
  } catch (error) {
    console.error("Error en registerUser:", error);
    throw error;
  }
}

export async function completeSocialRegistration(data: CompleteSocialData) {
  try {
    const response = await fetch(`${NESTJS_BACKEND_URL}/auth/complete-social-registration`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al completar el perfil.");
    }

    const result = await response.json();
    return result.success && result.data ? result.data : result;
  } catch (error) {
    console.error("Error en completeSocialRegistration:", error);
    throw error;
  }
}