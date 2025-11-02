"use client";

import { useState, useTransition } from "react";
import { Servicio } from "@/lib/types"; 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";


import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PlusCircle, FilePenLine, Loader2 } from "lucide-react";


const formSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
});

type FormValues = z.infer<typeof formSchema>;

interface ServiciosClientUIProps {
  initialData: Servicio[];
}

export function ServiciosClientUI({ initialData }: ServiciosClientUIProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();


  const [servicios, setServicios] = useState(initialData);


  const [editingService, setEditingService] = useState<Servicio | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: "" },
  });


  const handleOpenDialog = (servicio: Servicio | null) => {
    setEditingService(servicio);
    if (servicio) {

      form.reset({ nombre: servicio.nombre });
    } else {

      form.reset({ nombre: "" });
    }
    setOpen(true);
  };


  const onSubmit = (values: FormValues) => {
    startTransition(() => {

      setTimeout(() => {
        if (editingService) {
     
          setServicios(
            servicios.map((s) =>
              s.id === editingService.id ? { ...editingService, ...values } : s
            )
          );
          toast({ title: "Éxito (Simulado)", description: "Servicio actualizado." });
        } else {
     
          const newId = Math.max(...servicios.map((s) => s.id), 0) + 1; 
          setServicios([...servicios, { id: newId, ...values }]);
          toast({ title: "Éxito (Simulado)", description: "Servicio creado." });
        }
        setOpen(false); 
      }, 500); 
    });
  };


  const handleDelete = (id: number) => {
    startTransition(() => {

      setTimeout(() => {
        setServicios(servicios.filter((s) => s.id !== id));
        toast({ title: "Éxito (Simulado)", description: "Servicio eliminado." });
      }, 500); 
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
 
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog(null)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo servicio
        </Button>
      </div>

  
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Nombre</TableHead>
          
              <TableHead className="w-[200px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servicios.map((servicio) => (
              <TableRow key={servicio.id}>
                <TableCell className="font-medium">{servicio.id}</TableCell>
                <TableCell>{servicio.nombre}</TableCell>
        
                <TableCell className="text-right whitespace-nowrap">
                 
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => handleOpenDialog(servicio)}
                  >
                    <FilePenLine className="h-4 w-4 mr-1" />
                    Editar
                  </Button>

                
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isPending}
                      >
                        Eliminar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Simulación: Eliminar permanentemente el servicio "
                          {servicio.nombre}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(servicio.id)}
                          disabled={isPending}
                        >
                          {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            "Eliminar"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingService ? "Editar Servicio" : "Crear Nuevo Servicio"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Único campo: Nombre */}
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Servicio</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Reseteo de contraseña" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Guardar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

