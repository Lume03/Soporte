import { Button } from "@/components/ui/button";
import { faqData } from "@/lib/data";
import { ChevronRight, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function FaqSection({ onFaqClick }: { onFaqClick: (question: string, answer: string) => void }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Preguntas Frecuentes</h2>
        <p className="text-muted-foreground mt-2">Encuentra respuestas rápidas a preguntas comunes.</p>
      </div>
      
      <div className="space-y-3">
        {faqData.map((faq, index) => (
          <button
            key={index}
            onClick={() => onFaqClick(faq.question, faq.answer)}
            className={cn(
              "w-full text-left p-4 rounded-lg bg-white border border-gray-200",
              "hover:border-[#4285f4] hover:shadow-md transition-all duration-200",
              "group flex items-center justify-between"
            )}
          >
            <div className="flex items-start gap-3 flex-1">
              <MessageCircle className="h-5 w-5 text-[#4285f4] mt-0.5 flex-shrink-0" />
              <span className="text-base font-medium text-gray-900 pr-4">
                {faq.question}
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#4285f4] transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-center text-blue-700">
          💡 <strong>Tip:</strong> Haz click en cualquier pregunta para iniciar una conversación con nuestro asistente
        </p>
      </div>
    </div>
  );
}
