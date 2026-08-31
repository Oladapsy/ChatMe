import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Colors } from "@/shared/constants/colors";
import { SubScreenHeader } from "@/shared/components/SubScreenHeader";
import SearchIcon from "@/assets/icons/shared/search.svg";
import { StarredMessageItem } from "@/features/chats/components/StarredMsgItem";

// Mock Data
import { MOCK_STARRED_MESSAGES } from "@/features/chats/data/mockStarredMsg";

export default function StarredMessagesScreen() {
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
          title="Star Message"
          onBack={() => router.back()}
          rightAction={
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => console.log("Search starred messages")}
            >
              <SearchIcon width={22} height={22} color="white" />
            </TouchableOpacity>
          }
        />
      </MySafeAreaView>

      {/* 2. Messages List Safe Area */}
      <MySafeAreaView
        edges={["bottom", "left", "right"]}
        color={themeColors.background}
        style={styles.bodySafeArea}
      >
        <FlatList
          data={MOCK_STARRED_MESSAGES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <StarredMessageItem item={item} />}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 20,
  },
});
