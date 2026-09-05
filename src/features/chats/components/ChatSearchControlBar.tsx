import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Typography } from "@/shared/components/Typography";
import ChevronUpIcon from "@/assets/icons/chat/chevronUp.svg";
import ChevronDownIcon from "@/assets/icons/chat/chevronDown.svg";
import { Colors } from "@/shared/constants/colors";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

interface Props {
  currentIndex: number;
  totalCount: number;
  onNext: () => void;
  onPrev: () => void;
  isDark: boolean;
}

export function ChatSearchControlBar({
  currentIndex,
  totalCount,
  onNext,
  onPrev,
  isDark,
}: Props) {
  if (totalCount === 0) return null;
  const { themeColors } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0D2131" : "#FFFFFF" },
      ]}
    >
      <Typography size={16} color={themeColors.primary} weight="medium">
        {currentIndex + 1} from {totalCount}
      </Typography>

      <View style={styles.arrowsRow}>
        <TouchableOpacity onPress={onPrev} style={styles.iconBtn}>
          <ChevronDownIcon width={20} height={20} color="#6E8597" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onNext} style={styles.iconBtn}>
          <ChevronUpIcon width={20} height={20} color="#6E8597" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  arrowsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
});
