"use client";

import type { Message, Ticket } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Bot, Mail, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ChatMessage({ 
  message, 
  addTicket,
  onFeedback 
}: { 
  message: Message, 
  addTicket: (ticket: Omit<Ticket, 'id' | 'date' | 'status'>) => void;
  onFeedback?: (messageId: string, isPositive: boolean) => void;
}) {
  const isUser = message.role === 'user';

  const mailtoHref = `mailto:luquealonso151@gmail.com?subject=${encodeURIComponent(message.subject || 'Consulta de Soporte')}&body=${encodeURIComponent(message.body || 'Hola, necesito ayuda con lo siguiente:\n\n')}`;

  return (
    <div className={cn(
      'flex items-start gap-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500', 
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {!isUser && (
        <Avatar className="h-8 w-8 border border-gray-200 bg-white">
          <AvatarFallback className="bg-[#4285f4] text-white">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[75%] rounded-lg p-3 shadow-sm',
          isUser
            ? 'bg-[#4285f4] text-white'
            : 'bg-white border border-gray-200'
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        
        {/* Botones de Feedback - Solo si showFeedback es true */}
        {!isUser && message.showFeedback && onFeedback && !message.feedbackReceived && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-3">¿Esta información resolvió tu duda?</p>
            <div className="flex gap-2">
              <Button
                onClick={() => onFeedback(message.id, true)}
                variant="outline"
                size="sm"
                className="flex-1 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
              >
                <ThumbsUp className="mr-1.5 h-4 w-4" />
                Sí, solucionado
              </Button>
              <Button
                onClick={() => onFeedback(message.id, false)}
                variant="outline"
                size="sm"
                className="flex-1 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              >
                <ThumbsDown className="mr-1.5 h-4 w-4" />
                No, aún tengo problemas
              </Button>
            </div>
          </div>
        )}
        
        {/* Botón de contactar soporte - Solo si answered es false */}
        {!isUser && message.answered === false && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Button asChild variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
              <a href={mailtoHref}>
                <Mail className="mr-1.5 h-3 w-3" />
                Contactar a Soporte
              </a>
            </Button>
          </div>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 border border-gray-200 bg-white">
          <AvatarFallback className="bg-gray-100">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
