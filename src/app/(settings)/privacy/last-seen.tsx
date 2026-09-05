import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { SubScreenHeader } from "@/shared/components/SubScreenHeader";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import { RadioSelectionRow } from "@/features/settings/components/RadioSelectionRow";

type LastSeenOption = "Everyone" | "My Contact" | "Nobody";

export default function LastSeenScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ title?: string }>();
  const { isDark, themeColors } = useAppTheme();
  const [selected, setSelected] = useState<LastSeenOption>("Everyone");

  const headerTitle = params.title || "Last Seen";

  return (
    <View style={styles.container}>
      <MySafeAreaView
        edges={["top"]}
        color={isDark ? themeColors.headBg : themeColors.primary}
        style={styles.topSafeArea}
      >
        <SubScreenHeader title={headerTitle} onBack={() => router.back()} />
      </MySafeAreaView>

      <MySafeAreaView
        edges={["bottom", "left", "right"]}
        color={themeColors.background}
        style={styles.bodySafeArea}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <RadioSelectionRow
            label="Everyone"
            isSelected={selected === "Everyone"}
            onSelect={() => setSelected("Everyone")}
            isDark={isDark}
            themeColors={themeColors}
          />
          <RadioSelectionRow
            label="My Contact"
            isSelected={selected === "My Contact"}
            onSelect={() => setSelected("My Contact")}
            isDark={isDark}
            themeColors={themeColors}
          />
          <RadioSelectionRow
            label="Nobody"
            isSelected={selected === "Nobody"}
            onSelect={() => setSelected("Nobody")}
            showDivider={false}
            isDark={isDark}
            themeColors={themeColors}
          />

          <Typography
            size={12}
            color={isDark ? themeColors.descText : "#8EA3B3"}
            style={styles.footerNote}
          >
            Users who have your number saved in their contacts will also see it.
          </Typography>
        </ScrollView>
      </MySafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSafeArea: {
    flex: 0,
  },
  bodySafeArea: {
    flex: 1,
  },
  footerNote: {
    paddingHorizontal: 20,
    marginTop: 12,
    lineHeight: 18,
  },
});