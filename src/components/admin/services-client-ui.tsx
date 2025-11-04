"use client";

import { useState, useTransition, useEffect } from "react";
import { useSession } from "next-auth/react"; 
import { Servicio, FormState } from "@/lib/types"; 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";


import { 
  fetchAllServicios, 
  createServicio, 
  updateServicio, 
  deleteServicio 
} from "@/lib/actions";

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

import { Skeleton } from "@/components/ui/skeleton"; 

const formSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
});
type FormValues = z.infer<typeof formSchema>;

export function ServiciosClientUI() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [servicios, setServicios] = useState<Servicio[]>([]); 
  const [editingService, setEditingService] = useState<Servicio | null>(null);
  const { data: session } = useSession();
  const token = session?.backendAccessToken as string | undefined;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: "" },
  });

  const fetchServices = async () => {
    if (!token) return; 
    setIsLoading(true);
    try {
      const data = await fetchAllServicios(token); 
      setServicios(data); 
    } catch (error: any) {
      toast({ title: "Error al cargar", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    if (token) {
      fetchServices();
    }

  }, [token]);

  

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
    if (!token) {
      toast({ title: "Error", description: "Sesión no encontrada. Refresca la página.", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      let result: FormState;
      try {
        if (editingService) {

          result = await updateServicio(token, editingService.id_servicio, values);
        } else {
      
          result = await createServicio(token, values);
        }

        if (result.success) {
          toast({ title: "Éxito", description: result.message });
          setOpen(false); 
          await fetchServices(); 
        } else {
          toast({ title: "Error", description: result.message, variant: "destructive" });
        }
      } catch (error: any) {
         toast({ title: "Error inesperado", description: error.message, variant: "destructive" });
      }
    });
  };

  const handleDelete = (id_servicio: string) => {
    if (!token) {
      toast({ title: "Error", description: "Sesión no encontrada. Refresca la página.", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      try {
        const result = await deleteServicio(token, id_servicio);
        
        if (result.success) {
          toast({ title: "Éxito", description: result.message });
          await fetchServices(); 
        } else {
          toast({ title: "Error", description: result.message, variant: "destructive" });
        }
      } catch (error: any) {
         toast({ title: "Error inesperado", description: error.message, variant: "destructive" });
      }
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
            
              <TableHead className="w-[300px]">ID de Servicio</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="w-[200px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
           
            {isLoading ? (
           
              <TableRow>
                <TableCell colSpan={3} className="h-24">
                  <Skeleton className="h-5 w-full my-1" />
                  <Skeleton className="h-5 w-full my-1" />
                  <Skeleton className="h-5 w-full my-1" />
                </TableCell>
              </TableRow>
            ) : servicios.length === 0 ? (
              
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No se encontraron servicios.
                </TableCell>
              </TableRow>
            ) : (
              
              servicios.map((servicio) => (
                
                <TableRow key={servicio.id_servicio}>
                  
                  <TableCell className="font-medium text-xs text-muted-foreground">
                    {servicio.id_servicio}
                  </TableCell>
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
                            Esto eliminará permanentemente el servicio "
                            {servicio.nombre}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                           
                            onClick={() => handleDelete(servicio.id_servicio)}
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
              ))
            )}
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

