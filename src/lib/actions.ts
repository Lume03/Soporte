"use server";

export interface AgentResponse {
  answer: string;
  thread_id: string;
  answered: boolean;
  showFeedback?: boolean;
  showContactSupport?: boolean;
}

// --- CAMBIO 1: La función AHORA ACEPTA el token del backend como tercer argumento ---
export async function submitMessage(
    message: string,
    thread_id: string | null,
    backendToken: string  // <--- Este argumento es nuevo y obligatorio
): Promise<AgentResponse> {

  const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  if (!backendApiUrl) {
    console.error("Error: La variable de entorno NEXT_PUBLIC_BACKEND_API_URL no está configurada.");
    throw new Error("La configuración del servidor está incompleta.");
  }

  try {
    const requestBody: { query: string; thread_id?: string } = {
      query: message,
    };

    if (thread_id) {
      requestBody.thread_id = thread_id;
    }

    const response = await fetch(`${backendApiUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // --- CAMBIO 2: Añadimos el Header de Autorización (Esto resuelve el 401) ---
        'Authorization': `Bearer ${backendToken}`
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error(`La API del backend respondió con un error: ${response.status} ${response.statusText}`);
      
      // Si el error es 401 AHORA, significa que el token expiró o es inválido
      if (response.status === 401) {
         console.error("Token de FastAPI rechazado por el backend. El usuario debe re-autenticarse.");
      }

      throw new Error("Hubo un problema al comunicarse con el agente de soporte.");
    }

    const result = await response.json();

    return {
      answered: true,
      answer: result.response,
      thread_id: result.thread_id,
      showFeedback: true,
      showContactSupport: false,
    };

  } catch (error) {
    console.error("Error al llamar a la API del backend:", error);
    return {
      answered: false,
      answer: "Lo siento, estoy teniendo problemas para conectarme con el agente de soporte. Por favor, intenta de nuevo más tarde.",
      thread_id: thread_id || "",
      showFeedback: false,
      showContactSupport: true,
    };
  }
}

