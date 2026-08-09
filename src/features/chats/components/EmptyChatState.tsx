import React from "react";
import { StyleSheet, View, Image, useColorScheme } from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";

export function EmptyChatState() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const ContactTotal = 27;
  const ContactLeft = ContactTotal - 5;
  const ContactLeft2 = ContactTotal - 3;

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.avatarCluster}>
        <Image
          source={{ uri: "https://i.pravatar.cc/100?img=1" }}
          style={[styles.avatar, styles.avatar1]}
        />
        <Image
          source={{ uri: "https://i.pravatar.cc/100?img=2" }}
          style={[styles.avatar, styles.avatar2]}
        />
        <Image
          source={{ uri: "https://i.pravatar.cc/100?img=3" }}
          style={[styles.avatar, styles.avatar3]}
        />
        <Image
          source={{ uri: "https://i.pravatar.cc/100?img=4" }}
          style={[styles.avatar, styles.avatar4]}
        />
        <View
          style={[
            styles.avatar,
            styles.avatarCount,
            { backgroundColor: themeColors.smallCircle },
          ]}
        >
          <Typography size={12} weight="bold" color={themeColors.textSecondary}>
            {ContactLeft}+
          </Typography>
        </View>
      </View>

      <Typography
        variant="body"
        size={13}
        align="center"
        color={themeColors.textSecondary}
        style={styles.description}
      >
        <Typography size={14} weight="bold" color={themeColors.text}>
          Mom, Sir Silbert, Cody Fisher{" "}
        </Typography>
        and {ContactLeft2}+ contacts found on Chatme, try sending a message to
        them or just saying hello.
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 24,
    paddingRight: 11,
  },
  avatarCluster: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatar1: {
    zIndex: 1,
  },
  avatar2: {
    zIndex: 2,
    marginLeft: -12,
  },
  avatar3: {
    zIndex: 3,
    marginLeft: -12,
  },
  avatar4: {
    zIndex: 4,
    marginLeft: -12,
  },
  avatarCount: {
    zIndex: 5,
    marginLeft: -12,
    justifyContent: "center",
    alignItems: "center",
  },
  description: {
    lineHeight: 20,
  },
});
