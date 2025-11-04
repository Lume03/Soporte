"use client";

import { useTransition, useEffect, useState } from "react";
import { useSession } from "next-auth/react"; 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";


import { fetchPrompt, updatePrompt } from "@/lib/actions";
import { FormState } from "@/lib/types"; 

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
import { Skeleton } from "@/components/ui/skeleton"; 



const formSchema = z.object({
  prompt: z.string().min(50, "El prompt debe tener al menos 50 caracteres."),
});

export default function AdminPromptPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);


  const { data: session } = useSession();
 
  const token = session?.backendAccessToken as string | undefined;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "", 
    },
  });

  useEffect(() => {
    if (token) {
      const loadPrompt = async () => {
        setIsLoading(true);
        try {
         
          const promptData = await fetchPrompt(token);
      
          form.reset({ prompt: promptData.descripcion });
        } catch (error: any) {
          toast({
            title: "Error al cargar el prompt",
            description: error.message,
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      loadPrompt();
    }
 
  }, [token]);


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!token) {
      toast({ title: "Error", description: "No autenticado.", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      let result: FormState;
      try {
  
        result = await updatePrompt(token, values.prompt);

        if (result.success) {
          toast({
            title: "Éxito",
            description: result.message,
          });

        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({ title: "Error inesperado", description: error.message, variant: "destructive" });
      }
    });
  };

  return (
    <Card className="max-w-4xl mx-auto my-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Modificar Prompt</CardTitle>
            <CardDescription>
              Este es el prompt principal (instrucciones) que guía el
              comportamiento del agente de IA. Los cambios se aplican
              inmediatamente.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isLoading ? (
            
              <Skeleton className="h-[400px] w-full" />
            ) : (
             
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Prompt del Sistema</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Cargando prompt..."
                        className="min-h-[400px] font-mono text-sm"
                        {...field}
                        disabled={isPending} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button 
              type="submit" 
            
              disabled={isLoading || isPending} 
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Cambios"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}