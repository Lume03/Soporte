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
      const assistantMessage: Message = { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: response.answer,
        answered: response.answered,
        subject: response.subject,
        body: response.body,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = { id: crypto.randomUUID(), role: 'assistant', content: "Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.", answered: false };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFaqClick = (question: string, answer: string) => {
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: question };
    const assistantMessage: Message = { id: crypto.randomUUID(), role: 'assistant', content: answer, answered: true };
    setMessages(prev => [...prev, userMessage, assistantMessage]);
  };

  return (
    <main className="flex-1 flex flex-col h-full max-h-[calc(100vh-4rem)]">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {messages.length === 0 ? (
                <FaqSection onFaqClick={handleFaqClick} />
            ) : (
                <ChatArea messages={messages} addTicket={addTicket} />
            )}
        </div>
        <div className="p-4 md:p-6 border-t bg-card/80 backdrop-blur-sm">
            <ChatInput onSubmit={submitMessage} isLoading={isLoading} />
        </div>
    </main>
  );
}
