import type { Message, Ticket } from '@/lib/types';
import { ChatMessage } from './chat-message';

export function ChatArea({ messages, addTicket }: { messages: Message[], addTicket: (ticket: Omit<Ticket, 'id' | 'date' | 'status'>) => void; }) {
  return (
    <div className="space-y-6 max-w-3xl mx-auto w-full">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} addTicket={addTicket} />
      ))}
    </div>
  );
}
