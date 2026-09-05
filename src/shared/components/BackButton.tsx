import ChevronLeft from "@/assets/icons/auth/chevron-left.svg";
import { Typography } from "@/shared/components/Typography";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";

interface BackButtonProps {
  onPress?: () => void;
  showBorder?: boolean;
  Iconcolor?: string;
}

export function BackButton({
  onPress,
  showBorder = true,
  Iconcolor,
}: BackButtonProps) {
  const router = useRouter();
      const { isDark, themeColors } = useAppTheme();


  const activeIconColor = Iconcolor || themeColors.text;

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
        showBorder
          ? {
              borderColor: themeColors.border,
              backgroundColor: themeColors.cardBackground,
              borderWidth: 1,
            }
          : {
              borderWidth: 0,
              backgroundColor: "transparent",
            },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {ChevronLeft ? (
        <ChevronLeft width={20} height={20} color={activeIconColor} />
      ) : (
        <Typography color={activeIconColor}>←</Typography>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});