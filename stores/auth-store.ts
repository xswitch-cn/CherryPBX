import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  user_id: number;
  super_admin: number;
  extn: string;
  system_roles: {
    senior_roles_str: string;
    roles_str: string;
  };
  currentAuthority: string;
  name: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setToken: (token) => set({ token, isAuthenticated: !!token }),

      setUser: (user) => set({ user }),

      login: (token, user) => set({ token, user, isAuthenticated: true }),

      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
