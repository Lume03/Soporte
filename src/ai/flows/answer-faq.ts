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
  prompt: `You are a professional AI support chatbot. Your goal is to answer user questions based *only* on the provided FAQ document.

Analyze the user's question and determine if it can be answered using the FAQ.

- If you can answer the question, set "answered" to true and provide a direct, professional answer in the "answer" field.
- If the FAQ document does not contain the answer, you MUST set "answered" to false. In the "answer" field, write a message like: "No puedo responder tu pregunta con la información que tengo. Sin embargo, puedes contactar a nuestro equipo de soporte para obtener ayuda."
- If the question was not answered, you MUST also generate a relevant "subject" and "body" for a support email based on the user's question. The body should be a template that the user can fill out.

FAQ Document:
{{{faq}}}

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
