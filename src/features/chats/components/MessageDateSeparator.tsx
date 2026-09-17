import React from "react";
import { StyleSheet, View } from "react-native";

import { Typography } from "@/shared/components/Typography";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

interface Props {
  label: string;
}

export function MessageDateSeparator({ label }: Props) {
  const { themeColors } = useAppTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.separator,
          { backgroundColor: themeColors.cardBackground },
        ]}
      >
        <Typography size={12} weight="medium" color={themeColors.textSecondary}>
          {label}
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 10,
  },
  separator: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
});
