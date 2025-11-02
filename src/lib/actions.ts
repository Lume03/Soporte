// src/lib/actions.ts
"use server";
import { formatDateTime } from './dateUtils';
import { toUiStatus } from './data';
export interface AgentResponse {
  answer: string;
  thread_id: string;
  answered: boolean;
  showFeedback?: boolean;
  showContactSupport?: boolean;
}

export async function submitMessage(
    message: string,
    thread_id: string | null,
    backendToken: string
): Promise<AgentResponse> {
  const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!backendApiUrl) {
    console.error("Error: La variable de entorno NEXT_PUBLIC_BACKEND_API_URL no está configurada.");
    throw new Error("La configuración del servidor está incompleta.");
  }

  try {
    const body: { query: string; thread_id?: string } = { query: message };
    if (thread_id) body.thread_id = thread_id;

    const res = await fetch(`${backendApiUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${backendToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(`La API del backend respondió con un error: ${res.status} ${res.statusText}`);
      if (res.status === 401) {
        console.error("Token de FastAPI rechazado por el backend. El usuario debe re-autenticarse.");
      }
      throw new Error("Hubo un problema al comunicarse con el agente de soporte.");
    }

    const result = await res.json();
    const text = String(result.response || "");
    const ticketCreated = /he generado el ticket\s*#?\d+/i.test(text);

    return {
      answered: true,
      answer: text,
      thread_id: result.thread_id,
      showFeedback: true,
      showContactSupport: ticketCreated,
    };
  } catch (err) {
    console.error("Error al llamar a la API del backend:", err);
    return {
      answered: false,
      answer:
          "Lo siento, estoy teniendo problemas para conectarme con el agente de soporte. Por favor, intenta de nuevo más tarde.",
      thread_id: thread_id || "",
      showFeedback: false,
      showContactSupport: true,
    };
  }
}

export async function getAnalystTickets(
    token: string,
    limit = 10,
    offset = 0,
    status?: string           
) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL!;
    const url = new URL(`${baseUrl}/api/analista/conversaciones`);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    if (status && status !== "Todos") url.searchParams.set("status", status); 

    const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });
    if (!res.ok) throw new Error(`Error al listar conversaciones: ${res.status}`);
    const data = await res.json();
    data.items = (data.items || []).map((t: any) => ({ ...t, status: toUiStatus(t.status) }));
    return data;
}

export async function getAnalystTicketDetail(id_ticket: number | string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) {
    throw new Error("Falta NEXT_PUBLIC_BACKEND_API_URL en el .env.local del front");
  }

  const res = await fetch(`${baseUrl}/api/analista/conversaciones/${id_ticket}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Error al obtener detalle: ${res.status}`);
  }

  const data = await res.json();
  return { ...data, status: toUiStatus(data.status), last_update: formatDateTime(data.updated_at) };
}

export async function updateAnalystTicketStatus(
      id_ticket: number | string,
      status: string,
      description: string | undefined,
      token: string,
      level: string 
  ) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    if (!baseUrl) throw new Error("Falta NEXT_PUBLIC_BACKEND_API_URL");

    const body: any = { status, level }; 
    if (description && description.trim()) body.description = description.trim();

    const res = await fetch(`${baseUrl}/api/analista/tickets/${id_ticket}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let msg = "No se pudo actualizar el estado.";
      try {
        const j = await res.json();
        if (j?.detail) msg = j.detail;
      } catch {}
      throw new Error(msg);
    }

    const data = await res.json();

    return { 
      ...data, 
      status: toUiStatus(data.status),
      last_update: formatDateTime(data.updated_at)
    }
  }



export async function escalateTicket(
  id_ticket: number | string,
  motivo: string,
  token: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) {
    throw new Error("Falta NEXT_PUBLIC_BACKEND_API_URL en el .env.local del front");
  }


  if (!motivo || motivo.trim().length < 10) {
    throw new Error("El motivo debe tener al menos 10 caracteres");
  }

  const res = await fetch(`${baseUrl}/api/analista/tickets/${id_ticket}/derivar`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ motivo: motivo.trim() }),
  });

  if (!res.ok) {
    let errorMessage = "No se pudo derivar el ticket";
    
    try {
      const errorData = await res.json();
      if (errorData?.detail) {
        errorMessage = errorData.detail;
      }
    } catch {

    }


    if (res.status === 403) {
      if (errorMessage.includes("nivel 3")) {
        throw new Error("Los analistas de nivel 3 no pueden derivar tickets (último nivel de escalado)");
      }
      if (errorMessage.includes("no está asignado")) {
        throw new Error("Solo puede derivar tickets asignados a usted");
      }
    }
    
    if (res.status === 409) {
      throw new Error("No hay analistas de nivel superior disponibles para derivar este ticket");
    }

    throw new Error(errorMessage);
  }

  const data = await res.json();
  

  return { 
    ...data, 
    status: toUiStatus(data.status),
    last_update: formatDateTime(data.updated_at)
  };
}