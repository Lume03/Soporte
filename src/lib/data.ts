import type { Ticket, FaqItem } from './types';

export const initialTickets: Ticket[] = [
  { id: 'SOL-001', subject: 'Problema con la facturación', status: 'En Proceso', date: '2024-07-28' },
  { id: 'SOL-002', subject: 'No puedo acceder a mi cuenta', status: 'Finalizado', date: '2024-07-27' },
  { id: 'SOL-003', subject: 'API no responde', status: 'En Proceso', date: '2024-07-29' },
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

const statusToUi: { [key: string]: string } = {
  abierto: "Aceptado",
  aceptado: "Aceptado",
  "en atencion": "En Atención",
  "en atención": "En Atención",
  cerrado: "Finalizado",
  finalizado: "Finalizado",
  rechazado: "Cancelado",
  cancelado: "Cancelado",
};

// Mapea los estados de la UI a los que espera recibir el backend
const statusToBackend: { [key: string]: string } = {
  Aceptado: "Abierto",
  "En Atención": "En Atención",
  Finalizado: "Cerrado",
  Cancelado: "Rechazado",
};

/**
 * Convierte un estado del backend al formato de la UI.
 */
export const toUiStatus = (backendStatus?: string): string => {
  if (!backendStatus) return "-";
  // Normaliza el texto para que coincida con las claves del mapa
  const normalized = backendStatus
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  return statusToUi[normalized] || backendStatus;
};

/**
 * Convierte un estado de la UI al formato que el backend espera.
 */
export const fromUiStatus = (uiStatus: string): string => {
  return statusToBackend[uiStatus] || uiStatus;
};