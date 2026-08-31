import { useColorScheme } from "react-native";
import { Colors } from "@/shared/constants/colors";

export function useAppTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  return { isDark, themeColors };
}


// usage!!!
// import { useAppTheme } from "@/shared/hooks/useAppTheme";

// export function CallItem({ /* ... */ }) {
//   const { isDark, themeColors } = useAppTheme(); // Much cleaner

  // ...rest of component
// }