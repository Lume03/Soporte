import type { Message } from '@/lib/types';
import { ChatMessage } from './chat-message';
import { ChatTypingIndicator } from './chat-typing-indicator'; // Importamos el nuevo componente

export function ChatArea({ 
  messages, 
  isLoading 
}: { 
  messages: Message[], 
  isLoading: boolean  // Añadimos la prop isLoading
}) {
  return (
    <div className="space-y-6 max-w-3xl mx-auto w-full">
      {messages.map((message) => (
        <ChatMessage 
          key={message.id} 
          message={message} 
        />
      ))}
      {/* Si está cargando, mostramos la animación */}
      {isLoading && <ChatTypingIndicator />}
    </div>
  );
}

