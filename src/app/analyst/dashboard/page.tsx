"use client";

import { useState, useMemo } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { AnalystHeader } from '@/components/analyst/analyst-header';
import { TicketStatusBadge } from '@/components/analyst/ticket-status-badge';

// --- TIPOS DE DATOS ---
type TicketStatus = 'Abierto' | 'En Atención' | 'Cerrado' | 'Rechazado';
type Ticket = {
  id: string;
  subject: string;
  user: string;
  service: string;
  status: TicketStatus;
};

// --- DATOS AMPLIADOS PARA LA PAGINACIÓN ---
const allTickets: Ticket[] = [
    { id: 'TCK-2025-00913', subject: 'Dashboard de ventas sin datos actuales', user: 'Ana González', service: 'Data Science', status: 'Abierto' },
    { id: 'TCK-2025-00931', subject: 'Solicitud de un nuevo reporte en Big Data', user: 'Ricardo Mendoza', service: 'Big Data', status: 'En Atención' },
    { id: 'TCK-2025-00914', subject: 'Falla de conexión a Azure Cloud Services', user: 'Javier Torres', service: 'Cloud + Apps', status: 'Cerrado' },
    { id: 'TCK-2025-00915', subject: 'Error en la API de Google Maps', user: 'Daniel Soto', service: 'Geo Solutions', status: 'Abierto' },
    { id: 'TCK-2025-00916', subject: 'Despliegue de nueva App en Azure', user: 'Camila Rojas', service: 'Cloud + Apps', status: 'Rechazado' },
    { id: 'TCK-2025-00917', subject: 'Consulta sobre integración con Power BI', user: 'Sofía Castro', service: 'Data Science', status: 'Cerrado' },
    { id: 'TCK-2025-00918', subject: 'Optimización de query en Snowflake', user: 'Mateo Vargas', service: 'Big Data', status: 'Abierto' },
    { id: 'TCK-2025-00919', subject: 'Problema con la actualización de datos de marketing', user: 'Valentina Paredes', service: 'Data Science', status: 'En Atención' },
    { id: 'TCK-2025-00920', subject: 'Necesito acceso a nueva base de datos', user: 'Lucas Morales', service: 'Cloud + Apps', status: 'Abierto' },
    { id: 'TCK-2025-00921', subject: 'Reporte de Geo-localización no carga', user: 'Isabella Castillo', service: 'Geo Solutions', status: 'En Atención' },
    { id: 'TCK-2025-00922', subject: 'Error 503 en servicio de analítica web', user: 'Martina Nuñez', service: 'Data Science', status: 'Abierto' },
    { id: 'TCK-2025-00923', subject: 'Migración de datos a BigQuery', user: 'Sebastián Ríos', service: 'Big Data', status: 'Cerrado' },
    { id: 'TCK-2025-00924', subject: 'Configuración de alertas en Azure Monitor', user: 'Gabriela Flores', service: 'Cloud + Apps', status: 'En Atención' },
    { id: 'TCK-2025-00925', subject: 'Visualización de datos geoespaciales', user: 'Alejandro Vega', service: 'Geo Solutions', status: 'Rechazado' },
    { id: 'TCK-2025-00926', subject: 'Ajuste de modelo predictivo', user: 'Valeria Mendoza', service: 'Data Science', status: 'Abierto' },
];

const TICKETS_PER_PAGE = 10;

export default function AnalystDashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'Todos'>('Todos');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTickets = useMemo(() => {
    return allTickets
      .filter(ticket => statusFilter === 'Todos' || ticket.status === statusFilter)
      .filter(ticket => {
        const term = searchTerm.toLowerCase();
        return (
          ticket.id.toLowerCase().includes(term) ||
          ticket.subject.toLowerCase().includes(term) ||
          ticket.user.toLowerCase().includes(term)
        );
      });
  }, [searchTerm, statusFilter]);
  
  const totalPages = Math.ceil(filteredTickets.length / TICKETS_PER_PAGE);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * TICKETS_PER_PAGE,
    currentPage * TICKETS_PER_PAGE
  );

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAFC]">
      <AnalystHeader />
      <main className="p-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Buscar por ID, asunto o usuario..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
            </div>
            
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as TicketStatus | 'Todos');
                  setCurrentPage(1);
                }}
                className="appearance-none flex items-center gap-2 pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Todos">Todos los Estados</option>
                <option value="Abierto">Abierto</option>
                <option value="En Atención">En Atención</option>
                <option value="Cerrado">Cerrado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <Filter className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-xs text-blue-900/80 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Ticket ID</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Asunto</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Usuario</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Servicio</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-blue-600">
                      <Link href={`/analyst/ticket/${ticket.id}`} className="hover:underline">
                        {ticket.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{ticket.subject}</td>
                    <td className="px-6 py-4">{ticket.user}</td>
                    <td className="px-6 py-4">{ticket.service}</td>
                    <td className="px-6 py-4">
                      <TicketStatusBadge status={ticket.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8">
              <nav className="flex items-center space-x-2">
                <button 
                  onClick={handlePrevPage} 
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                   <button 
                     key={page}
                     onClick={() => setCurrentPage(page)}
                     className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      currentPage === page 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'hover:bg-gray-200'
                     }`}
                   >
                     {page}
                   </button>
                ))}
                <button 
                  onClick={handleNextPage} 
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </nav>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

