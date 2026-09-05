import BackspaceIcon from "@/assets/icons/shared/backspace.svg";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import {
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";

interface KeypadProps {
  onPressDigit: (digit: string) => void;
  onDelete: () => void;
}

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "delete"],
];

export default function Keypad({ onPressDigit, onDelete }: KeypadProps) {
    const { isDark, themeColors } = useAppTheme();


  const keyBgColor =
    themeColors.cardBackground || (isDark ? "#1F3C51" : "#F9FAFB");

  return (
    <View style={styles.container}>
      {KEYS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key, keyIndex) => {
            if (key === "") {
              return <View key={keyIndex} style={styles.key} />;
            }

            if (key === "delete") {
              return (
                <TouchableOpacity
                  key={keyIndex}
                  accessibilityRole="button"
                  accessibilityLabel="Delete last digit"
                  style={[styles.key, { backgroundColor: keyBgColor }]}
                  onPress={onDelete}
                  activeOpacity={0.7}
                >
                  <BackspaceIcon
                    width={22}
                    height={22}
                    color={themeColors.text}
                  />
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={keyIndex}
                style={[styles.key, { backgroundColor: keyBgColor }]}
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
