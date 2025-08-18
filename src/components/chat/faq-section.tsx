import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { faqData } from "@/lib/data";
import { MessageSquarePlus } from "lucide-react";

export function FaqSection({ onFaqClick }: { onFaqClick: (question: string, answer: string) => void }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Preguntas Frecuentes</h2>
        <p className="text-muted-foreground mt-2">Encuentra respuestas rápidas a preguntas comunes.</p>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {faqData.map((faq, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger className="text-left hover:no-underline text-base">{faq.question}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <p className="text-muted-foreground">{faq.answer}</p>
                <Button variant="ghost" size="sm" onClick={() => onFaqClick(faq.question, faq.answer)}>
                  <MessageSquarePlus className="mr-2 h-4 w-4" />
                  Añadir al chat
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
