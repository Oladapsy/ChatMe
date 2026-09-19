import { create } from "zustand";

type AuthState = {
  isAuthenticated: boolean;
  profileComplete: boolean;
  avatarUrl: string | null;

  setAuthenticated: (value: boolean) => void;
  setProfileComplete: (value: boolean) => void;
  setAvatarUrl: (value: string | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  profileComplete: false,
  avatarUrl: null,

  setAuthenticated: (value) => {
    set({ isAuthenticated: value });
  },

  setProfileComplete: (value) => {
    set({ profileComplete: value });
  },

  setAvatarUrl: (value) => {
    set({ avatarUrl: value });
  },
}));
