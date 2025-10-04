// src/app/analyst/ticket/[id]/page.tsx

"use client";

import { Bot, User, FileWarning, Send, Lock, ChevronDown } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { AnalystHeader } from "@/components/analyst/analyst-header";
import { getAnalystTicketDetail, updateAnalystTicketStatus, escalateTicket } from "@/lib/actions";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import { fromUiStatus } from "@/lib/data";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast"

type ChatMessage = { role: "user" | "assistant"; content: string };
type TicketStatus = "Aceptado" | "En Atención" | "Finalizado" | "Cancelado";
type TicketLevel = "Bajo" | "Medio" | "Alto" | "Crítico";

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 transition-shadow hover:shadow-sm">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-semibold text-gray-800 break-words">{value}</p>
      </div>
  );
}

export default function TicketDetailPage() {
  const { data: session } = useSession();
  const token = (session as any)?.backendAccessToken as string | undefined;
  const { toast } = useToast();

  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);

  const [escalateReason, setEscalateReason] = useState("");
  const [escalateError, setEscalateError] = useState<string | null>(null);
  const [isEscalating, setIsEscalating] = useState(false);

  const [ticket, setTicket] = useState<{
    id_ticket: number;
    subject: string;
    type?: string;
    user?: string;
    company?: string;
    service?: string;
    email?: string;
    date?: string;
    status?: TicketStatus;
    level?: TicketLevel;
    last_update?: string;
  } | null>(null);

  const [conversation, setConversation] = useState<ChatMessage[]>([]);

  // Gestión
  const [currentStatus, setCurrentStatus] = useState<TicketStatus>("Aceptado");
const [selectedStatus, setSelectedStatus] = useState<TicketStatus>("Aceptado");
  const [description, setDescription] = useState("");

  const [currentLevel, setCurrentLevel] = useState<TicketLevel>("Bajo");
  const [selectedLevel, setSelectedLevel] = useState<TicketLevel>("Bajo");

  const levelOptions: TicketLevel[] = ["Bajo", "Medio", "Alto", "Crítico"];
  const responseTimes: Record<TicketLevel, string> = {
  Bajo: "4 días",
  Medio: "2 días",
  Alto: "1 día",
  Crítico: "4 horas",
};

