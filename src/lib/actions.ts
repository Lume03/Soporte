"use server";

import { answerFAQ } from '@/ai/flows/answer-faq';
import { faqDocument } from './data';
import type { AnswerFAQOutput } from '@/ai/flows/answer-faq';

export async function submitMessage(message: string): Promise<AnswerFAQOutput> {
  try {
    const result = await answerFAQ({
      question: message,
      faq: faqDocument,
    });
    return result;
  } catch (error) {
    console.error("Error calling AI flow:", error);
    return { answer: "Lo siento, estoy teniendo problemas para conectarme con mis servicios de IA. Por favor, intenta de nuevo más tarde." };
  }
}

export async function createTicket(subject: string, description: string): Promise<{ success: boolean, ticketId: string }> {
  console.log("Creating ticket:", { subject, description });
  // In a real app, you would save this to a database.
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency
  const ticketId = `TICK-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;
  return { success: true, ticketId };
}
