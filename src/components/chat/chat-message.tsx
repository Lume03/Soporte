"use client";

import type { Message, Ticket } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Bot, Ticket as TicketIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateTicketDialog } from '@/components/tickets/create-ticket-dialog';

export function ChatMessage({ message, addTicket }: { message: Message, addTicket: (ticket: Omit<Ticket, 'id' | 'date' | 'status'>) => void; }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex items-start gap-4', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <Avatar className="h-8 w-8 border">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[75%] rounded-lg p-3 shadow-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-card border'
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        {!isUser && !message.content.startsWith("Lo siento") && (
          <div className="mt-3 pt-3 border-t border-t-border">
             <CreateTicketDialog 
                initialQuestion={message.content}
                onTicketCreated={addTicket}
             >
                <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
                    <TicketIcon className="mr-1.5 h-3 w-3" />
                    ¿Aún necesitas ayuda? Crear solicitud
                </Button>
            </CreateTicketDialog>
          </div>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 border">
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
