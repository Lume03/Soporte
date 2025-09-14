// src/lib/actions.ts
"use server";

export interface AgentResponse {
  answer: string;
  thread_id: string;
  answered: boolean;
  showFeedback?: boolean;
  showContactSupport?: boolean;
}

// Mapea estados de BD → estados de UI usados por <TicketStatusBadge />
function toUiStatus(
    raw?: string
): "Abierto" | "En Atención" | "Cerrado" | "Rechazado" | undefined {
  if (!raw) return undefined;
  const v = raw
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  if (v === "en atencion") return "En Atención";
  if (v === "aceptado" || v === "abierto" || v === "en proceso" || v === "en progreso")
    return "Abierto";
  if (v === "cerrado" || v === "finalizado") return "Cerrado";
  if (v === "cancelado" || v === "rechazado" || v === "anulado") return "Rechazado";
  return undefined;
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

export async function getAnalystTickets(token: string, limit = 10, offset = 0) {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) {
    throw new Error("Falta NEXT_PUBLIC_BACKEND_API_URL en el .env.local del front");
  }

  const res = await fetch(
      `${baseUrl}/api/analista/conversaciones?limit=${limit}&offset=${offset}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
  );

  if (!res.ok) {
    throw new Error(`Error al listar conversaciones: ${res.status}`);
  }

  const data = await res.json();
  data.items = (data.items || []).map((t: any) => ({
    ...t,
    status: toUiStatus(t.status),
  }));
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
  return { ...data, status: toUiStatus(data.status) };
}

// NUEVO: actualizar estado (y descripción si es Cerrado)
export async function updateAnalystTicketStatus(
    id_ticket: number | string,
    status: string,
    description: string | undefined,
    token: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) throw new Error("Falta NEXT_PUBLIC_BACKEND_API_URL");

  const body: any = { status };
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

  return res.json(); // { ok: true, status: "..."}
}
