import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Colors } from "@/shared/constants/colors";

// Prevent auto-hiding until fonts are fully loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme === "dark" ? "dark" : "light"];

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

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: themeColors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)/verify-otp" />
    </Stack>
  );
}
  