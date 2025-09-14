"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Bot, User, ArrowLeft } from "lucide-react";

import { getAnalystTicketDetail } from "@/lib/actions";
import { AnalystHeader } from "@/components/analyst/analyst-header";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 transition-shadow hover:shadow-sm">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-semibold text-gray-800 break-words">{value}</p>
      </div>
  );
}

/** Skeleton para la página de detalle del ticket */
function TicketDetailSkeleton() {
  return (
      <div className="min-h-screen bg-[#F7FAFC]">
        <AnalystHeader />
        <main className="p-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Izquierda */}
            <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col">
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-6" />
              <div className="grid grid-cols-2 gap-4 mb-8">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                    </div>
                ))}
              </div>
              <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse mt-auto" />
            </div>

            {/* Derecha */}
            <div className="lg:col-span-8 bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-6" />
              <div className="space-y-6">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
                      <div className="w-2/3 h-16 bg-gray-100 rounded-2xl animate-pulse" />
                    </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
  );
}

// Mapeos UI <-> BD
const DB_TO_UI: Record<string, string> = {
  "aceptado": "Abierto",
  "abierto": "Abierto",
  "en proceso": "Abierto",
  "en progreso": "Abierto",
  "en atención": "En Atención",
  "en atencion": "En Atención",
  "cerrado": "Cerrado",
  "finalizado": "Cerrado",
  "cancelado": "Rechazado",
  "rechazado": "Rechazado",
};
const UI_TO_DB: Record<string, string> = {
  "Abierto": "aceptado",
  "En Atención": "en atención",
  "Cerrado": "cerrado",
  "Rechazado": "cancelado",
};
const STATUS_OPTIONS_DB = [
  { db: "aceptado", ui: "Abierto" },
  { db: "en atención", ui: "En Atención" },
  { db: "cerrado", ui: "Cerrado" },
  { db: "cancelado", ui: "Rechazado" },
];

export default function TicketDetailPage() {
  const { data: session } = useSession();
  const token = (session as any)?.backendAccessToken as string | undefined;

  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [ticket, setTicket] = useState<{
    id_ticket: number;
    subject: string;
    type?: string;
    user?: string;
    company?: string;
    service?: string;
    email?: string;
    date?: string;
    status?: string; // UI label (Abierto/En Atención/...)
  } | null>(null);

  const [conversation, setConversation] = useState<ChatMessage[]>([]);

  // gestión de estado
  const [selectedStatusDb, setSelectedStatusDb] = useState<string>("aceptado");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    let active = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAnalystTicketDetail(id, token);

        const conv: ChatMessage[] = (data.conversation || []).map((m: any) => ({
          role: m.role === "agent" ? "assistant" : "user",
          content: m.content,
        }));

        if (!active) return;

        // data.status viene normalizado desde actions.ts; lo convertimos a DB para el selector
        const statusUi: string | undefined = data.status; // (Abierto/En Atención/...)
        const statusDb = statusUi ? UI_TO_DB[statusUi] ?? "aceptado" : "aceptado";

        setConversation(conv);
        setTicket({
          id_ticket: data.id_ticket,
          subject: data.subject,
          type: data.type,
          user: data.user,
          company: data.company,
          service: data.service,
          email: data.email,
          date: data.date,
          status: statusUi,
        });
        setSelectedStatusDb(statusDb);
      } catch (e: any) {
        console.error(e);
        if (!active) return;
        setError(e?.message || "Error al cargar el ticket");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [token, id]);

  const handleSave = async () => {
    if (!ticket || !token) return;
    try {
      setSaving(true);
      setSaveMessage(null);
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL!;
      const res = await fetch(`${baseUrl}/api/analista/tickets/${ticket.id_ticket}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: selectedStatusDb }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const ui = DB_TO_UI[String(json.status || selectedStatusDb).toLowerCase()] || "Abierto";
      setTicket((t) => (t ? { ...t, status: ui } : t));
      setSaveMessage("Estado actualizado correctamente.");
    } catch (e) {
      console.error(e);
      setSaveMessage("Error al actualizar el estado.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  if (loading) {
    return <TicketDetailSkeleton />;
  }

  if (error || !ticket) {
    return (
        <div className="min-h-screen bg-[#F7FAFC]">
          <AnalystHeader />
          <main className="p-8">
            <div className="max-w-7xl mx-auto text-red-600">
              Error: {error || "No se encontró el ticket"}
            </div>
          </main>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-[#F7FAFC]">
        <AnalystHeader />
        <main className="p-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Columna izquierda: detalles del ticket */}
            <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col">
              <div className="flex-grow">
                <Link
                    href="/analyst/dashboard"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver a la lista de tickets
                </Link>

                <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">
                  {ticket.subject}
                </h2>
                <p className="text-sm text-blue-600 font-medium mb-8">{ticket.id_ticket}</p>

                <h3 className="text-sm font-semibold text-gray-500 mb-3 border-b pb-2">
                  Detalles del Ticket
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <DetailCard label="Tipo" value={ticket.type || "-"} />
                  <DetailCard label="Usuario" value={ticket.user || "-"} />
                  <DetailCard label="Empresa" value={ticket.company || "-"} />
                  <DetailCard label="Servicio" value={ticket.service || "-"} />
                  <div className="col-span-2">
                    <DetailCard label="Correo" value={ticket.email || "-"} />
                  </div>
                  <DetailCard label="Fecha" value={ticket.date || "-"} />
                </div>

                {/* Gestión del Ticket */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3 border-b pb-2">
                    Gestión del Ticket
                  </h3>

                  {/* Estado actual (UI) */}
                  <DetailCard label="Estado actual" value={ticket.status || "-"} />

                  {/* Selector de nuevo estado (DB) */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">
                      Cambiar a
                    </label>
                    <select
                        value={selectedStatusDb}
                        onChange={(e) => setSelectedStatusDb(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {STATUS_OPTIONS_DB.map((opt) => (
                          <option key={opt.db} value={opt.db}>
                            {opt.ui}
                          </option>
                      ))}
                    </select>
                    {saveMessage && (
                        <p className="text-xs text-gray-500">{saveMessage}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-60"
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>

            {/* Columna derecha: conversación */}
            <div className="lg:col-span-8 bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-3">
                Conversación
              </h3>
              <div className="space-y-6">
                {conversation.map((message, index) => (
                    <div
                        key={index}
                        className={`flex items-start gap-4 ${
                            message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                    >
                      {message.role !== "user" && (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-inner">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                      )}
                      <div
                          className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                              message.role === "user"
                                  ? "bg-gradient-to-br from-blue-700 to-blue-500 text-white rounded-br-lg"
                                  : "bg-gray-100 text-gray-800 rounded-bl-lg"
                          }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                      {message.role === "user" && (
                          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                      )}
                    </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
  );
}
