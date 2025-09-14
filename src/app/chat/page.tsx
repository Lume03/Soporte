"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from 'react';
import type { Message } from '@/lib/types';
import { ChatArea } from '@/components/chat/chat-area';
import { ChatInput } from '@/components/chat/chat-input';
import { Bot, Send, Ticket as TicketIcon, User, Building2, UserCog, Briefcase, CalendarDays, CheckCircle, ClipboardList, FileText, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { submitMessage as handleMessageSubmit } from '@/lib/actions';

type TicketDetailItem = {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: string;
};

function GeneratedTicketCard({ ticket }: { ticket: any }) {
  const details: TicketDetailItem[] = [
    { icon: ClipboardList, label: 'Tipo', value: ticket.type },
    { icon: User, label: 'Usuario', value: ticket.user },
    { icon: Building2, label: 'Empresa', value: ticket.company },
    { icon: Briefcase, label: 'Servicio', value: ticket.service },
    { icon: UserCog, label: 'Analista', value: ticket.analyst },
    { icon: CircleDot, label: 'Estado', value: ticket.status },
    { icon: CalendarDays, label: 'Fecha', value: ticket.date },
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
            {details.map(item => (
                <div key={item.label} className="flex items-start gap-3">
                  <item.icon className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className={`text-sm font-medium ${item.color || 'text-gray-800'}`}>{item.value}</p>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
  );
}

function HomePage({ onSubmitMessage, isLoading }: { onSubmitMessage: (message: string) => void; isLoading: boolean; }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmitMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
      <div className="flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-88px)]">
        <div className="w-full max-w-4xl bg-white rounded-2xl p-12 text-center mx-auto shadow-xl">
          <div className="w-20 h-20 mx-auto mb-8 relative">
            <img src="https://i.ibb.co/S4CngF6F/new-analytics-logo.png" alt="Analytics Logo" className="w-full h-full object-contain" />
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
            <svg className="h-5 w-5 text-gray-400 absolute left-6 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
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
              {isLoading
                  ? <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  : <Send className="h-6 w-6" />}
            </Button>
          </form>
        </div>
      </div>
  );
}

// 🧩 Helper: construye un objeto ticket a partir del texto de respuesta
function buildTicketFromAnswer(answerText: string, subject: string, session: any) {
  // Captura "ticket **#14**" o "ticket #14" o "ticket 14"
  const m = answerText.match(/ticket[^0-9]*([0-9]+)/i);
  const idNum = m?.[1];

  const userName = session?.user?.name ?? '-';
  const company = (session?.user?.email?.split('@')?.[1] || '')
      .replace(/\..*$/, '')
      .toUpperCase() || '-';

  return {
    id: idNum ? `#${idNum}` : '-',
    type: 'Incidencia',
    user: userName,
    company,
    analyst: 'Soporte',      // si quieres, cámbialo al nombre real
    subject,
    service: 'DATA SCIENCE', // o el servicio que definas
    status: 'Abierto',
    date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
  };
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHomePage, setShowHomePage] = useState(true);
  const [generatedTicket, setGeneratedTicket] = useState<any>(null);
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
    if (typeof window !== 'undefined') {
      (window as any).resetChatToHome = resetToHome;
    }
  }, []);

  const submitMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;
    setShowHomePage(false);

    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // @ts-ignore
    const token = session?.backendAccessToken;
    if (!token) {
      console.error("Error de autenticación: No se encontró el token del backend en la sesión.");
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "Error de autenticación. No pude verificar tu sesión. Por favor, cierra sesión y vuelve a intentarlo."
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      setIsChatLocked(true);
      return;
    }

    try {
      const response = await handleMessageSubmit(messageContent, threadId, token);
      setThreadId(response.thread_id);

      const assistantMessage: Message = { id: crypto.randomUUID(), role: 'assistant', content: response.answer };
      setMessages(prev => [...prev, assistantMessage]);

      // ✅ Si el backend indica que se creó ticket, bloquea input y muestra botón + tarjeta
      if (response.showContactSupport) {
        setIsChatLocked(true);
        setShowNewChatButton(true);
        setGeneratedTicket(buildTicketFromAnswer(response.answer, messageContent, session));
        return;
      }

      // Si el bot no pudo responder (fallback), generamos ticket dummy
      if (response.answered === false) {
        setTimeout(() => generateTicket(messageContent), 1000);
      }
    } catch (error) {
      console.error("Error devuelto por handleMessageSubmit:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "Lo siento, ha ocurrido un error. Voy a generar un ticket para que nuestro equipo te ayude."
      };
      setMessages(prev => [...prev, errorMessage]);
      setTimeout(() => generateTicket(messageContent), 1000);
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback local (cuando answered === false o hubo error)
  const generateTicket = (userQuery: string) => {
    const ticket = {
      id: `TCK-2025-${String(Math.floor(Math.random() * 90000) + 10000).padStart(5, '0')}`,
      type: 'Incidencia',
      user: '—',
      company: '—',
      analyst: 'Soporte',
      subject: userQuery,
      service: 'Data Science',
      status: 'Abierto',
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };
    setGeneratedTicket(ticket);
    setShowNewChatButton(true);
    setIsChatLocked(true);
  };

  const handleFormSubmit = async (formData: FormData) => {
    const content = formData.get('message') as string;
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
            {/* 👇 el input se desactiva cuando isChatLocked = true */}
            <ChatInput onSubmit={handleFormSubmit} isLoading={isLoading} isDisabled={isChatLocked} />
          </div>
        </div>
      </div>
  );
}
