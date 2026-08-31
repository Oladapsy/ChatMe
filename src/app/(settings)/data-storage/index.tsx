import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { SubScreenHeader } from "@/shared/components/SubScreenHeader";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import { PrivacyRowItem } from "@/features/settings/components/PrivacyRowItem";

export default function DataAndStorageScreen() {
  const router = useRouter();
  const { isDark, themeColors } = useAppTheme();

  return (
    <View style={styles.container}>
      <MySafeAreaView
        edges={["top"]}
        color={themeColors.headBg}
        style={styles.topSafeArea}
      >
        <SubScreenHeader
          title="Data and Storage"
          onBack={() => router.back()}
        />
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
          {/* Manage Storage Row */}
          <PrivacyRowItem
            label="Manage Storage"
            onPress={() => router.push("/(settings)/data-storage/manage")}
            isDark={isDark}
            themeColors={themeColors}
          />

          {/* Section Header */}
          <Typography
            size={12}
            weight="bold"
            color={isDark ? themeColors.descText : "#8EA3B3"}
            style={styles.sectionHeader}
          >
            AUTO DOWNLOAD
          </Typography>

          {/* Media Option Items */}
          <PrivacyRowItem
            label="Photos"
            value="Off"
            onPress={() =>
              router.push({
                pathname: "/(settings)/data-storage/option",
                params: { title: "Photos" },
              })
            }
            isDark={isDark}
            themeColors={themeColors}
          />
          <PrivacyRowItem
            label="Audio"
            value="Wi-Fi"
            onPress={() =>
              router.push({
                pathname: "/(settings)/data-storage/option",
                params: { title: "Audio" },
              })
            }
            isDark={isDark}
            themeColors={themeColors}
          />
          <PrivacyRowItem
            label="Documents"
            value="Wi-Fi and Cellular"
            onPress={() =>
              router.push({
                pathname: "/(settings)/data-storage/option",
                params: { title: "Documents" },
              })
            }
            isDark={isDark}
            themeColors={themeColors}
          />
          <PrivacyRowItem
            label="Videos"
            value="Off"
            onPress={() =>
              router.push({
                pathname: "/(settings)/data-storage/option",
                params: { title: "Videos" },
              })
            }
            isDark={isDark}
            themeColors={themeColors}
          />
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
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
});
