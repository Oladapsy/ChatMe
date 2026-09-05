import React from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { Colors } from "@/shared/constants/colors";
import { Typography, TypographyWeight } from "@/shared/components/Typography";
import { useAppTheme } from "../hooks/useAppTheme";

export type ButtonVariant = "filled" | "outlined" | "text";

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  textWeight?: TypographyWeight; // Added textWeight prop
  style?: ViewStyle | ViewStyle[];
  onPress: () => void;
}

export function Button({
  title,
  variant = "filled",
  loading = false,
  disabled = false,
  fullWidth = true,
  textWeight = "semibold",
  style,
  onPress,
  ...props
}: ButtonProps) {
  const { themeColors } = useAppTheme();

  const isFilled = variant === "filled";
  const isOutlined = variant === "outlined";

  // Determine dynamic background and text colors based on variant & state
  const backgroundColor = isFilled ? themeColors.primary : "transparent";

  const borderColor = isOutlined ? themeColors.primary : "transparent";

  const textColor = isFilled
    ? themeColors.buttonText
    : themeColors.textSecondary;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        {
          backgroundColor,
          borderColor,
          borderWidth: isOutlined ? 1.5 : 0,
        },
        (disabled || loading) && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Typography
          variant="body"
          weight={textWeight}
          color={textColor}
          align="center"
        >
          {title}
        </Typography>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
});
