import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Ticket, TicketStatus } from '@/lib/types';
import { Ticket as TicketIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

const statusConfig: Record<TicketStatus, {label: string; color: string;}> = {
  'En Proceso': { label: 'En Proceso', color: 'bg-yellow-400' },
  'Finalizado': { label: 'Finalizado', color: 'bg-green-500' },
};

function TicketItem({ ticket }: { ticket: Ticket }) {
  return (
    <li key={ticket.id}>
      <a
        href="#"
        className="flex items-start gap-3 rounded-lg p-2 text-card-foreground/80 transition-colors hover:bg-muted/50 hover:text-card-foreground"
      >
        <div className="mt-1 text-muted-foreground">
          <TicketIcon className="h-4 w-4" />
        </div>
        <div className="flex-1 truncate">
          <p className="font-semibold leading-tight truncate">{ticket.subject}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>{ticket.id}</span>
              <div className="flex items-center gap-1.5">
                  <span className={cn('h-2 w-2 rounded-full', statusConfig[ticket.status].color)} />
                  <span>{statusConfig[ticket.status].label}</span>
              </div>
          </div>
        </div>
      </a>
    </li>
  );
}

export function TicketList({ tickets }: { tickets: Ticket[] }) {
  const inProgressTickets = tickets.filter((t) => t.status === 'En Proceso');
  const finishedTickets = tickets.filter((t) => t.status === 'Finalizado');

  return (
    <div className="p-4 text-sm font-medium">
      <h2 className="px-2 pb-2 text-lg font-semibold tracking-tight">Mis Solicitudes</h2>
      <Accordion type="multiple" defaultValue={['en-proceso', 'finalizado']} className="w-full">
        <AccordionItem value="en-proceso">
          <AccordionTrigger className="text-base font-medium hover:no-underline">
            En Proceso <Badge variant="secondary" className="ml-2">{inProgressTickets.length}</Badge>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-1 pt-2">
              {inProgressTickets.map((ticket) => (
                <TicketItem key={ticket.id} ticket={ticket} />
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="finalizado">
          <AccordionTrigger className="text-base font-medium hover:no-underline">
            Finalizado <Badge variant="secondary" className="ml-2">{finishedTickets.length}</Badge>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-1 pt-2">
              {finishedTickets.map((ticket) => (
                <TicketItem key={ticket.id} ticket={ticket} />
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
