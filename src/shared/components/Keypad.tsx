import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import BackspaceIcon from "@/assets/icons/shared/backspace.svg";

interface KeypadProps {
  onPressDigit: (digit: string) => void;
  onDelete: () => void;
}

export default function Keypad({ onPressDigit, onDelete }: KeypadProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "delete"],
  ];

  return (
    <View style={styles.container}>
      {keys.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key, keyIndex) => {
            if (key === "") {
              return <View key={keyIndex} style={styles.key} />;
            }

            if (key === "delete") {
              return (
                <TouchableOpacity
                  key={keyIndex}
                  style={[
                    styles.key,
                    { backgroundColor: isDark ? "#1F3C51" : "#F9FAFB" },
                  ]}
                  onPress={onDelete}
                  activeOpacity={0.7}
                >
                  {BackspaceIcon ? (
                    <BackspaceIcon
                      width={22}
                      height={22}
                      color={themeColors.text}
                    />
                  ) : (
                    <Typography weight="bold" color={themeColors.text}>
                      ⌫
                    </Typography>
                  )}
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={keyIndex}
                style={[
                  styles.key,
                  { backgroundColor: isDark ? "#1F3C51" : "#F9FAFB" },
                ]}
                onPress={() => onPressDigit(key)}
                activeOpacity={0.7}
              >
                <Typography
                  variant="h2"
                  size={22}
                  weight="bold"
                  color={themeColors.text}
                >
                  {key}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 12,
    gap: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
});
