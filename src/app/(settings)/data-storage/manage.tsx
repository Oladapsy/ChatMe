import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { SubScreenHeader } from "@/shared/components/SubScreenHeader";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import { StorageUsageBar } from "@/features/settings/components/StorageUsageBar";
import { MOCK_STORAGE_CHATS } from "@/features/settings/data/settingsData";

export default function ManageStorageScreen() {
  const router = useRouter();
  const { isDark, themeColors } = useAppTheme();

  return (
    <View style={styles.container}>
      <MySafeAreaView
        edges={["top"]}
        color={themeColors.headBg}
        style={styles.topSafeArea}
      >
        <SubScreenHeader title="Manage Storage" onBack={() => router.back()} />
      </MySafeAreaView>

      <MySafeAreaView
        edges={["bottom", "left", "right"]}
        color={themeColors.background}
        style={styles.bodySafeArea}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Storage Bar Segment */}
          <StorageUsageBar usedMb="2,1 GB" freeGb="62,5 GB" />

          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? "#1C2930" : "#E8EEF2" },
            ]}
          />

          {/* Action Button */}
          <TouchableOpacity style={styles.clearButton} activeOpacity={0.7}>
            <Typography size={16} weight="bold" color={themeColors.primary}>
              Clear Cache
            </Typography>
          </TouchableOpacity>

          {/* Chat Section List */}
          <Typography
            size={18}
            weight="bold"
            color={themeColors.text}
            style={styles.chatTitle}
          >
            Chat
          </Typography>

          {MOCK_STORAGE_CHATS.map((item) => (
            <View key={item.id} style={styles.chatRow}>
              <Image
                source={{ uri: item.avatar }}
                style={[
                  styles.avatar,
                  { backgroundColor: isDark ? "#1E2C33" : "#E0E0E0" },
                ]}
              />
              <View style={styles.chatDetails}>
                <Typography size={16} weight="bold" color={themeColors.text}>
                  {item.name}
                </Typography>
                <Typography
                  size={13}
                  color={isDark ? themeColors.descText : "#8EA3B3"}
                  style={styles.phoneText}
                >
                  {item.phone}
                </Typography>
              </View>
              <Typography size={15} color={themeColors.text} weight="medium">
                {item.size}
              </Typography>
            </View>
          ))}
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  clearButton: {
    paddingVertical: 12,
  },
  chatTitle: {
    marginTop: 20,
    marginBottom: 16,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  chatDetails: {
    flex: 1,
    marginLeft: 14,
  },
  phoneText: {
    marginTop: 2,
  },
});
