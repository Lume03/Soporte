"use client";

import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      'flex items-start gap-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500', 
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {!isUser && (
        <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-500 text-white">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[75%] rounded-2xl p-4 shadow-md',
          isUser
            ? 'bg-gradient-to-br from-blue-700 to-blue-500 text-white rounded-br-lg'
            : 'bg-gradient-to-br from-white to-gray-100 text-gray-800 rounded-bl-lg border border-gray-100'
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
      </div>
      {isUser && (
        <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
          <AvatarFallback className="bg-gray-200">
            <User className="h-5 w-5 text-gray-600" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

