import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  useColorScheme,
} from "react-native";
import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import { SubScreenHeader } from "@/shared/components/SubScreenHeader";
import SearchIcon from "@/assets/icons/shared/search.svg";
import StarFilledIcon from "@/assets/icons/shared/starMsg.svg";

export interface StarredMessage {
  id: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  timestamp: string;
  dateLabel?: string;
}

interface Props {
  starredMessages: StarredMessage[];
  onBack: () => void;
  onSelectTab: (tab: "Photo" | "Star" | "Links") => void;
  onSearchPress?: () => void;
}

export function GroupStarredMessagesScreen({
  starredMessages,
  onBack,
  onSelectTab,
  onSearchPress,
}: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const [activeTab, setActiveTab] = useState<"Photo" | "Star" | "Links">(
    "Star",
  );

  const handleTabPress = (tab: "Photo" | "Star" | "Links") => {
    setActiveTab(tab);
    onSelectTab(tab);
  };

  return (
    <View style={styles.container}>
      {/* 1. Top Safe Area for Status Bar + Shared Header */}
      <MySafeAreaView
        edges={["top"]}
        color={themeColors.headBg}
        style={styles.topSafeArea}
      >
        <SubScreenHeader
          title="Star Message"
          onBack={onBack}
          rightAction={
            <TouchableOpacity style={styles.iconBtn} onPress={onSearchPress}>
              <SearchIcon width={20} height={20} color={"white"} />
            </TouchableOpacity>
          }
        />
      </MySafeAreaView>

      {/* 2. Main Content Safe Area (Bottom, Left, Right) */}
      <MySafeAreaView
        edges={["bottom", "left", "right"]}
        color={themeColors.background}
        style={styles.bodySafeArea}
      >
        {/* Category Segment Control */}
        <View
          style={[
            styles.segmentContainer,
            { backgroundColor: isDark ? "#0F2637" : "#F5F7F9" },
          ]}
        >
          {(["Photo", "Star", "Links"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.segmentBtn,
                  isActive && {
                    backgroundColor: themeColors.mediaTabBg,
                  },
                ]}
                onPress={() => handleTabPress(tab)}
              >
                <Typography
                  size={14}
                  weight={isActive ? "bold" : "medium"}
                  color={themeColors.mediaTab}
                >
                  {tab}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Starred Messages List */}
        <FlatList
          data={starredMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.messageGroupContainer}>
              {/* Message Card */}
              <View
                style={[
                  styles.card,
                  { backgroundColor: isDark ? "#162837" : "#F8FAFC" },
                ]}
              >
                <Typography
                  size={14}
                  color={themeColors.text}
                  style={styles.messageText}
                >
                  {item.message}
                </Typography>
                <View style={styles.cardFooter}>
                  <StarFilledIcon width={14} height={14} color="#FFB800" />
                  <Typography size={12} color={themeColors.textSecondary}>
                    {item.timestamp}
                  </Typography>
                </View>
              </View>

              {/* Sender Metadata Sub-row */}
              <View style={styles.senderRow}>
                <Image
                  source={
                    item.senderAvatar
                      ? { uri: item.senderAvatar }
                      : require("@/assets/images/default-avatar.png")
                  }
                  style={styles.avatar}
                />
                <Typography size={14} weight="bold" color={themeColors.text}>
                  {item.senderName}
                </Typography>
                {item.dateLabel && (
                  <Typography
                    size={12}
                    color={themeColors.textSecondary}
                    style={styles.dateLabel}
                  >
                    {item.dateLabel}
                  </Typography>
                )}
              </View>
            </View>
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
  segmentContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  messageGroupContainer: {
    gap: 8,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  messageText: {
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  senderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  dateLabel: {
    marginLeft: "auto",
  },
});
