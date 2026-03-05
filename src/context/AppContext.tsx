import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Ticket } from '../types';

interface AppState {
  currentUser: User | null;
  users: User[];
  tickets: Ticket[];
  darkMode: boolean;
  toggleDarkMode: () => void;
  login: (user: User) => void;
  logout: () => void;
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  assignTicket: (ticketId: string, techId: string) => void;
  claimTicket: (ticketId: string) => void;
  updateTicketStatus: (ticketId: string, status: Ticket['status']) => void;
}

const AppContext = createContext<AppState | null>(null);

const SEED_USERS: User[] = [
  { id: '1', name: 'John Customer', role: 'user' },
  { id: '2', name: 'Sarah Admin', role: 'admin' },
  { id: '3', name: 'Mike Tech', role: 'tech' },
  { id: '4', name: 'Lisa Tech', role: 'tech' },
];

function loadState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadState('currentUser', null));
  const [users] = useState<User[]>(() => loadState('users', SEED_USERS));
  const [tickets, setTickets] = useState<Ticket[]>(() => loadState('tickets', []));
  const [darkMode, setDarkMode] = useState<boolean>(() => loadState('darkMode', true));

  useEffect(() => { localStorage.setItem('currentUser', JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem('tickets', JSON.stringify(tickets)); }, [tickets]);
  useEffect(() => { localStorage.setItem('users', JSON.stringify(users)); }, [users]);
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);


  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const login = (user: User) => setCurrentUser(user);
  const logout = () => setCurrentUser(null);

  const addTicket = (data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const now = new Date().toISOString();
    setTickets(prev => [...prev, {
      ...data,
      id: crypto.randomUUID(),
      status: 'open',
      createdAt: now,
      updatedAt: now,
    }]);
  };

  const assignTicket = (ticketId: string, techId: string) => {
    setTickets(prev => prev.map(t =>
      t.id === ticketId ? { ...t, assignedTo: techId, status: 'assigned', updatedAt: new Date().toISOString() } : t
    ));
  };

  const claimTicket = (ticketId: string) => {
    if (!currentUser) return;
    setTickets(prev => prev.map(t =>
      t.id === ticketId ? { ...t, assignedTo: currentUser.id, status: 'assigned', updatedAt: new Date().toISOString() } : t
    ));
  };

  const updateTicketStatus = (ticketId: string, status: Ticket['status']) => {
    setTickets(prev => prev.map(t =>
      t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t
    ));
  };

  return (
    <AppContext.Provider value={{ currentUser, users, tickets, darkMode, toggleDarkMode, login, logout, addTicket, assignTicket, claimTicket, updateTicketStatus }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
