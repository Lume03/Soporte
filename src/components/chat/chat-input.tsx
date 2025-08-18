"use client"

import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, CornerDownLeft } from 'lucide-react';

export function ChatInput({ onSubmit, isLoading }: { onSubmit: (formData: FormData) => Promise<void>, isLoading: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading || !inputRef.current?.value.trim()) return;
    const formData = new FormData(event.currentTarget);
    await onSubmit(formData);
    formRef.current?.reset();
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="relative flex items-center gap-2 max-w-3xl mx-auto">
      <Textarea
        ref={inputRef}
        name="message"
        placeholder="Escribe tu pregunta..."
        className="flex-1 pr-20 resize-none"
        autoComplete="off"
        disabled={isLoading}
        onKeyDown={handleKeyDown}
        rows={1}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <Button type="submit" size="icon" disabled={isLoading || !formRef.current?.checkValidity()}>
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          <span className="sr-only">Enviar mensaje</span>
        </Button>
      </div>
    </form>
  );
}
