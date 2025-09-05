"use client"

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

export function ChatInput({ 
  onSubmit, 
  isLoading,
  isDisabled = false 
}: { 
  onSubmit: (formData: FormData) => Promise<void>, 
  isLoading: boolean,
  isDisabled?: boolean 
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [hasText, setHasText] = useState(false);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading || !inputRef.current?.value.trim() || isDisabled) return;

    // Capturamos los datos del formulario ANTES de limpiarlo
    const formData = new FormData(event.currentTarget);

    // Limpiamos el campo de texto INMEDIATAMENTE
    formRef.current?.reset();
    setHasText(false);
    
    // Ahora, enviamos los datos al chatbot
    await onSubmit(formData);
    
    // Una vez que el chatbot responde, volvemos a enfocar el input
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !isDisabled) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };
  
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasText(event.target.value.trim().length > 0);
  };

  useEffect(() => {
    if (!isLoading && !isDisabled) {
      inputRef.current?.focus();
    }
  }, [isLoading, isDisabled]);

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="relative flex items-center gap-2 max-w-3xl mx-auto">
      <Textarea
        ref={inputRef}
        name="message"
        placeholder={isDisabled ? "El campo de texto está deshabilitado" : "Escribe tu pregunta..."}
        className="flex-1 pr-20 resize-none bg-white"
        autoComplete="off"
        disabled={isLoading || isDisabled}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        rows={1}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <Button 
          type="submit" 
          size="icon" 
          disabled={isLoading || !hasText || isDisabled}
          className="transition-all"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          <span className="sr-only">Enviar mensaje</span>
        </Button>
      </div>
    </form>
  );
}
