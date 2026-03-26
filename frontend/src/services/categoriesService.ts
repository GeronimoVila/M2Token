const NESTJS_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function getActiveCategories() {
  try {
    const response = await fetch(`${NESTJS_BACKEND_URL}/categories`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Error al obtener las categorías.");
    }

    const result = await response.json();
    
    return result.success !== undefined && result.data ? result.data : result;
    
  } catch (error) {
    console.error("Error en getActiveCategories:", error);
    return [];
  }
}