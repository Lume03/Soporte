"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PanelLeft, Plus } from 'lucide-react';
import { TicketList } from '@/components/tickets/ticket-list';
import type { Ticket } from '@/lib/types';
import { initialTickets } from '@/lib/data';
import { Logo } from '@/components/logo';
import { CreateTicketDialog } from '../tickets/create-ticket-dialog';

export function ChatLayout({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  
  const addTicket = (newTicket: Omit<Ticket, 'id' | 'date' | 'status'>) => {
    setTickets(prev => [
        { 
            ...newTicket, 
            id: `TICK-${String(prev.length + 1).padStart(3, '0')}`,
            date: new Date().toISOString().split('T')[0],
            status: 'En Proceso'
        },
        ...prev
    ]);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full text-foreground">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10"><Logo/></div>
            <h1 className="font-bold text-xl">Soporte</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <TicketList tickets={tickets} />
      </div>
      <div className="p-4 border-t">
        <CreateTicketDialog onTicketCreated={addTicket}>
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Ticket
          </Button>
        </CreateTicketDialog>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-background">
      <aside className="hidden md:flex md:w-80 lg:w-96 flex-col border-r bg-card">
        {sidebarContent}
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:justify-end">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <PanelLeft className="h-6 w-6" />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80 bg-card">
              {sidebarContent}
            </SheetContent>
          </Sheet>
          {/* User menu can be added here */}
        </header>
        {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, { tickets, addTicket } as any);
            }
            return child;
        })}
      </div>
    </div>
  );
}
