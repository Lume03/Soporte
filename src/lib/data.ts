import type { Ticket, FaqItem } from './types';

export const initialTickets: Ticket[] = [
  { id: 'TICK-001', subject: 'Problema con la facturación', status: 'En Proceso', date: '2024-07-28' },
  { id: 'TICK-002', subject: 'No puedo acceder a mi cuenta', status: 'Finalizado', date: '2024-07-27' },
  { id: 'TICK-003', subject: 'API no responde', status: 'En Proceso', date: '2024-07-29' },
];

export const faqData: FaqItem[] = [
  {
    question: '¿Cómo puedo restablecer mi contraseña?',
    answer: 'Para restablecer tu contraseña, ve a la página de inicio de sesión y haz clic en "¿Olvidaste tu contraseña?". Sigue las instrucciones que se te envíen a tu correo electrónico.',
  },
  {
    question: '¿Dónde puedo encontrar mis facturas?',
    answer: 'Tus facturas están disponibles en la sección "Facturación" de la configuración de tu cuenta. Puedes ver y descargar todas tus facturas anteriores desde allí.',
  },
  {
    question: '¿Ofrecen un período de prueba gratuito?',
    answer: 'Sí, ofrecemos un período de prueba gratuito de 14 días para todos nuestros planes. No se requiere tarjeta de crédito para registrarse en la prueba.',
  },
  {
    question: '¿Cómo puedo cancelar mi suscripción?',
    answer: 'Puedes cancelar tu suscripción en cualquier momento desde la sección "Suscripción" en la configuración de tu cuenta. Tu suscripción permanecerá activa hasta el final del ciclo de facturación actual.',
  },
];

export const faqDocument = faqData.map(item => `P: ${item.question}\nR: ${item.answer}`).join('\n\n');
