import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  SectionList,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import { SubScreenHeader } from "@/shared/components/SubScreenHeader";
import EditIcon from "@/assets/icons/shared/edit.svg";

import { CallItem } from "@/features/calls/components/CallItem";
import { MOCK_CALL_LOGS } from "@/features/calls/data/mockCallLog";

export default function LastCallScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  return (
    <View style={styles.container}>
      {/* 1. Header Safe Area */}
      <MySafeAreaView
        edges={["top"]}
        color={themeColors.headBg}
        style={styles.topSafeArea}
      >
        <SubScreenHeader
          title="Last Call"
          onBack={() => router.back()}
          rightAction={
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => console.log("Edit calls pressed")}
            >
              <EditIcon width={20} height={20} color="white" />
            </TouchableOpacity>
          }
        />
      </MySafeAreaView>

      {/* 2. Call Logs List Safe Area */}
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
              onPress={() => console.log("Call pressed", item.name)}
              onInfoPress={() => console.log("Call info pressed", item.id)}
            />
          )}
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
});
