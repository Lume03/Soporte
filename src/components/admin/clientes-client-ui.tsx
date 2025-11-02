"use client";

import { useState, useTransition } from "react";
import { Cliente } from "@/lib/types"; 
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, FilePenLine, Loader2 } from "lucide-react";

// Lista de servicios disponibles
const SERVICIOS_DISPONIBLES = [
  { id: "ninguno", label: "Ninguno" },
  { id: "soporte_tecnico", label: "Soporte Técnico" },
  { id: "consultoria", label: "Consultoría" },
  { id: "desarrollo", label: "Desarrollo de Software" },
  { id: "hosting", label: "Hosting" },
  { id: "mantenimiento", label: "Mantenimiento" },
];

const formSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  dominio: z.string().min(3, "El dominio debe tener al menos 3 caracteres."),
  servicios: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface ClientesClientUIProps {
  initialData: Cliente[];
}

export function ClientesClientUI({ initialData }: ClientesClientUIProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [clientes, setClientes] = useState(initialData);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: "", dominio: "", servicios: [] },
  });

  // Función para obtener el label del servicio
  const getServicioLabel = (servicioId: string) => {
    const servicio = SERVICIOS_DISPONIBLES.find(s => s.id === servicioId);
    return servicio?.label || servicioId;
  };

  const handleOpenDialog = (cliente: Cliente | null) => {
    setEditingClient(cliente);
    if (cliente) {
      form.reset({ 
        nombre: cliente.nombre, 
        dominio: cliente.dominio,
        servicios: (cliente as any).servicios || []
      });
    } else {
      form.reset({ nombre: "", dominio: "", servicios: [] });
    }
    setOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    startTransition(() => {
      setTimeout(() => {
        if (editingClient) {
          setClientes(
            clientes.map((c) =>
              c.id === editingClient.id ? { ...editingClient, ...values } : c
            )
          );
          toast({ title: "Éxito (Simulado)", description: "Cliente actualizado." });
        } else {
          const newId = Math.max(...clientes.map((c) => c.id), 0) + 1;
          setClientes([...clientes, { id: newId, ...values }]);
          toast({ title: "Éxito (Simulado)", description: "Cliente creado." });
        }
        setOpen(false); 
      }, 500); 
    });
  };

  const handleDelete = (id: number) => {
    startTransition(() => {
      setTimeout(() => {
        setClientes(clientes.filter((c) => c.id !== id));
        toast({ title: "Éxito (Simulado)", description: "Cliente eliminado." });
      }, 500); 
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog(null)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo cliente
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead className="w-[200px]">Nombre</TableHead>
              <TableHead className="w-[180px]">Dominio</TableHead>
              <TableHead>Servicios</TableHead>
              <TableHead className="w-[180px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.map((cliente) => {
              const servicios = (cliente as any).servicios || [];
              
              return (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.id}</TableCell>
                  <TableCell>{cliente.nombre}</TableCell>
                  <TableCell>{cliente.dominio}</TableCell>
                  <TableCell>
                    {servicios.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {servicios.map((servicioId: string) => (
                          <Badge 
                            key={servicioId} 
                            variant="secondary"
                            className="text-xs"
                          >
                            {getServicioLabel(servicioId)}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm italic">
                        Sin servicios
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-right whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => handleOpenDialog(cliente)}
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
                            Simulación: Eliminar permanentemente al cliente "
                            {cliente.nombre}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(cliente.id)}
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
              );
            })}
          </TableBody>
        </Table>
      </div>

      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingClient ? "Editar Cliente" : "Crear Nuevo Cliente"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Empresa S.A.C." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dominio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dominio</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="servicios"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Servicios</FormLabel>
                  </div>
                  {SERVICIOS_DISPONIBLES.map((servicio) => (
                    <FormField
                      key={servicio.id}
                      control={form.control}
                      name="servicios"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={servicio.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(servicio.id)}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  
                                  // Si selecciona "Ninguno", limpiar todo
                                  if (servicio.id === "ninguno" && checked) {
                                    return field.onChange([]);
                                  }
                                  
                                  // Si selecciona otro servicio, quitar "Ninguno" si está presente
                                  if (servicio.id !== "ninguno" && checked) {
                                    const withoutNinguno = currentValue.filter(v => v !== "ninguno");
                                    return field.onChange([...withoutNinguno, servicio.id]);
                                  }
                                  
                                  // Agregar o quitar el servicio
                                  return checked
                                    ? field.onChange([...currentValue, servicio.id])
                                    : field.onChange(
                                        currentValue.filter(
                                          (value) => value !== servicio.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {servicio.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
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