import ChevronLeft from "@/assets/icons/auth/chevron-left.svg";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native";

interface BackButtonProps {
  onPress?: () => void;
}

export function BackButton({ onPress }: BackButtonProps) {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={[
        styles.container,
        {
          borderColor: themeColors.border,
          backgroundColor: themeColors.cardBackground,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {ChevronLeft ? (
        <ChevronLeft width={20} height={20} color={themeColors.text} />
      ) : (
        <Typography color={themeColors.text}>←</Typography>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});