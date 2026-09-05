import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Colors } from "@/shared/constants/colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "@/shared/context/ThemeContext";
// tanstack
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Prevent auto-hiding until fonts are fully loaded
SplashScreen.preventAutoHideAsync();

// auth user
import { useInitializeAuth } from "@/features/auth/hooks/useInitializeAuth";
import { useAuthStore } from "@/store/authStore";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const { isInitializing } = useInitializeAuth();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // creating tanstack query client
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 2 } },
      }),
  );

  // Load all font files from assets/fonts/
  const [loaded, error] = useFonts({
    "SFProDisplay-Regular": require("@/assets/fonts/SFPRODISPLAYREGULAR.OTF"),
    "SFProDisplay-Bold": require("@/assets/fonts/SFPRODISPLAYBOLD.OTF"),
    "SFProDisplay-Medium": require("@/assets/fonts/SFPRODISPLAYMEDIUM.OTF"),
    "SFProDisplay-BlackItalic": require("@/assets/fonts/SFPRODISPLAYBLACKITALIC.OTF"),
    "SFProDisplay-HeavyItalic": require("@/assets/fonts/SFPRODISPLAYHEAVYITALIC.OTF"),
    "SFProDisplay-LightItalic": require("@/assets/fonts/SFPRODISPLAYLIGHTITALIC.OTF"),
    "SFProDisplay-SemiboldItalic": require("@/assets/fonts/SFPRODISPLAYSEMIBOLDITALIC.OTF"),
    "SFProDisplay-ThinItalic": require("@/assets/fonts/SFPRODISPLAYTHINITALIC.OTF"),
    "SFProDisplay-UltralightItalic": require("@/assets/fonts/SFPRODISPLAYULTRALIGHTITALIC.OTF"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  if (isInitializing) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: themeColors.background },
            }}
          >
            <Stack.Protected guard={!isAuthenticated}>
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="(auth)/verify-otp" />
              <Stack.Screen name="(auth)/setup-profile" />
              <Stack.Screen name="(auth)/upload-photo" />
              <Stack.Screen name="(auth)/setup-pin" />
            </Stack.Protected>
            <Stack.Protected guard={isAuthenticated}>
              <Stack.Screen name="(tabs)" />
            </Stack.Protected>
          </Stack>
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
