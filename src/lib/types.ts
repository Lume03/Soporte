export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  answered?: boolean;
  subject?: string;
  body?: string;
  showFeedback?: boolean;
  feedbackReceived?: boolean;
  showContactSupport?: boolean;
};

export type TicketStatus = 'En Proceso' | 'Finalizado';

export type Ticket = {
  id: string;
  subject: string;
  status: TicketStatus;
  date: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};
export interface Servicio {
  id: number; 
  nombre: string;
}
export type Cliente = {
  id: number;
  nombre: string;
  dominio: string; 
};