import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  SectionList,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { SubScreenHeader } from "@/shared/components/SubScreenHeader";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

// Reused components & data
import { CallItem } from "@/features/calls/components/CallItem";
import { MOCK_CALL_LOGS } from "@/features/calls/data/mockCallLog";

// Icons
import AddCallIcon from "@/assets/icons/calls/addCall.svg"; 

export default function CallsTabScreen() {
  const router = useRouter();
  const { isDark, themeColors } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate fetching latest calls
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleCallPress = (contactName: string) => {
    // Action: Start audio/video call
    console.log("Initiating call to:", contactName);
  };

  const handleInfoPress = (callId: string) => {
    // Action: Navigate to call detail page
   console.log(`getting info of ${callId}`)
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP HEADER */}
      <MySafeAreaView
        edges={["top"]}
        color={isDark? themeColors.headBg: themeColors.primary}
        style={styles.topSafeArea}
      >
        <SubScreenHeader
          title="Calls"
          showBackButton={false}
          rightAction={
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => console.log("New call pressed")}
            >
              <AddCallIcon width={22} height={22} color="white" />
            </TouchableOpacity>
          }
        />
      </MySafeAreaView>

      {/* 2. CALL LOG LIST */}
      <MySafeAreaView
        edges={["bottom", "left", "right"]}
        color={themeColors.background}
        style={styles.bodySafeArea}
      >
        <SectionList
          sections={MOCK_CALL_LOGS}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={themeColors.primary}
            />
          }
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Typography
                size={12}
                weight="bold"
                color="#6E8597"
                style={styles.sectionTitle}
              >
                {title}
              </Typography>
            </View>
          )}
          renderItem={({ item, index, section }) => (
            <CallItem
              item={item}
              showDivider={index !== section.data.length - 1}
              onPress={() => handleCallPress(item.name)}
              onInfoPress={() => handleInfoPress(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Typography size={16} color={themeColors.textSecondary}>
                No recent calls
              </Typography>
            </View>
          }
        />
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
  iconBtn: {
    padding: 4,
  },
  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    letterSpacing: 0.5,
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: "center",
    justifyContent: "center",
  },
});