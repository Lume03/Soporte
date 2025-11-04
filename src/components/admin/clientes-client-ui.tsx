"use client";

import { useState, useTransition, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Cliente,
  Servicio,
  ClienteDetalle,
  ClienteFormInput,
  FormState,
} from "@/lib/types"; 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

import {
  fetchAllClientes,
  fetchAllServicios,
  fetchClienteDetalle,
  createCliente,
  updateCliente,
  deleteCliente,
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
  DialogDescription, 
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
import { ScrollArea } from "@/components/ui/scroll-area"; 
import { Skeleton } from "@/components/ui/skeleton"; 
import { PlusCircle, FilePenLine, Loader2 } from "lucide-react";


const formSchema = z.object({
  nombre_cliente: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  dominio: z.string().min(3, "El dominio debe tener al menos 3 caracteres."),
  servicios_ids: z
    .array(z.string())
    .min(1, "Debe seleccionar al menos un servicio."),
});


type FormValues = z.infer<typeof formSchema>;


export function ClientesClientUI() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();


  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [allServicios, setAllServicios] = useState<Servicio[]>([]); 


  const [isLoadingData, setIsLoadingData] = useState(true); 
  const [isLoadingDetalle, setIsLoadingDetalle] = useState(false); 


  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  
 
  const [editingClient, setEditingClient] = useState<ClienteDetalle | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

 
  const { data: session } = useSession();
  
  const token = session?.backendAccessToken as string | undefined;


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre_cliente: "",
      dominio: "",
      servicios_ids: [],
    },
  });


  useEffect(() => {
    if (token) {
      const loadInitialData = async () => {
        setIsLoadingData(true);
        try {
          
          const [clientesData, serviciosData] = await Promise.all([
            fetchAllClientes(token),
            fetchAllServicios(token), 
          ]);
          setClientes(clientesData);
          setAllServicios(serviciosData);
        } catch (error: any) {
          toast({ title: "Error al cargar datos", description: error.message, variant: "destructive" });
        } finally {
          setIsLoadingData(false);
        }
      };
      loadInitialData();
    }
  }, [token, toast]);


  const handleOpenCreateModal = () => {
    setEditingClient(null); 
    form.reset({ nombre_cliente: "", dominio: "", servicios_ids: [] }); 
    setFormModalOpen(true);
  };

  const handleOpenEditModal = async (cliente: Cliente) => {
    if (!token) return;
    
    setEditingClient(null); 
    setIsLoadingDetalle(true); 
    setFormModalOpen(true);

    try {
     
      const detalle = await fetchClienteDetalle(token, cliente.id_cliente);
      
   
      form.reset({
        nombre_cliente: detalle.nombre,
        dominio: detalle.dominio,
        servicios_ids: detalle.servicios.map((s) => s.id_servicio), 
      });
      
      setEditingClient(detalle); 
    } catch (error: any) {
      toast({ title: "Error al cargar detalle", description: error.message, variant: "destructive" });
      setFormModalOpen(false); 
    } finally {
      setIsLoadingDetalle(false); 
    }
  };


  const handleOpenDeleteAlert = (cliente: Cliente) => {
    setSelectedClientId(cliente.id_cliente); 
    setDeleteAlertOpen(true);
  };


  const onSubmit = (values: FormValues) => {
    if (!token) return;

    startTransition(async () => {
      let result: FormState;
      try {
        if (editingClient) {
         
          result = await updateCliente(token, editingClient.id_cliente, values);
        } else {
       
          result = await createCliente(token, values);
        }

        if (result.success) {
          toast({ title: "Éxito", description: result.message });
          setFormModalOpen(false);
          
          setIsLoadingData(true);
          setClientes(await fetchAllClientes(token));
          setIsLoadingData(false);
        } else {
          toast({ title: "Error", description: result.message, variant: "destructive" });
        }
      } catch (error: any) {
         toast({ title: "Error inesperado", description: error.message, variant: "destructive" });
      }
    });
  };


  const handleDelete = () => {
    if (!token || !selectedClientId) return;

    startTransition(async () => {
      try {
        const result = await deleteCliente(token, selectedClientId);
        
        if (result.success) {
          toast({ title: "Éxito", description: result.message });
         
          setIsLoadingData(true);
          setClientes(await fetchAllClientes(token));
          setIsLoadingData(false);
        } else {
          toast({ title: "Error", description: result.message, variant: "destructive" });
        }
      } catch (error: any) {
         toast({ title: "Error inesperado", description: error.message, variant: "destructive" });
      } finally {
        setDeleteAlertOpen(false);
        setSelectedClientId(null);
      }
    });
  };
  

  const deleteClientName = clientes.find(c => c.id_cliente === selectedClientId)?.nombre || "";

  return (
    <Dialog open={isFormModalOpen} onOpenChange={setFormModalOpen}>
      <div className="flex justify-end mb-4">
        <Button onClick={handleOpenCreateModal}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo cliente
        </Button>
      </div>

     
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[300px]">ID Cliente</TableHead>
              <TableHead className="w-[250px]">Nombre</TableHead>
              <TableHead className="w-[180px] text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingData ? (
            
              <TableRow>
                <TableCell colSpan={3} className="h-24">
                  <Skeleton className="h-5 w-full my-1" />
                  <Skeleton className="h-5 w-full my-1" />
                </TableCell>
              </TableRow>
            ) : clientes.length === 0 ? (
            
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No se encontraron clientes.
                </TableCell>
              </TableRow>
            ) : (
           
              clientes.map((cliente) => (
                <TableRow key={cliente.id_cliente}>
                  <TableCell className="font-medium text-xs text-muted-foreground">
                    {cliente.id_cliente}
                  </TableCell>
                  <TableCell>{cliente.nombre}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => handleOpenEditModal(cliente)}
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
                          onClick={() => handleOpenDeleteAlert(cliente)}
                        >
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

    
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingClient ? "Editar Cliente" : "Crear Nuevo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {editingClient 
              ? "Actualiza los datos del cliente."
              : "Completa los datos para el nuevo cliente."
            }
          </DialogDescription>
        </DialogHeader>

       
        {isLoadingDetalle ? (
          
          <div className="space-y-4 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
         
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="nombre_cliente"
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
                name="servicios_ids"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Servicios Asignados</FormLabel>
                    </div>
                    <ScrollArea className="h-40 w-full rounded-md border p-4">
                      {allServicios.map((servicio) => (
                        <FormField
                          key={servicio.id_servicio}
                          control={form.control}
                          name="servicios_ids"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={servicio.id_servicio}
                                className="flex flex-row items-center space-x-3 space-y-0 mb-2"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(servicio.id_servicio)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, servicio.id_servicio])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== servicio.id_servicio
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">
                                  {servicio.nombre}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </ScrollArea>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
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
        )}
      </DialogContent>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás realmente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente al
              cliente <span className="font-bold">{deleteClientName}</span> y todas
              sus asociaciones (tickets, dominios, etc.).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Eliminar Permanentemente"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}

