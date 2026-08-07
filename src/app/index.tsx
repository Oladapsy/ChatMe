import { Text, View, StyleSheet } from "react-native";
import Onboarding1 from "@/assets/icons/onboarding/onboarding1.svg";
import Onboarding2 from "@/assets/icons/onboarding/onboarding2.svg";
import Onboarding3 from "@/assets/icons/onboarding/onboarding3.svg";



export default function Index() {
  return (
    <View style={styles.container}>
      <Text>Edit src/app/index.tsx to edit this screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
