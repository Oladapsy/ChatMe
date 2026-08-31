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

import { CallItem, CallLog } from "@/features/calls/components/CallItem";

interface CallSection {
  title: string;
  data: CallLog[];
}

const MOCK_CALL_LOGS: CallSection[] = [
  {
    title: "TODAY",
    data: [
      {
        id: "1",
        name: "Annie Miles",
        avatar: "https://i.pravatar.cc/150?img=32",
        type: "incoming",
        time: "10:30 PM",
      },
      {
        id: "2",
        name: "Wade Warren",
        avatar: "https://i.pravatar.cc/150?img=12",
        type: "outgoing",
        time: "10:00 PM",
      },
      {
        id: "3",
        name: "Guy Hawkins",
        avatar: "https://i.pravatar.cc/150?img=60",
        type: "missed",
        time: "08:32 PM",
      },
    ],
  },
  {
    title: "YESTERDAY",
    data: [
      {
        id: "4",
        name: "Robert Fox",
        avatar: "https://i.pravatar.cc/150?img=68",
        type: "outgoing",
        time: "11:11 PM",
      },
      {
        id: "5",
        name: "Savannah Nguyen",
        avatar: "https://i.pravatar.cc/150?img=47",
        type: "incoming",
        time: "10:22 PM",
      },
      {
        id: "6",
        name: "Albet Flores",
        avatar: "https://i.pravatar.cc/150?img=59",
        type: "outgoing",
        time: "10:10 PM",
      },
      {
        id: "7",
        name: "Annette Black",
        avatar: "https://i.pravatar.cc/150?img=26",
        type: "incoming",
        time: "09:31 PM",
      },
      {
        id: "8",
        name: "Floyd Miles",
        avatar: "https://i.pravatar.cc/150?img=20",
        type: "outgoing",
        time: "09:00 PM",
      },
      {
        id: "9",
        name: "Kathryn Murphy",
        avatar: "https://i.pravatar.cc/150?img=49",
        type: "incoming",
        time: "08:21 PM",
      },
    ],
  },
];

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