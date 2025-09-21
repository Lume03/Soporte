"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import type { Message } from "@/lib/types";
import { ChatArea } from "@/components/chat/chat-area";
import { ChatInput } from "@/components/chat/chat-input";
import {
    Send,
    Ticket as TicketIcon,
    User,
    Building2,
    UserCog,
    Briefcase,
    CalendarDays,
    CheckCircle,
    ClipboardList,
    FileText,
    CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitMessage as handleMessageSubmit } from "@/lib/actions";

type TicketDetailItem = {
    icon: React.ElementType;
    label: string;
    value: string;
    color?: string;
};

type TicketCard = {
    id: string;
    subject: string;
    type?: string;
    user?: string;
    company?: string;
    service?: string;
    analyst?: string;
    status?: string;
    date?: string;
};

/* ------------------------ helpers de extracción ------------------------ */

function htmlUnescape(s: string) {
    if (!s) return s;
    const el = document.createElement("textarea");
    el.innerHTML = s;
    return el.value;
}

/** Extrae SOLO tarjetas de creación/detalle: <card type="ticket_detail|ticket_created">{JSON}</card> */
function extractTicketCard(answer: string): TicketCard | null {
    if (!answer) return null;
    const text = htmlUnescape(answer);

    // Busca ticket_detail o ticket_created (no aceptamos cualquier <card>)
    const m =
        text.match(
            /<card\b[^>]*type\s*=\s*(['"])(ticket_detail|ticket_created)\1[^>]*>([\s\S]*?)<\/card>/i
        );

    if (!m) return null;
    const body = m[3];

    // Intento 1: parseo directo
    try {
        return JSON.parse(body);
    } catch (_) {
        // Intento 2: buscar el primer bloque {...}
        const j = body.match(/{[\s\S]*}/);
        if (!j) return null;
        try {
            return JSON.parse(j[0]);
        } catch {
            // Intento 3: normalizar comillas simples
            try {
                const fixed = j[0]
                    .replace(/(['"])?([a-zA-Z0-9_]+)\1\s*:/g, '"$2":')
                    .replace(/'/g, '"');
                return JSON.parse(fixed);
            } catch {
                return null;
            }
        }
    }
}

/** Elimina cualquier bloque <card>…</card> (para mostrar limpio en chat) */
function stripAnyCard(answer: string) {
    return htmlUnescape(answer).replace(/<card\b[^>]*>[\s\S]*?<\/card>/gi, "").trim();
}

/** Toma un asunto razonable desde los últimos mensajes del usuario (evita 'si/ok') */
function pickReasonableSubject(lastUserMessage: string, messages: Message[]): string {
    const CONFIRM = new Set([
        "si",
        "sí",
        "ok",
        "okay",
        "vale",
        "dale",
        "ya",
        "listo",
        "sip",
        "claro",
        "de acuerdo",
        "correcto",
    ]);

    // buscar desde el final el último mensaje de usuario no-confirmación
    for (let i = messages.length - 1; i >= 0; i--) {
        const m = messages[i];
        if (m.role === "user") {
            const t = (m.content || "").trim().toLowerCase();
            if (t && !CONFIRM.has(t) && t.length > 3) {
                return m.content;
            }
        }
    }
    return lastUserMessage || "Solicitud de soporte";
}

/* ------------------------ UI: card generado ------------------------ */

function GeneratedTicketCard({ ticket }: { ticket: TicketCard }) {
    const details: TicketDetailItem[] = [
        { icon: ClipboardList, label: "Tipo", value: ticket.type ?? "-" },
        { icon: User, label: "Usuario", value: ticket.user ?? "-" },
        { icon: Building2, label: "Empresa", value: ticket.company ?? "-" },
        { icon: Briefcase, label: "Servicio", value: ticket.service ?? "-" },
        { icon: UserCog, label: "Analista", value: ticket.analyst ?? "-" },
        { icon: CircleDot, label: "Estado", value: ticket.status ?? "Abierto" },
        { icon: CalendarDays, label: "Fecha", value: ticket.date ?? "-" },
    ];

    return (
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto my-8 animate-in fade-in-0 zoom-in-95 duration-500">
            <div className="text-center mb-6">
                <div className="inline-block bg-green-100 p-3 rounded-full mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Ticket de Soporte Generado</h2>
                <p className="text-gray-500 mt-1">Nuestro equipo lo revisará a la brevedad.</p>
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex items-start gap-3">
                    <TicketIcon className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                        <p className="text-xs text-gray-500">Ticket ID</p>
                        <p className="text-sm font-semibold text-purple-600">{ticket.id}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                        <p className="text-xs text-gray-500">Asunto</p>
                        <p className="text-sm font-medium text-gray-800">{ticket.subject}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t mt-4">
                    {details.map((item) => (
                        <div key={item.label} className="flex items-start gap-3">
                            <item.icon className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-500">{item.label}</p>
                                <p className={`text-sm font-medium ${item.color || "text-gray-800"}`}>
                                    {item.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ------------------------ Home page ------------------------ */

function HomePage({
                      onSubmitMessage,
                      isLoading,
                  }: {
    onSubmitMessage: (message: string) => void;
    isLoading: boolean;
}) {
    const [inputValue, setInputValue] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onSubmitMessage(inputValue.trim());
            setInputValue("");
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-88px)]">
            <div className="w-full max-w-4xl bg-white rounded-2xl p-12 text-center mx-auto shadow-xl">
                <div className="w-20 h-20 mx-auto mb-8 relative">
                    <img
                        src="https://i.ibb.co/S4CngF6F/new-analytics-logo.png"
                        alt="Analytics Logo"
                        className="w-full h-full object-contain"
                    />
                </div>
                <h1 className="text-3xl mb-6 leading-relaxed">
          <span className="bg-gradient-to-r from-[#3498DB] via-[#2980B9] to-[#1ABC9C] bg-clip-text text-transparent font-bold">
            ¡Hola! Soy el Asistente Virtual de Analytics.
          </span>
                </h1>
                <p className="text-gray-600 mb-12 text-lg leading-relaxed max-w-2xl mx-auto">
                    Estoy aquí para ayudarte a resolver una incidencia o a explorar el servicio perfecto para tu próximo proyecto. ¿Cómo te puedo ayudar hoy?
                </p>
                <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
                    <svg
                        className="h-5 w-5 text-gray-400 absolute left-6 top-1/2 transform -translate-y-1/2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"
                        />
                    </svg>
                    <input
                        type="text"
                        placeholder="Escribe tu pregunta..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isLoading}
                        className="w-full pl-14 pr-20 py-5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base shadow-sm"
                    />
                    <Button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        size="icon"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-lg transition-transform active:scale-95"
                    >
                        {isLoading ? (
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            <Send className="h-6 w-6" />
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}

/* ------------------------ Chat page ------------------------ */

export default function ChatPage() {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showHomePage, setShowHomePage] = useState(true);
    const [generatedTicket, setGeneratedTicket] = useState<TicketCard | null>(null);
    const [showNewChatButton, setShowNewChatButton] = useState(false);
    const [isChatLocked, setIsChatLocked] = useState(false);
    const [threadId, setThreadId] = useState<string | null>(null);

    const resetToHome = () => {
        setShowHomePage(true);
        setMessages([]);
        setGeneratedTicket(null);
        setShowNewChatButton(false);
        setIsChatLocked(false);
        setIsLoading(false);
        setThreadId(null);
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            (window as any).resetChatToHome = resetToHome;
        }
    }, []);

    const submitMessage = async (messageContent: string) => {
        if (!messageContent.trim() || isLoading) return;
        setShowHomePage(false);

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: messageContent,
        };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        // @ts-ignore
        const token = session?.backendAccessToken;
        if (!token) {
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content:
                        "Error de autenticación. No pude verificar tu sesión. Por favor, cierra sesión y vuelve a intentarlo.",
                },
            ]);
            setIsLoading(false);
            setIsChatLocked(true);
            return;
        }

        try {
            const response = await handleMessageSubmit(messageContent, threadId, token);
            setThreadId(response.thread_id);

            const raw = String(response.answer || "");
            
            // DEBUG - Para ver qué está enviando el backend
            console.log("=== RESPUESTA DEL BACKEND ===");
            console.log(raw);
            console.log("=============================");
            
            const card = extractTicketCard(raw);
            const assistantText = stripAnyCard(raw);

            // Mostrar el mensaje del asistente
            setMessages((prev) => [
                ...prev,
                { id: crypto.randomUUID(), role: "assistant", content: assistantText || raw },
            ]);

            // Si el backend mandó tarjeta real → mostrarla
            if (card) {
                setGeneratedTicket(card);
                setShowNewChatButton(true);
                setIsChatLocked(true);
                setIsLoading(false);
                return;
            }

            // Fallback mejorado: extraer datos del mensaje del bot
            const ticketPatterns = [
                /(he|se ha|ha sido)\s+(generado|creado|registrado)\s+(el\s+)?ticket/i,
                /ticket\s+#?\d+\s+(generado|creado|registrado)/i,
                /su\s+ticket\s+ha\s+sido/i,
                /nuevo\s+ticket.*#\d+/i
            ];

            const created = ticketPatterns.some(pattern => pattern.test(raw));

            if (created) {
                // Extraer ID del ticket
                const idMatch = 
                    raw.match(/ticket\s*#?\s*(\d+)/i) || 
                    raw.match(/\*\*#?\s*(\d+)\*\*/i) ||
                    raw.match(/ID:\s*#?(\d+)/i) ||
                    raw.match(/#(\d+)/);
                
                // Extraer otros datos del mensaje usando patrones
                let extractedData: TicketCard = {
                    id: idMatch?.[1] ? `#${idMatch[1]}` : "#000",
                    subject: "",
                    type: "",
                    user: "",
                    company: "",
                    service: "",
                    analyst: "",
                    status: "",
                    date: ""
                };

                // Extraer asunto (buscar después de "asunto:" o similar)
                const subjectMatch = raw.match(/asunto:\s*([^\n,]+)/i) || 
                                    raw.match(/solicitud:\s*([^\n,]+)/i) ||
                                    raw.match(/problema:\s*([^\n,]+)/i);
                if (subjectMatch?.[1]) {
                    extractedData.subject = subjectMatch[1].trim();
                } else {
                    // Si no se encuentra, usar el mensaje del usuario
                    extractedData.subject = pickReasonableSubject(messageContent, [...messages, userMessage]);
                }

                // Extraer tipo
                const typeMatch = raw.match(/tipo:\s*([^\n,]+)/i) || 
                                raw.match(/categoría:\s*([^\n,]+)/i);
                extractedData.type = typeMatch?.[1]?.trim() || "Incidencia";

                // Extraer servicio
                const serviceMatch = raw.match(/servicio:\s*([^\n,]+)/i) || 
                                    raw.match(/área:\s*([^\n,]+)/i) ||
                                    raw.match(/departamento:\s*([^\n,]+)/i);
                extractedData.service = serviceMatch?.[1]?.trim() || "Soporte General";

                // Extraer nivel/prioridad
                const levelMatch = raw.match(/nivel:\s*([^\n,]+)/i) || 
                                raw.match(/prioridad:\s*([^\n,]+)/i);
                const level = levelMatch?.[1]?.trim();

                // Extraer estado
                const statusMatch = raw.match(/estado:\s*([^\n,]+)/i);
                extractedData.status = statusMatch?.[1]?.trim() || "Abierto";

                // Extraer analista
                const analystMatch = raw.match(/analista:\s*([^\n,]+)/i) ||
                                    raw.match(/asignado a:\s*([^\n,]+)/i);
                extractedData.analyst = analystMatch?.[1]?.trim() || "Por asignar";

                // Usar datos del usuario de la sesión
                extractedData.user = session?.user?.name || "Usuario";
                extractedData.company = session?.user?.email?.split('@')[1]?.toUpperCase() || "UNMSM";
                
                // Fecha actual
                extractedData.date = new Date().toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                });

                setGeneratedTicket(extractedData);
                setShowNewChatButton(true);
                setIsChatLocked(true);
            }
        } catch (error) {
            console.error("Error devuelto por handleMessageSubmit:", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: "Lo siento, ha ocurrido un error inesperado al enviar el mensaje.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = async (formData: FormData) => {
        const content = formData.get("message") as string;
        await submitMessage(content);
    };

    if (showHomePage) {
        return <HomePage onSubmitMessage={submitMessage} isLoading={isLoading} />;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-88px)]">
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <ChatArea messages={messages} isLoading={isLoading} />
                {generatedTicket && <GeneratedTicketCard ticket={generatedTicket} />}
                {showNewChatButton && (
                    <div className="text-center my-8">
                        <div className="text-gray-600 text-sm mb-4 flex items-center justify-center gap-2 max-w-md mx-auto">
                            <div className="h-px bg-gray-200 flex-1"></div>
                            <span>¿Tienes otra solicitud?</span>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>
                        <Button onClick={resetToHome}>Iniciar un Nuevo Chat</Button>
                    </div>
                )}
            </div>

            <div className="flex-shrink-0 p-4 md:p-6 border-t bg-white relative">
                <div className="max-w-3xl mx-auto">
                    <ChatInput
                        onSubmit={handleFormSubmit}
                        isLoading={isLoading}
                        isDisabled={isChatLocked}
                    />
                </div>
            </div>
        </div>
    );
}