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
    AlertCircle,
    Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitMessage as handleMessageSubmit } from "@/lib/actions";

// Estructura del ticket (solo para la detección)
type TicketCard = {
    id: string;
    subject: string;
    type?: string;
    user?: string;
    company?: string;
    service?: string;
    level?: string;
    status?: string;
    date?: string;
    responseTime?: string;
};

/* ------------------------ helpers de extracción ------------------------ */

function htmlUnescape(s: string) {
    if (!s) return s;
    const el = document.createElement("textarea");
    el.innerHTML = s;
    return el.value;
}

/** * Parsea la tabla Markdown del backend y extrae los datos del ticket
 * Esta versión es más robusta: lee las cabeceras para encontrar los datos,
 * sin importar el orden o la cantidad de columnas.
 */
function parseTicketFromMarkdownTable(text: string): TicketCard | null {
    try {
        const lines = text.split('\n');
        let headerLine: string | null = null;
        let dataLine: string | null = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.includes('| ID') && line.includes('| Asunto')) {
                headerLine = line;
                // Asumir que la línea de datos es la que sigue al separador '---'
                if (lines[i + 1] && lines[i + 1].includes('---')) {
                    dataLine = lines[i + 2];
                }
                break;
            }
        }

        if (!headerLine || !dataLine) {
            console.log("No se encontró cabecera o línea de datos en la tabla.");
            return null;
        }

        // Mapear cabeceras a sus índices
        const headers = headerLine.split('|').map(h => h.trim().toLowerCase().replace(/ /g, '_').replace('ó', 'o')); // normalizar cabeceras
        const cells = dataLine.split('|').map(c => c.trim());
        
        // Corregir el índice si hay una celda vacía al principio
        const headerStartIndex = headers.indexOf('id') !== -1 ? headers.indexOf('id') : 1;
        const cellStartIndex = cells[0] === '' ? 1 : 0;

        const data: { [key: string]: string } = {};
        headers.slice(headerStartIndex).forEach((header, index) => {
            if (header) {
                data[header] = cells[index + cellStartIndex];
            }
        });

        // Construir el ticket con los datos encontrados
        const ticket: TicketCard = {
            id: data['id'] || "#000",
            subject: data['asunto'] || "Solicitud de soporte",
            type: data['tipo'] || "Incidencia",
            user: data['usuario'] || "-",
            company: data['empresa'] || "-",
            service: data['servicio'] || "-",
            level: data['nivel'] || "Medio",
            status: data['estado'] || "Abierto",
            date: data['fecha_de_creacion'] || data['fecha'] || new Date().toLocaleDateString("es-ES"),
            responseTime: data['tiempo_de_respuesta'] || "24 horas"
        };
        
        console.log("Ticket parseado:", ticket);
        return ticket;

    } catch (error) {
        console.error("Error parseando tabla de ticket:", error);
        return null;
    }
}


/** * Verifica si el mensaje del bot indica que se creó un ticket.
 * Devuelve un objeto Ticket si se detecta, o null si no.
 */
function extractTicketCard(answer: string): TicketCard | null {
    if (!answer) return null;
    const text = htmlUnescape(answer);

    // Método 1: Buscar formato <card type="ticket_created">
    const cardMatch = text.match(
        /<card\b[^>]*type\s*=\s*(['"])(ticket_detail|ticket_created)\1[^>]*>([\s\S]*?)<\/card>/i
    );

    if (cardMatch) {
        try {
            const body = cardMatch[3];
            const data = JSON.parse(body);
            console.log("Ticket extraído de <card> JSON:", data);
            return { id: data.id || "card-ticket", subject: data.subject || "Ticket" }; // Devolver algo simple
        } catch (e) {
            console.error("Error parseando card JSON:", e);
        }
    }

    // Método 2: DETECCIÓN MEJORADA - Más flexible con el lenguaje del agente
    const creationPatterns = [
        /he\s+(generado|creado|registrado)\s+(el\s+)?ticket/i,
        /ticket.*ha\s+sido\s+(generado|creado|registrado)/i,
        /se\s+ha\s+(generado|creado|registrado).+ticket/i,
        /ticket\s+#?\d+.*(generado|creado|registrado)/i,
        /generad[oa]\s+exitosamente/i,
        /cread[oa]\s+exitosamente/i,
        /su\s+solicitud\s+ha\s+sido\s+registrada/i,
        /he\s+procedido\s+a\s+generar/i
    ];
    
    const isCreation = creationPatterns.some(pattern => pattern.test(text));
    const hasTable = text.includes('| ID') && text.includes('| Asunto');
    
    if (isCreation && hasTable) {
        console.log("Ticket CREADO detectado con tabla, parseando...");
        return parseTicketFromMarkdownTable(text); // Devuelve el ticket para confirmar la creación
    }

    if (isCreation) {
        console.log("Ticket mencionado pero sin datos completos");
        return { id: "unknown", subject: "Ticket" }; // Devolver algo simple para bloquear el chat
    }

    return null;
}

// --- SE ELIMINARON LAS FUNCIONES 'stripTicketData' y 'GeneratedTicketCard' ---

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
    // const [generatedTicket, setGeneratedTicket] = useState<TicketCard | null>(null); // <-- ELIMINADO
    const [showNewChatButton, setShowNewChatButton] = useState(false);
    const [isChatLocked, setIsChatLocked] = useState(false);
    const [threadId, setThreadId] = useState<string | null>(null);

    const resetToHome = () => {
        setShowHomePage(true);
        setMessages([]);
        // setGeneratedTicket(null); // <-- ELIMINADO
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
                    content: "Error de autenticación. No pude verificar tu sesión. Por favor, cierra sesión y vuelve a intentarlo.",
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
            
            console.log("=== RESPUESTA COMPLETA DEL BACKEND ===");
            console.log(raw);
            console.log("=====================================");
            
            // --- LÓGICA SIMPLIFICADA ---

            // 1. Quitar <card> (que ya no usamos) pero dejar todo lo demás (incluida la tabla)
            const assistantText = htmlUnescape(raw)
                .replace(/<card\b[^>]*>[\s\S]*?<\/card>/gi, "")
                .trim() || raw;

            // 2. Mostrar el mensaje del asistente (CON tabla)
            setMessages((prev) => [
                ...prev,
                { 
                    id: crypto.randomUUID(), 
                    role: "assistant", 
                    content: assistantText 
                },
            ]);

            // 3. Detectar si fue una creación de ticket
            const ticketWasCreated = extractTicketCard(raw);

            if (ticketWasCreated) {
                // SÍ se creó un ticket, así que bloqueamos el chat
                console.log("=== TICKET CREADO - Bloqueando chat ===");
                setShowNewChatButton(true);
                setIsChatLocked(true);
            }
            // --- FIN LÓGICA SIMPLIFICADA ---

        } catch (error) {
            console.error("Error en submitMessage:", error);
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
                
                {/* --- SE ELIMINÓ LA LÍNEA DE 'generatedTicket' --- */}
                
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