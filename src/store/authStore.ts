import { create } from "zustand";

type AuthState = {
  isAuthenticated: boolean;
  profileComplete: boolean;

  setAuthenticated: (value: boolean) => void;
  setProfileComplete: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  profileComplete: false,

  setAuthenticated: (value) => {
    set({ isAuthenticated: value });
  },
  setProfileComplete: (value) => {
    set({ profileComplete: value });
  },
}));