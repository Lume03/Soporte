"use client";

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot } from 'lucide-react';

export function ChatTypingIndicator() {
  return (
    <div className="flex items-start gap-4 animate-in fade-in-0 duration-500">
      <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-500 text-white">
          <Bot className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[75%] rounded-2xl p-4 shadow-md bg-gradient-to-br from-white to-gray-100 border border-gray-100 rounded-bl-lg">
        <div className="flex items-center justify-center gap-1.5 h-5">
            <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
        </div>
      </div>
    </div>
  );
}