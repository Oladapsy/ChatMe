import { create } from "zustand";

import { IconThemeId } from "@/shared/types/theme";

type AppearanceState = {
  selectedTheme: IconThemeId;
  setSelectedTheme: (theme: IconThemeId) => void;
};

export const useAppearanceStore = create<AppearanceState>((set) => ({
  selectedTheme: "green",

  setSelectedTheme: (theme) => {
    set({ selectedTheme: theme });
  },
}));