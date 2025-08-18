'use server';
/**
 * @fileOverview A FAQ answering AI agent.
 *
 * - answerFAQ - A function that handles the FAQ answering process.
 * - AnswerFAQInput - The input type for the answerFAQ function.
 * - AnswerFAQOutput - The return type for the answerFAQ function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerFAQInputSchema = z.object({
  question: z.string().describe('The question to be answered from the FAQ.'),
  faq: z.string().describe('The FAQ document.'),
});
export type AnswerFAQInput = z.infer<typeof AnswerFAQInputSchema>;

const AnswerFAQOutputSchema = z.object({
  answered: z.boolean().describe('Whether the question was answered from the FAQ.'),
  answer: z.string().describe('The answer to the question from the FAQ. If not answered, this will be a message indicating so.'),
  subject: z.string().optional().describe('A suggested subject line for a support email if the question was not answered.'),
  body: z.string().optional().describe('A suggested body for a support email if the question was not answered.'),
});
export type AnswerFAQOutput = z.infer<typeof AnswerFAQOutputSchema>;

export async function answerFAQ(input: AnswerFAQInput): Promise<AnswerFAQOutput> {
  return answerFAQFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerFAQPrompt',
  input: {schema: AnswerFAQInputSchema},
  output: {schema: AnswerFAQOutputSchema},
  prompt: `You are a professional, friendly, and helpful AI support chatbot for the "Soporte" app. Your goal is to assist users with their technical support questions.

Your persona: Cordial, professional, and very patient. Always greet the user warmly if they start with a greeting.

Your primary knowledge base is the following FAQ document. First, try to answer the user's question based *only* on this document.

FAQ Document:
{{{faq}}}

Analyze the user's question and follow these rules:

1.  **Greeting:** If the user starts with a simple greeting like "Hola" or "Buenos días", respond with a friendly and professional greeting. For example: "¡Hola! Soy tu asistente de Soporte. ¿En qué puedo ayudarte hoy?". Set "answered" to true.

2.  **FAQ-based Answer:** If the user's question can be answered using the FAQ, provide a direct, professional answer. Set "answered" to true.

3.  **Not in FAQ / User is not satisfied:** If the FAQ does not contain the answer, or if the user explicitly says your previous answer wasn't helpful, you MUST do the following:
    - Set "answered" to false.
    - In the "answer" field, write a message like: "No puedo responder tu pregunta con la información que tengo. Sin embargo, puedes contactar a nuestro equipo de soporte para obtener ayuda."
    - Generate a relevant "subject" and "body" for a support email based on the user's original question.
    - The email subject should be concise and descriptive. Example: "Consulta sobre: [resumen de la pregunta del usuario]".
    - The email body should be a template that the user can fill out.

User Question: {{question}}`,
});

const answerFAQFlow = ai.defineFlow(
  {
    name: 'answerFAQFlow',
    inputSchema: AnswerFAQInputSchema,
    outputSchema: AnswerFAQOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
