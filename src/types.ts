export type Role = 'user' | 'admin' | 'tech';

export type TicketStatus = 'open' | 'assigned' | 'in-progress' | 'completed';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: TicketStatus;
  submittedBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}
