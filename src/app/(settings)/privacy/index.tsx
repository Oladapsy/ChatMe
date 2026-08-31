import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { SubScreenHeader } from "@/shared/components/SubScreenHeader";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import { PrivacyRowItem } from "@/features/settings/components/PrivacyRowItem";

export default function PrivacyScreen() {
  const router = useRouter();
  const { isDark, themeColors } = useAppTheme();

  return (
    <View style={styles.container}>
      <MySafeAreaView
        edges={["top"]}
        color={themeColors.headBg}
        style={styles.topSafeArea}
      >
        <SubScreenHeader title="Privacy" onBack={() => router.back()} />
      </MySafeAreaView>

      <MySafeAreaView
        edges={["bottom", "left", "right"]}
        color={themeColors.background}
        style={styles.bodySafeArea}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ marginTop: 0 }}
        >
          <PrivacyRowItem
            label="Last Seen"
            value="Everyone"
            onPress={() => router.push("/(settings)/privacy/last-seen")}
            isDark={isDark}
            themeColors={themeColors}
          />
          <PrivacyRowItem
            label="Profile Photo"
            value="My Contact"
            onPress={() => router.push("/(settings)/privacy/last-seen")}
            isDark={isDark}
            themeColors={themeColors}
          />
          <PrivacyRowItem
            label="About"
            value="My Contact"
            onPress={() => router.push("/(settings)/privacy/last-seen")}
            isDark={isDark}
            themeColors={themeColors}
          />
          <PrivacyRowItem
            label="Group"
            value="Everyone"
            onPress={() => router.push("/(settings)/privacy/last-seen")}
            isDark={isDark}
            themeColors={themeColors}
          />
          <PrivacyRowItem
            label="Blocked Contact"
            value="4 Contacts"
            onPress={() => router.push("/(settings)/privacy/blocked-contacts")}
            isDark={isDark}
            themeColors={themeColors}
          />
          <PrivacyRowItem
            label="Face ID"
            onPress={() => {}}
            isDark={isDark}
            themeColors={themeColors}
          />

          <Typography
            size={12}
            color={isDark ? themeColors.descText : "#8EA3B3"}
            style={styles.footerNote}
          >
            With face ID, you can secure your apps
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
    marginTop: 10,
  },
});
