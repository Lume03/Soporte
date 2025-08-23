import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Ticket, TicketStatus } from '@/lib/types';
import { FileText, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

const statusConfig: Record<TicketStatus, {label: string; color: string; dotColor: string;}> = {
  'En Proceso': { 
    label: 'En Proceso', 
    color: 'bg-yellow-100 text-yellow-700',
    dotColor: 'bg-yellow-500' 
  },
  'Finalizado': { 
    label: 'Finalizado', 
    color: 'bg-green-100 text-green-700',
    dotColor: 'bg-green-500' 
  },
};

// Componente TicketItem mejorado
function TicketItem({ ticket }: { ticket: Ticket }) {
  const isInProgress = ticket.status === 'En Proceso';
  
  return (
    <li className="group">
      <button className={cn(
        "w-full text-left p-3 rounded-lg hover:bg-accent/50 transition-colors",
        "border border-transparent hover:border-accent",
        "flex items-start gap-3"
      )}>
        <FileText className={cn(
          "h-4 w-4 mt-0.5 flex-shrink-0",
          isInProgress ? "text-yellow-600" : "text-green-600"
        )} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground">
              {ticket.id}
            </span>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              statusConfig[ticket.status].color
            )}>
              {ticket.status}
            </span>
          </div>
          
          <p className="text-sm font-medium truncate">
            {ticket.subject}
          </p>
          
          <div className="flex items-center gap-1 mt-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {new Date(ticket.date).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </button>
    </li>
  );
}

// Componente TicketList con acordeones independientes
export function TicketList({ tickets }: { tickets: Ticket[] }) {
  const inProgressTickets = tickets.filter((t) => t.status === 'En Proceso');
  const finishedTickets = tickets.filter((t) => t.status === 'Finalizado');

  return (
    <div className="p-4">
      <h3 className="font-semibold text-sm text-muted-foreground mb-4 px-2">Mis Solicitudes</h3>
      
      {/* Accordion type="multiple" permite tener múltiples secciones abiertas */}
      <Accordion type="multiple" defaultValue={["en-proceso"]} className="space-y-2">
        <AccordionItem value="en-proceso" className="border rounded-lg">
          <AccordionTrigger className="px-3 text-base font-medium hover:no-underline">
            <span className="flex items-center justify-between w-full">
              <span className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full', statusConfig['En Proceso'].dotColor)} />
                En Proceso
              </span>
              <Badge variant="secondary" className="mr-2">{inProgressTickets.length}</Badge>
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            {inProgressTickets.length > 0 ? (
              <ul className="space-y-1 pt-2">
                {inProgressTickets.map((ticket) => (
                  <TicketItem key={ticket.id} ticket={ticket} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground py-2 pl-3">No hay solicitudes en proceso</p>
            )}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="finalizado" className="border rounded-lg">
          <AccordionTrigger className="px-3 text-base font-medium hover:no-underline">
            <span className="flex items-center justify-between w-full">
              <span className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full', statusConfig['Finalizado'].dotColor)} />
                Finalizado
              </span>
              <Badge variant="secondary" className="mr-2">{finishedTickets.length}</Badge>
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            {finishedTickets.length > 0 ? (
              <ul className="space-y-1 pt-2">
                {finishedTickets.map((ticket) => (
                  <TicketItem key={ticket.id} ticket={ticket} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground py-2 pl-3">No hay solicitudes finalizadas</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
