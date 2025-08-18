"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PanelLeft, Plus, PanelLeftClose, PanelRightClose } from 'lucide-react';
import { TicketList } from '@/components/tickets/ticket-list';
import type { Ticket } from '@/lib/types';
import { initialTickets } from '@/lib/data';
import { Logo } from '@/components/logo';
import { CreateTicketDialog } from '../tickets/create-ticket-dialog';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function ChatLayout({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const addTicket = (newTicket: Omit<Ticket, 'id' | 'date' | 'status'>) => {
    setTickets(prev => [
        { 
            ...newTicket, 
            id: `SOL-${String(prev.length + 1).padStart(3, '0')}`,
            date: new Date().toISOString().split('T')[0],
            status: 'En Proceso'
        },
        ...prev
    ]);
  };

  const sidebarHeader = (
    <div className="p-4 border-b flex items-center justify-between h-16">
      <div className={cn("flex items-center gap-3 transition-opacity", isSidebarOpen ? "opacity-100" : "opacity-0")}>
        <div className="w-10 h-10 flex-shrink-0">
          <Logo />
        </div>
        <h1 className="font-bold text-xl truncate">Soporte</h1>
      </div>
    </div>
  );
  
  const sidebarContent = (
    <div className="flex flex-col h-full text-foreground">
      {sidebarHeader}
      <div className="flex-1 overflow-y-auto">
        <TicketList tickets={tickets} />
      </div>
      <div className="p-4 border-t">
        <CreateTicketDialog onTicketCreated={addTicket}>
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Nueva Solicitud
          </Button>
        </CreateTicketDialog>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-background">
      <aside className={cn(
        "hidden md:flex flex-col border-r bg-card transition-all duration-300",
        isSidebarOpen ? "w-80 lg:w-96" : "w-16"
      )}
      >
         <div className="flex flex-col h-full text-foreground">
            <div className="p-4 border-b flex items-center justify-center h-16">
              <Link href="/chat">
                <div className={cn("w-10 h-10", !isSidebarOpen && "mx-auto")}>
                    <Logo />
                </div>
              </Link>
                <h1 className={cn("font-bold text-xl truncate ml-3", !isSidebarOpen && "hidden")}>Soporte</h1>
            </div>
            <div className={cn("flex-1 overflow-y-auto", !isSidebarOpen && "hidden")}>
                <TicketList tickets={tickets} />
            </div>
            <div className={cn("p-4 border-t", !isSidebarOpen && "hidden")}>
                <CreateTicketDialog onTicketCreated={addTicket}>
                <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Nueva Solicitud
                </Button>
                </CreateTicketDialog>
            </div>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
          <div className='flex items-center gap-2'>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <PanelLeft className="h-6 w-6" />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80 bg-card">
              <div className="flex flex-col h-full text-foreground">
                <div className="p-4 border-b flex items-center justify-between h-16">
                  <div className={"flex items-center gap-3"}>
                    <div className="w-10 h-10 flex-shrink-0">
                      <Logo />
                    </div>
                    <h1 className="font-bold text-xl truncate">Soporte</h1>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <TicketList tickets={tickets} />
                </div>
                <div className="p-4 border-t">
                    <CreateTicketDialog onTicketCreated={addTicket}>
                    <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" /> Nueva Solicitud
                    </Button>
                    </CreateTicketDialog>
                </div>
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                {isSidebarOpen ? <PanelLeftClose className="h-6 w-6" /> : <PanelRightClose className="h-6 w-6" />}
                <span className="sr-only">Toggle Sidebar</span>
            </Button>
            <div className='md:hidden'>
                <Logo />
            </div>
          </div>
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
