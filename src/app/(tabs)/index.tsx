import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import PinPromptModal from "@/features/security/components/PinPromptModal";
import { Colors } from "@/shared/constants/colors";
import PlusIcon from "@/assets/icons/shared/plus.svg";

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const [showPinModal, setShowPinModal] = useState(true);

  return (
    <MySafeAreaView color={themeColors.background}>
      <View style={styles.container}>
        {/* Header Title */}
        <View style={styles.header}>
          <Typography
            variant="h1"
            size={24}
            weight="bold"
            color={themeColors.text}
          >
            Chats
          </Typography>
        </View>

        {/* Empty State Banner Content */}
        <View style={styles.emptyContainer}>
          {/* Avatar Overlap Cluster */}
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
                { backgroundColor: isDark ? "#1F3C51" : "#E5E7EB" },
              ]}
            >
              <Typography
                size={12}
                weight="bold"
                color={themeColors.textSecondary}
              >
                26+
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
            <Typography size={13} weight="bold" color={themeColors.text}>
              Mom, Sir Silbert, Cody Fisher
            </Typography>{" "}
            and 26+ contact found on Chatme, try sending a message to them or
            just saying hello.
          </Typography>
        </View>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: themeColors.primary }]}
          activeOpacity={0.8}
        >
          {PlusIcon ? (
            <PlusIcon width={24} height={24} color="#FFFFFF" />
          ) : (
            <Typography size={24} color="#FFF">
              +
            </Typography>
          )}
        </TouchableOpacity>

        {/* PIN Security Modal Prompt */}
        <PinPromptModal
          visible={showPinModal}
          onAccept={() => {
            setShowPinModal(false);
            router.push("/(auth)/setup-pin");
          }}
          onDecline={() => setShowPinModal(false)}
        />
      </View>
    </MySafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
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
  avatar1: { zIndex: 5 },
  avatar2: { zIndex: 4, marginLeft: -12 },
  avatar3: { zIndex: 3, marginLeft: -12 },
  avatar4: { zIndex: 2, marginLeft: -12 },
  avatarCount: {
    zIndex: 1,
    marginLeft: -12,
    justifyContent: "center",
    alignItems: "center",
  },
  description: {
    lineHeight: 20,
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
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});
