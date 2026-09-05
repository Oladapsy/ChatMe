import { useColorScheme } from "react-native";

import { Colors } from "@/shared/constants/colors";
import { ICON_CONFIGS } from "@/shared/constants/theme";
import { useAppearanceStore } from "@/store/appearanceStore";

export function useAppTheme() {
  const scheme = useColorScheme();

  const isDark = scheme === "dark";

  const selectedTheme = useAppearanceStore(
    (state) => state.selectedTheme,
  );

  const baseColors = Colors[isDark ? "dark" : "light"];

  const themeColors = {
    ...baseColors,
    primary: ICON_CONFIGS[selectedTheme].color,
  };

  return {
    isDark,
    selectedTheme,
    themeColors,
  };
}