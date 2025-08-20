"use client";

import { useState } from 'react';
import type { Message, Ticket } from '@/lib/types';
import { ChatArea } from '@/components/chat/chat-area';
import { ChatInput } from '@/components/chat/chat-input';
import { FaqSection } from '@/components/chat/faq-section';
import { submitMessage as handleMessageSubmit } from '@/lib/actions';

export default function ChatPage({ addTicket }: { addTicket: (ticket: Omit<Ticket, 'id' | 'date' | 'status'>) => void; }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
        showFeedback: response.answered === true && !isJustGreeting
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: "Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.", 
        answered: false 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFaqClick = async (question: string, answer: string) => {
    // El usuario "escribe" la pregunta con un saludo
    const userMessage: Message = { 
      id: crypto.randomUUID(), 
      role: 'user', 
      content: `¡Hola! ${question}`
    };
    
    // El bot responde con saludo y la respuesta
    const assistantMessage: Message = { 
      id: crypto.randomUUID(), 
      role: 'assistant', 
      content: `¡Hola! ${answer}`,
      answered: true,
      showFeedback: true // Mostrar botones de feedback porque es una respuesta FAQ
    };
    
    // Actualizar los mensajes para iniciar el chat
    setMessages([userMessage, assistantMessage]);
  };
  
  const handleFeedback = (messageId: string, isPositive: boolean) => {
    if (isPositive) {
      // Feedback positivo
      const thankYouMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '¡Excelente! Me alegra haberte ayudado. 😊\n\nSi tienes alguna otra consulta, abre un nuevo chat en el botón de "+ Nueva Solicitud".',
        answered: true
      };
      setMessages(prev => [...prev, thankYouMessage]);
    } else {
      // Feedback negativo - ofrecer más ayuda
      const followUpMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Entendido. Lamento que el problema continúe. Para poder ayudarte mejor, por favor describe con más detalle cuál es el problema específico que estás teniendo, y trataré de darte una solución más precisa.',
        answered: true
      };
      setMessages(prev => [...prev, followUpMessage]);
    }
    
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
        <div className="p-4 md:p-6 border-t bg-white">
            <ChatInput onSubmit={submitMessage} isLoading={isLoading} />
        </div>
    </main>
  );
}
