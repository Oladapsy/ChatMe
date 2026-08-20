import { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PhoneAuthScreen from "@/features/auth/screens/PhoneAuthScreen";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboarding();
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B074" />
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
