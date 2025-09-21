"use client";

import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
          'max-w-[75%] rounded-2xl p-4 shadow-md overflow-hidden',
          isUser
            ? 'bg-gradient-to-br from-blue-700 to-blue-500 text-white rounded-br-lg'
            : 'bg-gradient-to-br from-white to-gray-100 text-gray-800 rounded-bl-lg border border-gray-100'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
        ) : (
          <div className="markdown-content">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // Tabla optimizada para verse completa
                table: ({ children, ...props }) => (
                  <div className="my-3 -mx-2">
                    <table className="w-full border-collapse text-xs" {...props}>
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children, ...props }) => (
                  <thead className="bg-blue-50/70 sticky top-0" {...props}>
                    {children}
                  </thead>
                ),
                tbody: ({ children, ...props }) => (
                  <tbody className="divide-y divide-gray-200" {...props}>
                    {children}
                  </tbody>
                ),
                tr: ({ children, ...props }) => (
                  <tr className="hover:bg-gray-50/50 transition-colors" {...props}>
                    {children}
                  </tr>
                ),
                th: ({ children, ...props }) => {
                  // Determinar el ancho de columna basado en el contenido
                  const content = String(children);
                  let className = "px-2 py-1.5 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider border border-gray-300 bg-blue-50/70";
                  
                  // Ajustar anchos según el encabezado
                  if (content?.toLowerCase().includes('id')) {
                    className += " w-[60px] max-w-[60px]";
                  } else if (content?.toLowerCase().includes('asunto')) {
                    className += " min-w-[180px]";
                  } else if (content?.toLowerCase().includes('estado')) {
                    className += " w-[75px]";
                  } else if (content?.toLowerCase().includes('nivel')) {
                    className += " w-[60px]";
                  } else if (content?.toLowerCase().includes('tipo')) {
                    className += " w-[80px]";
                  } else if (content?.toLowerCase().includes('servicio')) {
                    className += " w-[80px]";
                  }
                  
                  return (
                    <th className={className} {...props}>
                      {children}
                    </th>
                  );
                },
                td: ({ children, ...props }) => {
                  // Contenido de la celda
                  const content = String(children);
                  let className = "px-2 py-1.5 text-[11px] text-gray-700 border border-gray-200";
                  
                  // Si parece ser un ID (número corto o #número)
                  if (content && (content.match(/^#?\d{1,4}$/) || content.length < 5)) {
                    className += " text-center font-medium";
                  }
                  // Si es un estado
                  else if (['Aceptado', 'Pendiente', 'En proceso', 'Resuelto', 'Cerrado'].includes(content)) {
                    className += " text-center";
                    if (content === 'Aceptado') className += " text-green-600 font-medium";
                    else if (content === 'Pendiente') className += " text-yellow-600 font-medium";
                    else if (content === 'En proceso') className += " text-blue-600 font-medium";
                  }
                  // Si es un nivel
                  else if (['Bajo', 'Medio', 'Alto', 'Crítico'].includes(content)) {
                    className += " text-center";
                    if (content === 'Bajo') className += " text-gray-500";
                    else if (content === 'Medio') className += " text-yellow-600";
                    else if (content === 'Alto') className += " text-orange-600";
                    else if (content === 'Crítico') className += " text-red-600 font-semibold";
                  }
                  // Para el asunto o textos largos
                  else {
                    className += " break-words";
                  }
                  
                  return (
                    <td className={className} style={{ wordBreak: 'break-word' }} {...props}>
                      {children}
                    </td>
                  );
                },
                // Otros elementos markdown
                p: ({ children, ...props }) => (
                  <p className="mb-2 last:mb-0 leading-relaxed text-sm" {...props}>
                    {children}
                  </p>
                ),
                ul: ({ children, ...props }) => (
                  <ul className="list-disc list-inside mb-2 text-sm space-y-1" {...props}>
                    {children}
                  </ul>
                ),
                ol: ({ children, ...props }) => (
                  <ol className="list-decimal list-inside mb-2 text-sm space-y-1" {...props}>
                    {children}
                  </ol>
                ),
                li: ({ children, ...props }) => (
                  <li className="text-sm" {...props}>
                    {children}
                  </li>
                ),
                h1: ({ children, ...props }) => (
                  <h1 className="text-lg font-bold mb-2 text-gray-900" {...props}>
                    {children}
                  </h1>
                ),
                h2: ({ children, ...props }) => (
                  <h2 className="text-base font-semibold mb-2 text-gray-800" {...props}>
                    {children}
                  </h2>
                ),
                h3: ({ children, ...props }) => (
                  <h3 className="text-sm font-semibold mb-1 text-gray-700" {...props}>
                    {children}
                  </h3>
                ),
                strong: ({ children, ...props }) => (
                  <strong className="font-semibold text-gray-900" {...props}>
                    {children}
                  </strong>
                ),
                em: ({ children, ...props }) => (
                  <em className="italic" {...props}>
                    {children}
                  </em>
                ),
                code: ({ children, ...props }) => (
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                    {children}
                  </code>
                ),
                pre: ({ children, ...props }) => (
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto mb-2 text-xs" {...props}>
                    {children}
                  </pre>
                ),
                blockquote: ({ children, ...props }) => (
                  <blockquote className="border-l-4 border-blue-400 pl-3 my-2 italic text-gray-600" {...props}>
                    {children}
                  </blockquote>
                ),
                hr: () => (
                  <hr className="my-3 border-gray-200" />
                ),
                a: ({ children, href, ...props }) => (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 underline"
                    {...props}
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
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

