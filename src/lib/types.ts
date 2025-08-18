export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  answered?: boolean;
  subject?: string;
  body?: string;
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
