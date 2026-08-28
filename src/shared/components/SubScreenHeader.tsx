import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import BackIcon from "@/assets/icons/shared/chevron-left.svg";

interface Props {
  title: string;
  onBack: () => void;
  rightAction?: React.ReactNode;
}

export function SubScreenHeader({ title, onBack, rightAction }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  return (
    <View style={[styles.header, { backgroundColor: themeColors.headBg }]}>
      <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
        <BackIcon width={24} height={24} color={"white"} />
      </TouchableOpacity>

      <Typography size={18} weight="bold" color={"white"}>
        {title}
      </Typography>

      <View style={styles.rightActionSlot}>
        {rightAction ?? <View style={styles.placeholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 64,
  },
  iconBtn: {
    padding: 4,
  },
  rightActionSlot: {
    minWidth: 32,
    alignItems: "flex-end",
  },
  placeholder: {
    width: 24,
  },
});
