"use server";

export interface AgentResponse {
  answer: string;
  thread_id: string;
  answered: boolean;
  showFeedback?: boolean;
  showContactSupport?: boolean;
}

export async function submitMessage(
    message: string,
    thread_id: string | null
): Promise<AgentResponse> {

  const backendApiUrl = process.env.BACKEND_API_URL;

  if (!backendApiUrl) {
    console.error("Error: La variable de entorno BACKEND_API_URL no está configurada.");
    throw new Error("La configuración del servidor está incompleta.");
  }

  try {
    // --- INICIO DE LA CORRECCIÓN ---
    // Creamos el cuerpo de la petición base
    const requestBody: { query: string; thread_id?: string } = {
      query: message,
    };

    // Solo añadimos la clave 'thread_id' al cuerpo si tiene un valor
    if (thread_id) {
      requestBody.thread_id = thread_id;
    }
    // --- FIN DE LA CORRECCIÓN ---

    const response = await fetch(`${backendApiUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Usamos el cuerpo que acabamos de construir
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error(`La API del backend respondió con un error: ${response.status} ${response.statusText}`);
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