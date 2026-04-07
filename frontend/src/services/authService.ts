import axios from "axios";

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
    const response = await axios.post(`${NESTJS_BACKEND_URL}/auth/login`, data, {
      withCredentials: true,
    });
    
    const result = response.data;
    return result.success !== undefined ? result.data : result;
  } catch (error) {
    console.error("Error en loginUser:", error);
    throw error;
  }
}

export async function registerUser(data: RegisterData) {
  try {
    const response = await axios.post(`${NESTJS_BACKEND_URL}/auth/register`, data, {
      withCredentials: true,
    });
    
    const result = response.data;
    return result.success !== undefined ? result.data : result;
  } catch (error) {
    console.error("Error en registerUser:", error);
    throw error;
  }
}

export async function completeSocialRegistration(data: CompleteSocialData) {
  try {
    const response = await axios.patch(`${NESTJS_BACKEND_URL}/auth/complete-social-registration`, data, {
      withCredentials: true,
    });
    
    const result = response.data;
    return result.success !== undefined ? result.data : result;
  } catch (error) {
    console.error("Error en completeSocialRegistration:", error);
    throw error;
  }
}