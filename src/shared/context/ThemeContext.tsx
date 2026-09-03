import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/shared/constants/colors";
import { ICON_CONFIGS } from "@/shared/constants/theme";
import { IconThemeId } from "@/shared/types/theme";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  themeColors: typeof Colors.light;
  accentTheme: IconThemeId;
  activeAccentColor: string;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentTheme: (theme: IconThemeId) => void;
  toggleNightMode: (value: boolean) => void;
}

const STORAGE_KEY_MODE = "@chatme_theme_mode";
const STORAGE_KEY_ACCENT = "@chatme_accent_theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [accentTheme, setAccentThemeState] = useState<IconThemeId>("green");

  // Load saved preferences on launch
  useEffect(() => {
    (async () => {
      try {
        const savedMode = await AsyncStorage.getItem(STORAGE_KEY_MODE);
        const savedAccent = await AsyncStorage.getItem(STORAGE_KEY_ACCENT);

        if (savedMode) setThemeModeState(savedMode as ThemeMode);
        if (savedAccent) setAccentThemeState(savedAccent as IconThemeId);
      } catch (e) {
        console.warn("Failed to load theme preference", e);
      }
    })();
  }, []);

  // Compute active dark mode state
  const isDark =
    themeMode === "system"
      ? systemColorScheme === "dark"
      : themeMode === "dark";

  const themeColors = Colors[isDark ? "dark" : "light"];
  const activeAccentColor = ICON_CONFIGS[accentTheme].color;

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
        themeMode,
        isDark,
        themeColors,
        accentTheme,
        activeAccentColor,
        setThemeMode,
        setAccentTheme,
        toggleNightMode,
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