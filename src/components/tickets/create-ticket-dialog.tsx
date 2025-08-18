"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTicket } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Ticket } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export function CreateTicketDialog({ children, initialQuestion, onTicketCreated }: { children: React.ReactNode, initialQuestion?: string, onTicketCreated: (ticket: Omit<Ticket, 'id' | 'date' | 'status'>) => void; }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const subject = formData.get('subject') as string;
    
    try {
        const result = await createTicket(subject);
        if (result.success) {
            onTicketCreated({ subject });
            toast({
                title: "Solicitud Creada",
                description: `Tu solicitud ${result.ticketId} ha sido creada exitosamente.`,
                variant: "default",
                className: "bg-accent text-accent-foreground"
            });
            setOpen(false);
        } else {
            throw new Error("Failed to create ticket");
        }
    } catch (error) {
        toast({
            title: "Error",
            description: "No se pudo crear la solicitud. Por favor, intenta de nuevo.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
            <DialogTitle>Crear Nueva Solicitud</DialogTitle>
            <DialogDescription>
                Ingresa el asunto de tu solicitud.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="subject">Asunto</Label>
                    <Input id="subject" name="subject" defaultValue={initialQuestion ? `Consulta sobre: "${initialQuestion.substring(0, 40)}..."` : ""} />
                </div>
            </div>
            <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Solicitud
            </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
