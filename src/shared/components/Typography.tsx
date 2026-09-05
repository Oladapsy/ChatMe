import React from "react";
import {
  StyleSheet,
  Text as RNText,
  TextProps as RNTextProps,
} from "react-native";
import { Colors } from "@/shared/constants/colors";
import { Fonts } from "@/shared/constants/fonts";
import { useAppTheme } from "../hooks/useAppTheme";

export type TypographyVariant =
  | "h1"
  | "h2"
  | "title"
  | "subtitle"
  | "body"
  | "caption"
  | "small";

export type TypographyWeight = "regular" | "medium" | "semibold" | "bold";

export interface TypographyProps extends RNTextProps {
  variant?: TypographyVariant;
  weight?: TypographyWeight;
  size?: number;
  lineHeight?: number;
  color?: string;
  secondary?: boolean;
  align?: "auto" | "left" | "right" | "center" | "justify";
  children: React.ReactNode;
}

export function Typography({
  variant = "body",
  weight = "regular",
  size,
  lineHeight,
  color,
  secondary = false,
  align = "left",
  style,
  children,
  ...props
}: TypographyProps) {
  const { isDark, themeColors } = useAppTheme();


  const defaultTextColor = secondary
    ? themeColors.textSecondary
    : themeColors.text;

  return (
    <RNText
      style={[
        styles.base,
        styles[variant],
        styles[weight],
        {
          color: color || defaultTextColor,
          textAlign: align,
          ...(size && { fontSize: size }),
          ...(lineHeight && { lineHeight }),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

// Preset Title component for quick exports/usage
export default function Title(props: Omit<TypographyProps, "variant">) {
  return <Typography variant="h1" weight="bold" {...props} />;
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
  // Font Sizes & Line Heights
  h1: {
    fontSize: 28,
    lineHeight: 34,
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  small: {
    fontSize: 11,
    lineHeight: 14,
  },

  // Font Families (custom SF Pro Display mappings)
  regular: {
    fontFamily: Fonts.family.regular,
  },
  medium: {
    fontFamily: Fonts.family.medium,
  },
  semibold: {
    fontFamily: Fonts.family.bold, // Mapped to SF Pro Semibold
  },
  bold: {
    fontFamily: Fonts.family.bold,
  },
});
