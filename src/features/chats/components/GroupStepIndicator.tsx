import React from "react";
import { StyleSheet, View } from "react-native";
import { Colors } from "@/shared/constants/colors";

interface Props {
  currentStep: 1 | 2;
  isDark: boolean;
}

export function GroupStepIndicator({ currentStep, isDark }: Props) {
  const activeColor = Colors.light.primary;
  const inactiveColor = isDark ? "#254156" : "#E5E7EB";

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.stepBar,
          { backgroundColor: currentStep >= 1 ? activeColor : inactiveColor },
        ]}
      />
      <View
        style={[
          styles.stepBar,
          { backgroundColor: currentStep === 2 ? activeColor : inactiveColor },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  stepBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
});