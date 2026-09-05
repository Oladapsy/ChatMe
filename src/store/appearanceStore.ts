import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { IconThemeId } from "@/shared/types/theme";

type AppearanceState = {
  selectedTheme: IconThemeId;
  setSelectedTheme: (theme: IconThemeId) => void;
};

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      selectedTheme: "green",

      setSelectedTheme: (theme) => {
        set({ selectedTheme: theme });
      },
    }),
    {
      name: "chatme-appearance",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
