"use client";

import { useState, useEffect } from 'react';
import type { Message, Ticket } from '@/lib/types';
import { ChatArea } from '@/components/chat/chat-area';
import { ChatInput } from '@/components/chat/chat-input';
import { FaqSection } from '@/components/chat/faq-section';
import { submitMessage as handleMessageSubmit } from '@/lib/actions';

export default function ChatPage({ addTicket }: { addTicket: (ticket: Omit<Ticket, 'id' | 'date' | 'status'>) => void; }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLocked, setIsChatLocked] = useState(false);

  const submitMessage = async (formData: FormData) => {
    const content = formData.get('message') as string;
    if (!content.trim()) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await handleMessageSubmit(content);
      
      // Detectar si es solo un saludo basado en el contenido
      const isJustGreeting = response.answer.toLowerCase().includes('¡hola!') && 
                            response.answer.toLowerCase().includes('¿en qué puedo ayudarte') &&
                            response.answered === true;
      
      const assistantMessage: Message = { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: response.answer,
        answered: response.answered,
        subject: response.subject,
        body: response.body,
        // NO mostrar feedback si es solo un saludo o si es escalación a soporte
        showFeedback: response.answered === true && !isJustGreeting,
        // Mostrar botón de contactar soporte si no pudo responder
        showContactSupport: response.answered === false
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Si el bot no pudo responder (answered === false), bloquear el chat automáticamente
      if (response.answered === false) {
        setTimeout(() => {
          setIsChatLocked(true);
        }, 500);
      }
      
    } catch (error) {
      const errorMessage: Message = { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: "Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.", 
        answered: false,
        showContactSupport: true
      };
      setMessages(prev => [...prev, errorMessage]);
      // También bloquear en caso de error
      setTimeout(() => {
        setIsChatLocked(true);
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFaqClick = async (question: string, answer: string) => {
    // El usuario escribe la pregunta (sin el "Hola!")
    const userMessage: Message = { 
      id: crypto.randomUUID(), 
      role: 'user', 
      content: question
    };
    
    // El bot responde con la respuesta directa
    const assistantMessage: Message = { 
      id: crypto.randomUUID(), 
      role: 'assistant', 
      content: answer,
      answered: true,
      showFeedback: true // Mostrar botones de feedback porque es una respuesta FAQ
    };
    
    // Actualizar los mensajes para iniciar el chat
    setMessages([userMessage, assistantMessage]);
  };
  
  const handleFeedback = (messageId: string, isPositive: boolean) => {
    // Primero, mostrar el mensaje del usuario simulando que escribió su respuesta
    const userFeedbackMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: isPositive ? 'Sí, solucionado' : 'No, quisiera hablar con soporte.'
    };
    
    setMessages(prev => [...prev, userFeedbackMessage]);
    
    // Luego, mostrar la respuesta del bot
    setTimeout(() => {
      if (isPositive) {
        // Feedback positivo - mensaje final y bloquear chat
        const thankYouMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '¡Perfecto! Me alegra haber sido de ayuda.\n\nEsta consulta ha sido marcada como resuelta. Si necesitas asistencia con otro tema, no dudes en seleccionar el botón de una nueva solicitud. ¡Que tengas un excelente día!',
          answered: true
        };
        setMessages(prev => [...prev, thankYouMessage]);
        setIsChatLocked(true); // Bloquear el chat
      } else {
        // Feedback negativo - ofrecer contacto con soporte y bloquear chat
        const supportMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Comprendo. Lamento que tu problema aún no esté resuelto. Para darte la atención personalizada que necesitas, haz click en el siguiente botón para continuar.',
          answered: false,
          showContactSupport: true
        };
        setMessages(prev => [...prev, supportMessage]);
        setIsChatLocked(true); // Bloquear el chat
      }
    }, 500); // Pequeño delay para simular escritura
    
    // Marcar el mensaje original como que ya recibió feedback
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, feedbackReceived: true, showFeedback: false } 
        : msg
    ));
  };

  return (
    <main className="flex-1 flex flex-col h-full max-h-[calc(100vh-4rem)] bg-[#F1F4F8]">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {messages.length === 0 ? (
                <FaqSection onFaqClick={handleFaqClick} />
            ) : (
                <ChatArea messages={messages} addTicket={addTicket} onFeedback={handleFeedback} />
            )}
        </div>
        <div className="p-4 md:p-6 border-t bg-white relative">
            <ChatInput 
              onSubmit={submitMessage} 
              isLoading={isLoading} 
              isDisabled={isChatLocked}
            />
            {isChatLocked && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <span className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border shadow-sm">
                  Esta conversación ha finalizado
                </span>
              </div>
            )}
        </div>
    </main>
  );
}

