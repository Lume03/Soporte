"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { getAnalystTickets } from '@/lib/actions';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { AnalystHeader } from '@/components/analyst/analyst-header';
import { TicketStatusBadge } from '@/components/analyst/ticket-status-badge';

type TicketStatus = 'Abierto' | 'En Atención' | 'Cerrado' | 'Rechazado';
type Ticket = { id_ticket: number; subject: string; user?: string; service?: string; status?: TicketStatus; date?: string; };

const TICKETS_PER_PAGE = 10;

export default function AnalystDashboardPage() {
    const { data: session } = useSession();
    const token = (session as any)?.backendAccessToken as string | undefined;

    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [total, setTotal] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<TicketStatus | 'Todos'>('Todos');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (!token) return;
        (async () => {
            try {
                const page = currentPage - 1;
                const offset = page * TICKETS_PER_PAGE;
                const data = await getAnalystTickets(token, TICKETS_PER_PAGE, offset);
                setTickets(data.items || []);
                setTotal(data.total || 0);
            } catch (e) {
                console.error(e);
                setTickets([]);
                setTotal(0);
            }
        })();
    }, [token, currentPage]);

    const filteredTickets = useMemo(() => {
        return tickets
            .filter(t => statusFilter === 'Todos' || (t.status as TicketStatus) === statusFilter)
            .filter(t => {
                const term = searchTerm.toLowerCase();
                return (
                    String(t.id_ticket).toLowerCase().includes(term) ||
                    (t.subject || '').toLowerCase().includes(term) ||
                    (t.user || '').toLowerCase().includes(term)
                );
            });
    }, [tickets, statusFilter, searchTerm]);

    const totalPages = Math.max(1, Math.ceil((statusFilter === 'Todos' && !searchTerm ? total : filteredTickets.length) / TICKETS_PER_PAGE));
    const paginatedTickets = (statusFilter === 'Todos' && !searchTerm)
        ? tickets
        : filteredTickets.slice(0, TICKETS_PER_PAGE);

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
                        <table className="w-full text-sm text-left text-gray-600 table-fixed">
                            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-xs text-blue-900/80 uppercase tracking-wider">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold w-[15%]">Ticket ID</th>
                                <th scope="col" className="px-6 py-4 font-semibold w-[40%]">Asunto</th>
                                <th scope="col" className="px-6 py-4 font-semibold w-[15%]">Usuario</th>
                                <th scope="col" className="px-6 py-4 font-semibold w-[15%]">Servicio</th>
                                <th scope="col" className="px-6 py-4 font-semibold w-[15%]">Estado</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {paginatedTickets.map((ticket) => (
                                <tr key={ticket.id_ticket} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-blue-600 truncate">
                                        <Link href={`/analyst/ticket/${ticket.id_ticket}`} className="hover:underline">
                                            {ticket.id_ticket}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-800 truncate">{ticket.subject}</td>
                                    <td className="px-6 py-4 truncate">{ticket.user || '-'}</td>
                                    <td className="px-6 py-4 truncate">{ticket.service || '-'}</td>
                                    <td className="px-6 py-4">
                                        {ticket.status ? <TicketStatusBadge status={ticket.status as TicketStatus} /> : null}
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
