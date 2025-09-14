"use client";

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useParams } from 'next/navigation';
import { getAnalystTicketDetail } from '@/lib/actions';
import { Bot, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AnalystHeader } from '@/components/analyst/analyst-header';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 transition-shadow hover:shadow-sm">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-semibold text-gray-800 break-words">{value}</p>
      </div>
  );
}

export default function TicketDetailPage() {
  const { data: session } = useSession();
  const token = (session as any)?.backendAccessToken as string | undefined;

  // ✅ Obtener el id desde el hook (no por props)
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [ticket, setTicket] = useState<{
    id_ticket: number;
    subject: string;
    type?: string;
    user?: string;
    company?: string;
    service?: string;
    email?: string;
    date?: string;
    status?: string;
  } | null>(null);

  const [conversation, setConversation] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!token || !id) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAnalystTicketDetail(id, token);
        // Backend: {role:'user'|'agent'} → UI: {role:'user'|'assistant'}
        const conv: ChatMessage[] = (data.conversation || []).map((m: any) => ({
          role: m.role === 'agent' ? 'assistant' : 'user',
          content: m.content,
        }));

        setConversation(conv);
        setTicket({
          id_ticket: data.id_ticket,
          subject: data.subject,
          type: data.type,
          user: data.user,
          company: data.company,
          service: data.service,
          email: data.email,
          date: data.date,
          status: data.status,
        });
      } catch (e: any) {
        console.error(e);
        setError(e?.message || 'Error al cargar el ticket');
      } finally {
        setLoading(false);
      }
    })();
  }, [token, id]); // ✅ dependemos de id (string), no de params

  if (loading) {
    return (
        <div className="min-h-screen bg-[#F7FAFC]">
          <AnalystHeader />
          <main className="p-8">
            <div className="max-w-7xl mx-auto text-gray-600">Cargando...</div>
          </main>
        </div>
    );
  }

  if (error || !ticket) {
    return (
        <div className="min-h-screen bg-[#F7FAFC]">
          <AnalystHeader />
          <main className="p-8">
            <div className="max-w-7xl mx-auto text-red-600">Error: {error || 'No se encontró el ticket'}</div>
          </main>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-[#F7FAFC]">
        <AnalystHeader />
        <main className="p-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

            {/* Columna izquierda: detalles del ticket */}
            <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col">
              <div className="flex-grow">
                <Link href="/analyst/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Volver a la lista de tickets
                </Link>
                <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">{ticket.subject}</h2>
                <p className="text-sm text-blue-600 font-medium mb-8">{ticket.id_ticket}</p>

                <h3 className="text-sm font-semibold text-gray-500 mb-3 border-b pb-2">Detalles del Ticket</h3>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <DetailCard label="Tipo" value={ticket.type || '-'} />
                  <DetailCard label="Usuario" value={ticket.user || '-'} />
                  <DetailCard label="Empresa" value={ticket.company || '-'} />
                  <DetailCard label="Servicio" value={ticket.service || '-'} />
                  <div className="col-span-2">
                    <DetailCard label="Correo" value={ticket.email || '-'} />
                  </div>
                  <DetailCard label="Fecha" value={ticket.date || '-'} />
                </div>

                {/* Gestión del Ticket (sin backend aún) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3 border-b pb-2">Gestión del Ticket</h3>
                </div>
              </div>

              <div className="mt-auto pt-4">
                <button
                    type="button"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-semibold shadow-md hover:shadow-lg"
                >
                  Guardar
                </button>
              </div>
            </div>

            {/* Columna derecha: conversación */}
            <div className="lg:col-span-8 bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-3">Conversación</h3>
              <div className="space-y-6">
                {conversation.map((message, index) => (
                    <div
                        key={index}
                        className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role !== 'user' && (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-inner">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                      )}
                      <div
                          className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                              message.role === 'user'
                                  ? 'bg-gradient-to-br from-blue-700 to-blue-500 text-white rounded-br-lg'
                                  : 'bg-gray-100 text-gray-800 rounded-bl-lg'
                          }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                      {message.role === 'user' && (
                          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                      )}
                    </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
  );
}
