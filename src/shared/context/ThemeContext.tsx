import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/shared/constants/colors";
import { ICON_CONFIGS } from "@/shared/constants/theme";
import { IconThemeId } from "@/shared/types/theme";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  isDark: boolean;
  themeMode: ThemeMode;
  accentTheme: IconThemeId;
  activeThemeColor: string;
  themeColors: typeof Colors.light & { primary: string };
  setThemeMode: (mode: ThemeMode) => void;
  toggleNightMode: (value: boolean) => void;
  setAccentTheme: (theme: IconThemeId) => void;
}

const STORAGE_KEY_MODE = "@chatme_theme_mode";
const STORAGE_KEY_ACCENT = "@chatme_accent_theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [accentTheme, setAccentThemeState] = useState<IconThemeId>("green");

  useEffect(() => {
    (async () => {
      try {
        const savedMode = await AsyncStorage.getItem(STORAGE_KEY_MODE);
        const savedAccent = await AsyncStorage.getItem(STORAGE_KEY_ACCENT);

        if (savedMode) setThemeModeState(savedMode as ThemeMode);
        if (savedAccent) setAccentThemeState(savedAccent as IconThemeId);
      } catch (error) {
        console.warn("Failed to load saved theme:", error);
      }
    })();
  }, []);

  const isDark =
    themeMode === "system"
      ? systemColorScheme === "dark"
      : themeMode === "dark";

  const activeThemeColor = ICON_CONFIGS[accentTheme].color;

  // Dynamically inject the selected accent theme color into themeColors.primary
  const themeColors = {
    ...Colors[isDark ? "dark" : "light"],
    primary: activeThemeColor,
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(STORAGE_KEY_MODE, mode).catch(console.error);
  };

  const toggleNightMode = (value: boolean) => {
    setThemeMode(value ? "dark" : "light");
  };

  const setAccentTheme = (theme: IconThemeId) => {
    setAccentThemeState(theme);
    AsyncStorage.setItem(STORAGE_KEY_ACCENT, theme).catch(console.error);
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        themeMode,
        accentTheme,
        activeThemeColor,
        themeColors,
        setThemeMode,
        toggleNightMode,
        setAccentTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return context;
}