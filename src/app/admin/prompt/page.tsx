"use client"; // Necesario para el formulario interactivo

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";


const mockPrompt = `Eres un asistente de soporte técnico amigable y profesional.
Tu objetivo principal es ayudar a los empleados a resolver problemas comunes.

Servicios que manejas:
- Reseteo de Contraseña
- Solicitud de Licencia
- Problemas de Conexión VPN

Si no puedes resolver el problema, escala el caso a un analista humano.
Sé breve y claro en tus respuestas.`;


const formSchema = z.object({
  prompt: z.string().min(50, "El prompt debe tener al menos 50 caracteres."),
});

export default function AdminPromptPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: mockPrompt, 
    },
  });


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(() => {
      // SIMULACIÓN DE LLAMADA AL BACKEND
      console.log("Datos a guardar:", values);
      setTimeout(() => {
        toast({
          title: "Éxito (Simulado)",
          description: "El prompt del agente ha sido actualizado.",
        });
      }, 1000); // Simular retraso de 1 segundo
    });
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
        
          <CardHeader>
            <CardTitle>Modificar Prompt</CardTitle>
            <CardDescription>
              Este es el prompt principal (instrucciones) que guía el
              comportamiento del agente de IA.
            </CardDescription>
          </CardHeader>

        
          <CardContent>
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Prompt del Sistema</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Eres un agente de soporte amable..."
                      className="min-h-[400px] font-mono text-sm" // Fuente mono para prompts
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

         
          <CardFooter className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isPending}
              // Usamos el mismo color de botón que tu header
              className="bg-blue-600 hover:bg-blue-700" 
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Cambios"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}