import type { Ticket, FaqItem } from './types';

export const initialTickets: Ticket[] = [
  { id: 'TICK-001', subject: 'Problema con la facturación', status: 'En Proceso', date: '2024-07-28' },
  { id: 'TICK-002', subject: 'No puedo acceder a mi cuenta', status: 'Finalizado', date: '2024-07-27' },
  { id: 'TICK-003', subject: 'API no responde', status: 'En Proceso', date: '2024-07-29' },
];

export const faqData: FaqItem[] = [
  {
    question: '¿Cómo prendo el proyector?',
    answer: 'Para prender el proyector, busca el control remoto, presiona el botón rojo de encendido y espera a que la luz se ponga verde. Asegúrate de que esté conectado a la corriente.',
  },
  {
    question: '¿Cómo cambio mi contraseña de Gmail?',
    answer: 'Para cambiar tu contraseña de Gmail, ve a la configuración de tu cuenta de Google, selecciona la pestaña "Seguridad" y busca la opción "Contraseña". Sigue los pasos para cambiarla.',
  },
  {
    question: '¿Cómo comparto un link de Meet?',
    answer: 'Para compartir un enlace de Meet, crea una nueva reunión en Google Meet. Una vez creada, copia el enlace de la reunión y pégalo en un correo, chat o donde necesites compartirlo.',
  },
];

export const faqDocument = faqData.map(item => `P: ${item.question}\nR: ${item.answer}`).join('\n\n');
