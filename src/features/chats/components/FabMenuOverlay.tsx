import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
} from "react-native";
import { BlurView } from "expo-blur";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";

// Icons
import PlusIcon from "@/assets/icons/shared/plus.svg";
import ChatIcon from "@/assets/icons/chat/chat.svg";
import ContactIcon from "@/assets/icons/chat/contact.svg";
import GroupIcon from "@/assets/icons/chat/group.svg";
import CloseIcon from "@/assets/icons/shared/close.svg";

interface FabMenuOverlayProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onNewContact: () => void;
  onNewGroup: () => void;
}

export function FabMenuOverlay({
  isOpen,
  onToggle,
  onNewChat,
  onNewContact,
  onNewGroup,
}: FabMenuOverlayProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  // Default closed FAB button positioned over bottom tab bar area
  if (!isOpen) {
    return (
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: themeColors.primary }]}
        activeOpacity={0.85}
        onPress={onToggle}
      >
        <PlusIcon width={16} height={16} color="white" />
      </TouchableOpacity>
    );
  }

  const textColor = isDark ? "#FFFFFF" : "#1F3C51";

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Blur / Dimmed Backdrop */}
      <TouchableWithoutFeedback onPress={onToggle}>
        <View style={StyleSheet.absoluteFill}>
          <BlurView
            intensity={20}
            tint={isDark ? "dark" : "light"}
            style={styles.backdrop}
          />
        </View>
      </TouchableWithoutFeedback>

      {/* Floating Action Menu Stack */}
      <View style={styles.menuContainer} pointerEvents="box-none">
        {/* Item 1: New Chat */}
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: themeColors.fabBg }]}
          activeOpacity={0.85}
          onPress={() => {
            onToggle();
            onNewChat();
          }}
        >
          <ChatIcon width={24} height={24} color={themeColors.primary} />
          <Typography
            size={17}
            weight="bold"
            color={textColor}
            style={styles.menuText}
          >
            New Chat
          </Typography>
        </TouchableOpacity>

        {/* Item 2: New Contact */}
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: themeColors.fabBg }]}
          activeOpacity={0.85}
          onPress={() => {
            onToggle();
            onNewContact();
          }}
        >
          <ContactIcon width={24} height={24} color={themeColors.primary} />
          <Typography
            size={17}
            weight="bold"
            color={textColor}
            style={styles.menuText}
          >
            New Contact
          </Typography>
        </TouchableOpacity>

        {/* Item 3: New Group */}
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: themeColors.fabBg }]}
          activeOpacity={0.85}
          onPress={() => {
            onToggle();
            onNewGroup();
          }}
        >
          <GroupIcon width={24} height={24} color={themeColors.primary} />
          <Typography
            size={17}
            weight="bold"
            color={textColor}
            style={styles.menuText}
          >
            New Group
          </Typography>
        </TouchableOpacity>

        {/* FAB stays in the same place and chnages to close icon */}
        <TouchableOpacity
          style={[styles.fabInMenu, { backgroundColor: themeColors.primary }]}
          activeOpacity={0.85}
          onPress={onToggle}
        >
          <CloseIcon width={17} height={17} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabInMenu: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  menuContainer: {
    position: "absolute",
    right: 20,
    bottom: 24,
    alignItems: "flex-end",
    gap: 14,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    // height: 52,
    // width: 170,
    borderRadius: 100, 
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 50,
  },
  menuText: {
    marginLeft: 12,
  },
});