const estimatedResponseTime = ticket?.level ? responseTimes[ticket.level] : "-";

  const requiresDescription = useMemo(
      () => selectedStatus === "Finalizado" || selectedStatus === "Cancelado",
      [selectedStatus]
  );

  const isTerminalStatus = useMemo(
      () => currentStatus === "Finalizado" || currentStatus === "Cancelado",
      [currentStatus]
  );

  const statusOptions = useMemo(() => {
    if (currentStatus === "Aceptado") {
      return ["Aceptado", "En Atención", "Finalizado", "Cancelado"];
    }
    if (currentStatus === "En Atención") {
      return ["En Atención", "Finalizado", "Cancelado"];
    }
    return [currentStatus];
  }, [currentStatus]);

  useEffect(() => {
    if (!token || !id) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAnalystTicketDetail(id, token);
        const conv: ChatMessage[] = (data.conversation || []).map((m: any) => ({
          role: m.role === "agent" ? "assistant" : "user",
          content: m.content,
        }));
        setConversation(conv);

        const s: TicketStatus | undefined = data.status as TicketStatus | undefined;
        const initial = (s ?? "Abierto") as TicketStatus;


        const rawLevel: string = data.level ?? "Bajo";
        const capitalizedLevel = (rawLevel.charAt(0).toUpperCase() + rawLevel.slice(1)) as TicketLevel;
        
        
        const rawType: string = data.type ?? "";
        const capitalizedType = rawType.charAt(0).toUpperCase() + rawType.slice(1);

        setTicket({
          id_ticket: data.id_ticket,
          subject: data.subject,
          type: capitalizedType,
          user: data.user,
          company: data.company,
          service: data.service,
          email: data.email,
          date: data.date,
          status: s,
          level: capitalizedLevel, // Usamos la variable corregida
          last_update: data.last_update,
        });

        setCurrentStatus(initial);
        setSelectedStatus(initial);
        setDescription("");

        setCurrentLevel(capitalizedLevel); // Usamos la variable corregida
        setSelectedLevel(capitalizedLevel);

      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Error al cargar el ticket");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, id]);

  const onChangeStatus = (value: string) => {
    const v = value as TicketStatus;
    setSelectedStatus(v);
    setSaveOk(false);
    setSaveError(null);
    if (v !== "Finalizado") setDescription("");

  };
  const onChangeLevel = (value: string) => {
  setSelectedLevel(value as TicketLevel);
  setSaveOk(false);
  setSaveError(null);};


  const handleSave = async () => {
  setSaveError(null);
  setSaveOk(false);
  if (!token || !ticket) return;

  if (requiresDescription && !description.trim()) {
    setSaveError("La descripción es obligatoria para cerrar el ticket.");
    return;
  }

  try {
    setSaving(true);

    // ---- INICIO DE LA CORRECCIÓN ----
    // Usamos la función de actions.ts en lugar del fetch directo
    const statusForBackend = fromUiStatus(selectedStatus); // <-- Añade esta línea
    const updatedTicketData = await updateAnalystTicketStatus(
      ticket.id_ticket,
      statusForBackend, // <-- Modifica esta línea
      description.trim() || undefined,
      token,
      selectedLevel
    );
    // ---- FIN DE LA CORRECCIÓN ----

    setSaveOk(true);
    setCurrentStatus(selectedStatus);
    setCurrentLevel(selectedLevel);

    // Actualizamos el estado local con los datos formateados que nos devuelve la acción
    setTicket({
      ...ticket,
      status: selectedStatus,
      level: selectedLevel,
      last_update: updatedTicketData.last_update, // Ahora sí se actualizará
    });

    } catch (e: any) {
      console.error(e);
      setSaveError(e?.message || "Error al actualizar el estado.");
    } finally {
      setSaving(false);
    }
  };


  const handleConfirmEscalate = async () => {
    setEscalateError(null);

    // =================== INICIO DE LA CORRECCIÓN ===================
    //
    // Añadimos esta comprobación.
    // Esto soluciona ambos errores:
    // 1. Asegura que `ticket` no es 'null' al acceder a `ticket.id_ticket` (Error ts18047).
    // 2. Asegura que `ticket` no es 'null' al hacer `...ticket` en `setTicket` (Error ts2345).
    //
    if (!ticket) {
      setEscalateError("No se ha podido cargar la información del ticket. Por favor, recargue la página.");
      return;
    }
    // ==================== FIN DE LA CORRECCIÓN =====================

    // Validación del motivo
    if (!escalateReason.trim()) {
      setEscalateError("El motivo es obligatorio");
      return;
    }

    if (escalateReason.trim().length < 10) {
      setEscalateError("El motivo debe tener al menos 10 caracteres");
      return;
    }
    setIsEscalating(true);
    try {
      // Llamar al backend para derivar el ticket (ahora es seguro)
      const updatedTicket = await escalateTicket(
        ticket.id_ticket,
        escalateReason.trim(),
        token!
      );
      // Mostrar toast de éxito
      toast({
        title: "✅ Ticket Derivado",
        description: "El ticket ha sido derivado exitosamente a un analista de nivel superior.",
        variant: "default",
      });
      // Actualizar el ticket localmente con la nueva información
      if (updatedTicket) {
        // (Ahora es seguro)
        setTicket({
          ...ticket,
          last_update: updatedTicket.last_update // Actualizar fecha de última modificación
        });
      }
      // Limpiar el modal
      setEscalateReason("");
      setShowEscalateModal(false);
      // Opcional: Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        window.location.href = "/analyst/dashboard";
      }, 2000);
    } catch (error: any) {
      console.error("Error al derivar:", error);

      // Mostrar el error específico
      setEscalateError(error.message || "Error al derivar el ticket. Por favor, intente nuevamente.");

      // También mostrar un toast de error
      toast({
        title: "❌ Error al Derivar",
        description: error.message || "No se pudo derivar el ticket",
        variant: "destructive",
      });
    } finally {
      setIsEscalating(false);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-[#F7FAFC]">
          <AnalystHeader />
          <main className="p-8">
            <div className="max-w-7xl mx-auto text-gray-600">Cargando...</div>
          </main>
        </div>
    );
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
      <div className="h-screen bg-[#F7FAFC] flex flex-col">
        <AnalystHeader />
        <main className="p-8 flex-1 min-h-0">
          <div className="max-w-7xl mx-auto h-full">

            <Link
            href="/analyst/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a la lista de tickets
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-[calc(100%-48px)]">

              {/* Izquierda: detalles + gestión */}
              <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col h-full overflow-y-auto">

              {/* ---- 1. Cabecera Fija (con position: sticky) ---- */}
              {/* Ajustes con márgenes negativos para compensar el padding del padre */}
              <div className="sticky top-[-24px] bg-white z-10 -mx-6 -mt-6 px-6 pt-6 pb-4 mb-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">
                  {ticket.subject}
                </h2>
                <p className="text-sm text-blue-600 font-medium">
                  {ticket.id_ticket}
                </p>
              </div>

              {/* ---- 2. Contenido que se desplaza (tu código original) ---- */}
              <div className="flex-grow">
                {/* El Asunto y el ID ya no están aquí */}
                <h3 className="text-sm font-semibold text-gray-500 mb-3 border-b pb-2">
                  Detalles del Ticket
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <DetailCard label="Tipo" value={ticket.type || "-"} />
                  <DetailCard label="Usuario" value={ticket.user || "-"} />
                  <DetailCard label="Empresa" value={ticket.company || "-"} />
                  <DetailCard label="Servicio" value={ticket.service || "-"} />
                  <div className="md:col-span-2">
                    <DetailCard label="Correo" value={ticket.email || "-"} />
                  </div>
                  <DetailCard label="Fecha" value={ticket.date || "-"} />
                  <DetailCard label="Última Actualización" value={ticket.last_update || "-"} />
                  <DetailCard label="Tiempo de Atención" value={estimatedResponseTime} />
                </div>

                {/* Gestión */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3 border-b pb-2">
                    Gestión del Ticket
                  </h3>

                  <button
                    type="button"
                    onClick={() => setShowEscalateModal(true)}
                    className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-cyan-500 to-green-500 text-white py-2.5 rounded-lg hover:from-cyan-600 hover:to-green-600 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" />
                    Derivar Ticket
                  </button>

                  <div className="flex items-center gap-4">
                    <label className="block text-sm font-medium text-gray-700 w-[140px] flex-shrink-0">
                      NIVEL ACTUAL
                    </label>
                    <input
                        value={currentLevel || "-"}
                        disabled
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-sm shadow-sm"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                      <label
                          htmlFor="level"
                          className="block text-sm font-medium text-gray-700 w-[140px] flex-shrink-0"
                      >
                        CAMBIAR NIVEL A
                      </label>
                      <div className="relative w-full">
                        <select
                            id="level"
                            name="level"
                            value={selectedLevel}
                            onChange={(e) => onChangeLevel(e.target.value)}
                            className="w-full appearance-none pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
                        >
                          {levelOptions.map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                  </div>
                  <hr className="my-4 border-gray-200" />
                    <div className="flex items-center gap-4">
                      <label className="block text-sm font-medium text-gray-700 w-[140px] flex-shrink-0">
                        ESTADO ACTUAL
                      </label>
                      <input
                          value={currentStatus || "-"}
                          disabled
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-sm shadow-sm"
                      />
                    </div>
                  <div className="flex items-center gap-4">
                    <label
                        htmlFor="status"
                        className={`block text-sm font-medium w-[140px] flex-shrink-0 ${
                          isTerminalStatus ? "text-gray-400" : "text-gray-700"
                        }`}
                      >
                        CAMBIAR A
                      </label>
                      <div className="relative w-full">
                        <select
                            id="status"
                            name="status"
                            value={selectedStatus}
                            onChange={(e) => onChangeStatus(e.target.value)}
                            disabled={isTerminalStatus}
                            className="w-full appearance-none pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        {isTerminalStatus ? (
                          <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        )}
                      </div>
                  </div>
                  <div className="min-h-[105px]">
                    {requiresDescription && (
                        <div className="animate-in fade-in-0 duration-500">
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            DESCRIPCIÓN <span className="text-red-500">(*)</span>
                          </label>
                          <textarea
                              id="description"
                              name="description"
                              rows={3}
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
                              placeholder="Motivo del cierre / cómo se solucionó…"
                          />
                        </div>
                    )}
                  </div>
                  {saveError && <p className="text-sm text-red-600">{saveError}</p>}
                  {saveOk && (
                      <p className="text-sm text-green-600">
                        Estado actualizado correctamente.
                      </p>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-4">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 disabled:opacity-60 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-semibold shadow-md hover:shadow-lg"
                >
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>

            {/* Derecha: conversación */}
            <div className="lg:col-span-8 bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col min-h-0">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-3">
                Conversación
              </h3>
              <div className="space-y-6 flex-1 overflow-y-auto pr-2">
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
                      className={`max-w-[70%] rounded-2xl p-4 shadow-sm overflow-hidden ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-700 to-blue-500 text-white rounded-br-lg"
                          : "bg-gray-100 text-gray-800 rounded-bl-lg"
                      }`}
                    >
                      {message.role === "user" ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <div className="markdown-content">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              // EXACTAMENTE los mismos estilos que el chatbot
                              table: ({ children, ...props }) => (
                                <div className="my-3 -mx-2">
                                  <table className="w-full border-collapse text-xs" {...props}>
                                    {children}
                                  </table>
                                </div>
                              ),
                              thead: ({ children, ...props }) => (
                                <thead className="bg-blue-50/70 sticky top-0" {...props}>
                                  {children}
                                </thead>
                              ),
                              tbody: ({ children, ...props }) => (
                                <tbody className="divide-y divide-gray-200" {...props}>
                                  {children}
                                </tbody>
                              ),
                              tr: ({ children, ...props }) => (
                                <tr className="hover:bg-gray-50/50 transition-colors" {...props}>
                                  {children}
                                </tr>
                              ),
                              th: ({ children, ...props }) => {
                                const content = String(children);
                                let className = "px-2 py-1.5 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider border border-gray-300 bg-blue-50/70";

                                if (content?.toLowerCase().includes('id')) {
                                  className += " w-[60px] max-w-[60px]";
                                } else if (content?.toLowerCase().includes('asunto')) {
                                  className += " min-w-[180px]";
                                } else if (content?.toLowerCase().includes('estado')) {
                                  className += " w-[75px]";
                                } else if (content?.toLowerCase().includes('nivel')) {
                                  className += " w-[60px]";
                                } else if (content?.toLowerCase().includes('tipo')) {
                                  className += " w-[80px]";
                                } else if (content?.toLowerCase().includes('servicio')) {
                                  className += " w-[80px]";
                                }

                                return <th className={className} {...props}>{children}</th>;
                              },
                              td: ({ children, ...props }) => {
                                const content = String(children);
                                let className = "px-2 py-1.5 text-[11px] text-gray-700 border border-gray-200";

                                if (content && (content.match(/^#?\d{1,4}$/) || content.length < 5)) {
                                  className += " text-center font-medium";
                                }
                                else if (['Aceptado', 'Pendiente', 'En proceso', 'Resuelto', 'Cerrado'].includes(content)) {
                                  className += " text-center";
                                  if (content === 'Aceptado') className += " text-green-600 font-medium";
                                  else if (content === 'Pendiente') className += " text-yellow-600 font-medium";
                                  else if (content === 'En proceso') className += " text-blue-600 font-medium";
                                }
                                else if (['Bajo', 'Medio', 'Alto', 'Crítico'].includes(content)) {
                                  className += " text-center";
                                  if (content === 'Bajo') className += " text-gray-500";
                                  else if (content === 'Medio') className += " text-yellow-600";
                                  else if (content === 'Alto') className += " text-orange-600";
                                  else if (content === 'Crítico') className += " text-red-600 font-semibold";
                                }
                                else {
                                  className += " break-words";
                                }

                                return (
                                  <td className={className} style={{ wordBreak: 'break-word' }} {...props}>
                                    {children}
                                  </td>
                                );
                              },
                              // Párrafos y texto - MISMO TAMAÑO que el chatbot
                              p: ({ children, ...props }) => (
                                <p className="mb-2 last:mb-0 leading-relaxed text-sm" {...props}>
                                  {children}
                                </p>
                              ),
                              ul: ({ children, ...props }) => (
                                <ul className="list-disc list-inside mb-2 text-sm space-y-1" {...props}>
                                  {children}
                                </ul>
                              ),
                              ol: ({ children, ...props }) => (
                                <ol className="list-decimal list-inside mb-2 text-sm space-y-1" {...props}>
                                  {children}
                                </ol>
                              ),
                              li: ({ children, ...props }) => (
                                <li className="text-sm" {...props}>
                                  {children}
                                </li>
                              ),
                              h1: ({ children, ...props }) => (
                                <h1 className="text-lg font-bold mb-2 text-gray-900" {...props}>
                                  {children}
                                </h1>
                              ),
                              h2: ({ children, ...props }) => (
                                <h2 className="text-base font-semibold mb-2 text-gray-800" {...props}>
                                  {children}
                                </h2>
                              ),
                              h3: ({ children, ...props }) => (
                                <h3 className="text-sm font-semibold mb-1 text-gray-700" {...props}>
                                  {children}
                                </h3>
                              ),
                              strong: ({ children, ...props }) => (
                                <strong className="font-semibold text-gray-900" {...props}>
                                  {children}
                                </strong>
                              ),
                              em: ({ children, ...props }) => (
                                <em className="italic" {...props}>
                                  {children}
                                </em>
                              ),
                              code: ({ children, ...props }) => (
                                <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                                  {children}
                                </code>
                              ),
                              pre: ({ children, ...props }) => (
                                <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto mb-2 text-xs" {...props}>
                                  {children}
                                </pre>
                              ),
                              blockquote: ({ children, ...props }) => (
                                <blockquote className="border-l-4 border-blue-400 pl-3 my-2 italic text-gray-600" {...props}>
                                  {children}
                                </blockquote>
                              ),
                              hr: () => (
                                <hr className="my-3 border-gray-200" />
                              ),
                              a: ({ children, href, ...props }) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-600 underline"
                                  {...props}
                                >
                                  {children}
                                </a>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
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
          </div>
        </main>

        {showEscalateModal && (
          <div
            // Overlay (fondo oscuro)
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0"
            onClick={() => setShowEscalateModal(false)}
          >
            <div
              // Contenedor del Modal
              className="relative w-full max-w-md p-6 bg-white rounded-2xl shadow-xl animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()} // Evita que el clic en el modal cierre el overlay
            >
              {/* Icono Superior (Azul) */}
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Send className="h-6 w-6 text-blue-600" />
              </div>

              {/* Contenido */}
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Derivar Ticket
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Proporcione un motivo claro para la derivación.
                </p>
              </div>

              {/* Formulario (Simplificado) */}
              <div className="grid gap-4 py-6">

                {/* Campo de Motivo (ahora ocupa todo el espacio) */}
                <div className="grid gap-2">
                  <Label htmlFor="escalate-reason" className="text-sm font-medium">
                    Motivo de la derivación
                  </Label>
                  <Textarea
                    id="escalate-reason"
                    value={escalateReason}
                    onChange={(e) => setEscalateReason(e.target.value)}
                    className="min-h-[120px] focus:ring-blue-500"
                    placeholder="Escriba el motivo aquí..."
                  />
                </div>

                {/* Error */}
                {escalateError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 p-3 bg-red-50 rounded-lg border border-red-200">
                    <FileWarning className="w-4 h-4 flex-shrink-0" />
                    <p>{escalateError}</p>
                  </div>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-col-reverse sm:flex-row sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowEscalateModal(false)}
                  className="w-full sm:w-1/2 mt-2 sm:mt-0"
                >
                  Cancelar
                </Button>

                {/* Botón de Confirmar (Degradado Azul) */}
                <Button
                  onClick={handleConfirmEscalate}
                  disabled={isEscalating}
                  className="w-full sm:w-1/2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
                >
                  {isEscalating ? "Derivando…" : "Confirmar Derivación"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
