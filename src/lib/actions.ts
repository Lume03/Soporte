// src/lib/actions.ts
"use server";
import { formatDateTime } from './dateUtils';
import { toUiStatus } from './data';
import { revalidatePath } from "next/cache";
import type { Servicio, FormState, Cliente, ClienteDetalle, ClienteFormInput } from "./types";

export type AgentResponse ={
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

export async function fetchAllServicios(token: string): Promise<Servicio[]> {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  try {
    
    const response = await fetch(`${API_URL}/api/admin/servicios`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Error fetching servicios:", response.status, response.statusText);
      
      if (response.status === 404) {
         throw new Error("Error 404: La ruta GET /api/admin/servicios no se encontró en el backend.");
      }
      throw new Error("Error al obtener los servicios del servidor.");
    }
    const data: Servicio[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error en fetchAllServicios:", error);
    throw error; 
  }
}

export async function createServicio(token: string, values: { nombre: string }): Promise<FormState> {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const nombre = values.nombre;

  if (!nombre) {
    return { success: false, message: "El nombre es obligatorio." };
  }

  try {
    
    const response = await fetch(`${API_URL}/api/admin/servicios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ nombre: nombre }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.detail || "Error al crear el servicio." };
    }

    revalidatePath("/admin/services");
    return { success: true, message: "Servicio creado exitosamente." };
  } catch (error) {
    console.error("Error en createServicio:", error);
    return { success: false, message: "Error interno del servidor." };
  }
}

export async function updateServicio(token: string, id: string, values: { nombre: string }): Promise<FormState> {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const nombre = values.nombre;
  
  if (!nombre) {
    return { success: false, message: "El nombre es obligatorio." };
  }
  
  try {
   
    const response = await fetch(`${API_URL}/api/admin/servicios/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ nombre: nombre }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.detail || "Error al actualizar el servicio." };
    }

    revalidatePath("/admin/services");
    return { success: true, message: "Servicio actualizado exitosamente." };
  } catch (error) {
    console.error("Error en updateServicio:", error);
    return { success: false, message: "Error interno del servidor." };
  }
}


export async function deleteServicio(token: string, id: string): Promise<FormState> {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  
  try {
    
    const response = await fetch(`${API_URL}/api/admin/servicios/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.detail || "Error al eliminar el servicio." };
    }

    revalidatePath("/admin/services");
    return { success: true, message: "Servicio eliminado exitosamente." };
  } catch (error) {
    console.error("Error en deleteServicio:", error);
    return { success: false, message: "Error interno del servidor." };
  }
}

export async function fetchAllClientes(token: string): Promise<Cliente[]> {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  try {
    const response = await fetch(`${API_URL}/api/admin/clientes`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
       console.error("Error fetching clientes:", response.status, response.statusText);
       if (response.status === 404) {
         throw new Error("Error 404: La ruta GET /api/admin/clientes no se encontró en el backend.");
       }
      throw new Error("Error al obtener los clientes.");
    }
    const data: Cliente[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error en fetchAllClientes:", error);
    throw error;
  }
}

export async function fetchClienteDetalle(token: string, id: string): Promise<ClienteDetalle> {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  try {
    const response = await fetch(`${API_URL}/api/admin/clientes/${id}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
         throw new Error(`Error 404: No se encontró el cliente con ID ${id}.`);
      }
      throw new Error("Error al obtener el detalle del cliente.");
    }
    const data: ClienteDetalle = await response.json();
    return data;
  } catch (error) {
    console.error("Error en fetchClienteDetalle:", error);
    throw error;
  }
}

export async function createCliente(token: string, values: ClienteFormInput): Promise<FormState> {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  if (!values.nombre_cliente || !values.dominio || !values.servicios_ids) {
     return { success: false, message: "Faltan datos en el formulario." };
  }

  try {
    const response = await fetch(`${API_URL}/api/admin/clientes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.detail || "Error al crear el cliente." };
    }

    revalidatePath("/admin/clients"); 
    return { success: true, message: "Cliente creado exitosamente." };
  } catch (error) {
    console.error("Error en createCliente:", error);
    return { success: false, message: "Error interno del servidor." };
  }
}


export async function updateCliente(token: string, id: string, values: ClienteFormInput): Promise<FormState> {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  if (!values.nombre_cliente || !values.dominio || !values.servicios_ids) {
     return { success: false, message: "Faltan datos en el formulario." };
  }
  
  try {
    const response = await fetch(`${API_URL}/api/admin/clientes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.detail || "Error al actualizar el cliente." };
    }

    revalidatePath("/admin/clients");
    return { success: true, message: "Cliente actualizado exitosamente." };
  } catch (error) {
    console.error("Error en updateCliente:", error);
    return { success: false, message: "Error interno del servidor." };
  }
}


export async function deleteCliente(token: string, id: string): Promise<FormState> {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  
  try {
    const response = await fetch(`${API_URL}/api/admin/clientes/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.detail || "Error al eliminar el cliente." };
    }

    revalidatePath("/admin/clients");
    return { success: true, message: "Cliente eliminado exitosamente." };
  } catch (error) {
    console.error("Error en deleteCliente:", error);
    return { success: false, message: "Error interno del servidor." };
  }
}