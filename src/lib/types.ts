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
export type Servicio = {
  id_servicio: string; 
  nombre: string;
};

export type FormState = {
  success: boolean;
  message: string;
};

export type Cliente = {
  id_cliente: string; 
  nombre: string;
};


export type ClienteDetalle = {
  id_cliente: string;
  nombre: string;
  dominio: string;
  servicios: Servicio[]; 
};

export type ClienteFormInput = {
  nombre_cliente: string;
  dominio: string;
  servicios_ids: string[]; 
};

export type Prompt = {
  id_prompt: number;
  descripcion: string;
};