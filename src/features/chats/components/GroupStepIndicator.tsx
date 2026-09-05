import React from "react";
import { StyleSheet, View } from "react-native";
import { Colors } from "@/shared/constants/colors";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

interface Props {
  currentStep: 1 | 2;
  isDark: boolean;
}

export function GroupStepIndicator({ currentStep, isDark }: Props) {
  const { themeColors } = useAppTheme();

  const activeColor = themeColors.primary;
  const inactiveColor = isDark ? "#3A566A" : "#E8F5ED";

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
    marginBottom: 30,
    marginTop: 10,
  },
  stepBar: {
    flex: 1,
    height: 6,
    borderRadius: 100,
  },
});
