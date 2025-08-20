"use server";

import { answerFAQ } from '@/ai/flows/answer-faq';
import { faqDocument } from './data';
import type { AnswerFAQOutput } from '@/ai/flows/answer-faq';

export interface ExtendedAnswerFAQOutput extends AnswerFAQOutput {
  showFeedback?: boolean;
}

export async function submitMessage(message: string): Promise<ExtendedAnswerFAQOutput> {
  try {
    const result = await answerFAQ({
      question: message,
      faq: faqDocument,
    });
    
    // Añadir showFeedback solo si la respuesta fue exitosa (answered = true)
    // No mostrar feedback si es un mensaje de escalación a soporte (answered = false)
    return {
      ...result,
      showFeedback: result.answered === true
    };
  } catch (error) {
    console.error("Error calling AI flow:", error);
    return { 
      answered: false,
      answer: "Lo siento, estoy teniendo problemas para conectarme con mis servicios de IA. Por favor, intenta de nuevo más tarde o contacta a soporte.",
      subject: "Error de IA - Consulta de Usuario",
      body: `El sistema de IA no pudo procesar la siguiente consulta:\n\n"${message}"\n\nPor favor, describe tu problema a continuación:`,
      showFeedback: false
    };
  }
}

export async function createTicket(subject: string): Promise<{ success: boolean, ticketId: string }> {
  console.log("Creating ticket:", { subject });
  // In a real app, you would save this to a database.
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency
  const ticketId = `SOL-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;
  return { success: true, ticketId };
}
