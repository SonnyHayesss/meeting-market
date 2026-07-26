import { create } from "zustand";
import { api } from "../lib/api";
import type { User } from "../types";

type AuthState = {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  loadMe: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  loadMe: async () => {
    try {
      const { user } = await api.me();
      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
  logout: async () => {
    await api.logout();
    set({ user: null });
  }
}));
