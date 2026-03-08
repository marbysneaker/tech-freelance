import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, Ticket, Role } from '../types';
import { signIn, signOut, restoreSession } from '../lib/auth';
import { ticketsApi, usersApi } from '../lib/api';

interface AppState {
  currentUser: User | null;
  users: User[];
  tickets: Ticket[];
  darkMode: boolean;
  loading: boolean;
  toggleDarkMode: () => void;
  login: (email: string, password: string) => Promise<Role>;
  logout: () => void;
  addTicket: (data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<void>;
  assignTicket: (ticketId: string, techId: string) => Promise<void>;
  claimTicket: (ticketId: string) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: Ticket['status']) => Promise<void>;
  refreshTickets: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

function loadDarkMode(): boolean {
  try {
    const raw = localStorage.getItem('darkMode');
    return raw ? JSON.parse(raw) : true;
  } catch {
    return true;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(loadDarkMode);
  const [loading, setLoading] = useState<boolean>(true);

  // Apply theme
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Restore Cognito session on mount
  useEffect(() => {
    restoreSession().then((authUser) => {
      if (authUser) {
        setCurrentUser({ id: authUser.id, name: authUser.name, role: authUser.role });
        setAccessToken(authUser.accessToken);
      }
      setLoading(false);
    });
  }, []);

  // Fetch data when user logs in
  useEffect(() => {
    if (!currentUser || !accessToken) return;

    const fetchData = async () => {
      try {
        const [ticketData, userData] = await Promise.all([
          ticketsApi.list(accessToken),
          usersApi.list(accessToken),
        ]);
        setTickets(ticketData);
        setUsers(userData);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };

    fetchData();
  }, [currentUser, accessToken]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const login = async (email: string, password: string): Promise<Role> => {
    const authUser = await signIn(email, password);
    setCurrentUser({ id: authUser.id, name: authUser.name, role: authUser.role });
    setAccessToken(authUser.accessToken);
    return authUser.role;
  };

  const logout = () => {
    signOut();
    setCurrentUser(null);
    setAccessToken('');
    setTickets([]);
    setUsers([]);
  };

  const refreshTickets = useCallback(async () => {
    if (!accessToken) return;
    const data = await ticketsApi.list(accessToken);
    setTickets(data);
  }, [accessToken]);

  const addTicket = async (data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const created = await ticketsApi.create(accessToken, data);
    setTickets((prev) => [...prev, created]);
  };

  const assignTicket = async (ticketId: string, techId: string) => {
    const updated = await ticketsApi.update(accessToken, ticketId, {
      status: 'assigned',
      assignedTo: techId,
    });
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
  };

  const claimTicket = async (ticketId: string) => {
    if (!currentUser) return;
    const updated = await ticketsApi.update(accessToken, ticketId, {
      status: 'assigned',
      assignedTo: currentUser.id,
    });
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
  };

  const updateTicketStatus = async (ticketId: string, status: Ticket['status']) => {
    const updated = await ticketsApi.update(accessToken, ticketId, { status });
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        tickets,
        darkMode,
        loading,
        toggleDarkMode,
        login,
        logout,
        addTicket,
        assignTicket,
        claimTicket,
        updateTicketStatus,
        refreshTickets,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
