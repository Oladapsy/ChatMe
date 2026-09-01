import { Stack } from "expo-router";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

export default function SettingsLayout() {
  const { themeColors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: themeColors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="privacy/index" />
      <Stack.Screen name="privacy/last-seen" />
      <Stack.Screen name="privacy/blocked-contacts" />
      <Stack.Screen name="data-storage/index" />
      <Stack.Screen name="data-storage/manage" />
      <Stack.Screen name="data-storage/option" />
    </Stack>
  );
}
