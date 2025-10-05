"use client";

import { useRouter } from "next/navigation";
import { TicketStatusBadge } from "./ticket-status-badge";

// Define el tipo Ticket aquí para que el componente sea autocontenido
type TicketStatus = "Aceptado" | "En Atención" | "Finalizado" | "Cancelado";
type Ticket = {
    id_ticket: number;
    subject: string;
    user?: string;
    service?: string;
    status?: TicketStatus;
};

export function TicketRow({ ticket }: { ticket: Ticket }) {
    const router = useRouter();

    // Esta función se llamará cuando se haga clic en la fila
    const handleRowClick = () => {
        router.push(`/analyst/ticket/${ticket.id_ticket}`);
    };

    return (
        <tr
            onClick={handleRowClick}
            className="hover:bg-gray-50/50 transition-colors cursor-pointer"
        >
            {/* El ID ya no es un enlace, pero mantiene su estilo distintivo */}
            <td className="px-6 py-4 font-medium text-blue-600 truncate">
                {ticket.id_ticket}
            </td>

            {/* El asunto ahora es texto normal, ya que toda la fila es el enlace */}
            <td className="px-6 py-4 font-semibold text-gray-800 truncate">
                {ticket.subject}
            </td>

            <td className="px-6 py-4 truncate">{ticket.user || "-"}</td>
            <td className="px-6 py-4 truncate">{ticket.service || "-"}</td>
            <td className="px-6 py-4">
                {ticket.status && <TicketStatusBadge status={ticket.status} />}
            </td>
        </tr>
    );
}