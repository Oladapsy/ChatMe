import { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PhoneAuthScreen from "@/features/auth/screens/PhoneAuthScreen";
import { Colors } from "@/shared/constants/colors";
import { api } from "@/services/api";
import { useInitializeAuth } from "@/features/auth/hooks/useInitializeAuth";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const { isInitializing: isAuthInitializing, isAuthenticated } =
    useInitializeAuth();

  // testing endpoint
  async function checkHealth() {
    try {
      console.log("Testing API...");

      const response = await api.get("/health");

      console.log("Health response:", response.data);
    } catch (error) {
      console.error("Health check failed:", error);
    }
  }

  useEffect(() => {
    checkOnboarding();
    checkHealth();
  }, []);

  const checkOnboarding = async () => {
    try {
      const hasSeen = await AsyncStorage.getItem("@has_seen_onboarding");
      if (!hasSeen) {
        router.replace("/onboarding");
      } else {
        setLoading(false);
        // router.replace("/(tabs)");
      }
    } catch {
      setLoading(false);
    }
  };

  if (isAuthInitializing) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator
        size="large"
        color={Colors.light.primary}
      />
    </View>
  );
}

  return <PhoneAuthScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
