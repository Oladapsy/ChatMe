import React from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TextInputProps,
  useColorScheme,
} from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";

interface Props extends TextInputProps {
  label: string;
  icon?: React.ReactNode;
  focused?: boolean;
}

export function FormInput({ label, icon, focused, ...props }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const borderColor = focused ? "#52C47C" : isDark ? "#6E8597" : "#EAEEF2";
  const placeholderColor = isDark ? "#536878" : "#94A3B8";

  return (
    <View style={styles.container}>
      <Typography
        size={14}
        weight="medium"
        color={isDark ? "#DDE2E8" : "#1F3C51"}
        style={styles.label}
      >
        {label}
      </Typography>
      <View style={[styles.inputWrapper, { backgroundColor: themeColors.background, borderColor }]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[styles.input, { color: themeColors.text }]}
          placeholderTextColor={placeholderColor}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    height: 56,
  },
  iconContainer: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
});
