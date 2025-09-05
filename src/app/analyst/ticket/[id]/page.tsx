import { Bot, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AnalystHeader } from '@/components/analyst/analyst-header';

// --- TIPOS DE DATOS ---
type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

// --- DATOS (DEFINIDOS FUERA DEL COMPONENTE) ---
const ticketDetails = {
  id: 'TCK-2025-00913',
  subject: 'Dashboard de proyecciones de riesgo no actualiza datos desde el 03/09',
  type: 'Incidencia',
  user: 'Ana González',
  company: 'Scotiabank',
  service: 'Data Science',
  email: 'ana.gonzales@example.com',
  date: '04/09/2025',
  status: 'Abierto',
};

const conversation: ChatMessage[] = [
    { role: 'user', content: 'Hola, el dashboard de proyecciones de riesgo no está actualizando los datos desde anoche.' },
    { role: 'assistant', content: '¡Hola, Ana! Gracias por tu mensaje. Entiendo que estás reportando una incidencia con el dashboard de proyecciones de riesgo que no actualiza correctamente.' },
    { role: 'assistant', content: 'Confirmo que esto parece estar relacionado con nuestro servicio de Data Science. ¿Es correcto?' },
    { role: 'user', content: 'Sí, es correcto.' },
    { role: 'assistant', content: 'Gracias por confirmarlo. Para dar toda la información posible al equipo, ¿has notado algún mensaje de error específico en el dashboard o simplemente los datos no son los de hoy?' },
    { role: 'user', content: 'No hay mensajes de error, la última fecha de actualización que figura es de ayer, 3 de Septiembre.'},
    { role: 'assistant', content: 'Entendido. La falta de actualización de datos en un dashboard de riesgo es un asunto prioritario. No te preocupes, no necesitas hacer nada más. Voy a generar inmediatamente un ticket de soporte para que nuestro equipo de Data Science lo investigue a la brevedad.'},
];

// --- COMPONENTE AUXILIAR (CORREGIDO Y COMPLETO) ---
function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 transition-shadow hover:shadow-sm">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-800 break-words">{value}</p>
    </div>
  );
}

// --- PÁGINA PRINCIPAL ---
export default function TicketDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <AnalystHeader />
      <main className="p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col">
            <div className="flex-grow">
              <Link href="/analyst/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Volver a la lista de tickets
              </Link>
              <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">{ticketDetails.subject}</h2>
              <p className="text-sm text-blue-600 font-medium mb-8">{ticketDetails.id}</p>

              <h3 className="text-sm font-semibold text-gray-500 mb-3 border-b pb-2">Detalles del Ticket</h3>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <DetailCard label="Tipo" value={ticketDetails.type} />
                <DetailCard label="Usuario" value={ticketDetails.user} />
                <DetailCard label="Empresa" value={ticketDetails.company} />
                <DetailCard label="Servicio" value={ticketDetails.service} />
                <div className="col-span-2">
                  <DetailCard label="Correo" value={ticketDetails.email} />
                </div>
                <DetailCard label="Fecha" value={ticketDetails.date} />
              </div>

              <div> 
                <h3 className="text-sm font-semibold text-gray-500 mb-3 border-b pb-2">Gestión del Ticket</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">ESTADO</label>
                    <select
                      id="status"
                      name="status"
                      defaultValue={ticketDetails.status}
                      className="w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
                    >
                      <option>Abierto</option>
                      <option>En atención</option>
                      <option>Cerrado</option>
                      <option>Rechazado</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-semibold shadow-md hover:shadow-lg"
              >
                Guardar
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-3">Conversación</h3>
            <div className="space-y-6">
              {conversation.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
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

