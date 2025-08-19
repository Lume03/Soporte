"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PanelLeft, Plus, PanelLeftClose, ChevronLeft, ChevronRight, User, LogOut } from 'lucide-react';
import { TicketList } from '@/components/tickets/ticket-list';
import type { Ticket } from '@/lib/types';
import { initialTickets } from '@/lib/data';
import { Logo } from '@/components/logo';
import { CreateTicketDialog } from '../tickets/create-ticket-dialog';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Usuario fijo para demo
const DEMO_USER = {
  name: "Pepe González",
  email: "pepe.gonzalez@empresa.com",
  initials: "PG"
};

export function ChatLayout({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatKey, setChatKey] = useState(Date.now());
  const [userName, setUserName] = useState('');
  const router = useRouter();
  
  useEffect(() => {
    // Obtener el nombre del usuario del localStorage o usar el demo
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUserName(DEMO_USER.name); // Siempre usar el nombre demo
      } else {
        setUserName(DEMO_USER.name);
      }
    }
  }, []);
  
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    router.push('/login');
  };
  
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

  const startNewChat = () => {
    setChatKey(Date.now());
  };

  const sidebarContent = (isSheet = false) => (
    <div className="flex flex-col h-full text-foreground relative">
      {/* Header del Sidebar con botón de colapsar */}
      <div className="p-4 border-b flex items-center justify-between h-16">
        <div className={cn("flex items-center gap-3", !isSheet && !isSidebarOpen && "opacity-0")}>
          <div className="w-10 h-10 flex-shrink-0">
            <Logo />
          </div>
          {(isSheet || isSidebarOpen) && (
            <h1 className="font-bold text-xl truncate">Soporte</h1>
          )}
        </div>
        
        {/* Botón de colapsar sidebar - solo en desktop */}
        {!isSheet && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute -right-3 top-4 z-10 h-6 w-6 rounded-full border bg-background shadow-md hover:shadow-lg"
          >
            {isSidebarOpen ? (
              <ChevronLeft className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
      
      {/* Botón Nueva Solicitud arriba */}
      {(isSheet || isSidebarOpen) && (
        <div className="p-4 border-b">
          <Button className="w-full bg-[#4285f4] hover:bg-[#357ae8] text-white" onClick={startNewChat}>
            <Plus className="mr-2 h-4 w-4" /> Nueva Solicitud
          </Button>
        </div>
      )}
      
      {/* Lista de Tickets */}
      {(isSheet || isSidebarOpen) && (
        <div className="flex-1 overflow-y-auto">
          <TicketList tickets={tickets} />
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar Desktop */}
      <aside className={cn(
        "hidden md:flex flex-col border-r bg-card transition-all duration-300 relative",
        isSidebarOpen ? "w-80 lg:w-96" : "w-16"
      )}>
        {sidebarContent(false)}
      </aside>
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
          <div className='flex items-center gap-2'>
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <PanelLeft className="h-6 w-6" />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80 bg-card">
                {sidebarContent(true)}
              </SheetContent>
            </Sheet>
            
            {/* Logo Mobile */}
            <div className='md:hidden'>
              <Logo />
            </div>
          </div>
          
          {/* User Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:block">
                Bienvenido, {userName}
              </span>
              <Avatar className="h-9 w-9 border">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  {DEMO_USER.initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <Button 
              onClick={handleLogout}
              className="text-sm bg-[#4285f4] hover:bg-[#357ae8] text-white"
            >
              Cerrar Sesión
            </Button>
          </div>
        </header>
        
        {/* Children with props */}
        {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, { key: chatKey, tickets, addTicket } as any);
            }
            return child;
        })}
      </div>
    </div>
  );
}
