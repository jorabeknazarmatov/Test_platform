import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  login: string;
  password: string;
  isAuthenticated: boolean;
  setAuth: (login: string, password: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      login: '',
      password: '',
      isAuthenticated: false,
      setAuth: (login, password) =>
        set({ login, password, isAuthenticated: true }),
      logout: () => set({ login: '', password: '', isAuthenticated: false }),
    }),
    {
      name: 'admin-auth',
    }
  )
);
