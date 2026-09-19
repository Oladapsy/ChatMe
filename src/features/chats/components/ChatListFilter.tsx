import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { Typography } from "@/shared/components/Typography";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

type Filter = "all" | "favorites";

interface Props {
  activeFilter: Filter;
  onChange: (filter: Filter) => void;
}

export function ChatListFilter({ activeFilter, onChange }: Props) {
  const { themeColors } = useAppTheme();

  return (
    <View style={[styles.container, { borderBottomColor: themeColors.dot }]}>
      <TouchableOpacity style={styles.tab} onPress={() => onChange("all")}>
        <Typography
          size={15}
          weight={activeFilter === "all" ? "semibold" : "regular"}
          color={
            activeFilter === "all"
              ? themeColors.primary
              : themeColors.textSecondary
          }
        >
          All
        </Typography>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => onChange("favorites")}
      >
        <Typography
          size={15}
          weight={activeFilter === "favorites" ? "semibold" : "regular"}
          color={
            activeFilter === "favorites"
              ? themeColors.primary
              : themeColors.textSecondary
          }
        >
          Favorites
        </Typography>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    // borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 1,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
});
