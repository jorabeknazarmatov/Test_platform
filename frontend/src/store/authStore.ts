import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  login: string;
  password: string;
  setAuth: (login: string, password: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: '',
      password: '',
      setAuth: (login, password) => set({ isAuthenticated: true, login, password }),
      logout: () => set({ isAuthenticated: false, login: '', password: '' }),
    }),
    {
      name: 'admin-auth',
    }
  )
);
