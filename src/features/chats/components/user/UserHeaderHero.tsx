import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";

import BackIcon from "@/assets/icons/shared/chevron-left.svg";
import SearchIcon from "@/assets/icons/shared/search.svg";
import QrCodeIcon from "@/assets/icons/chat/qrcode.svg";
import ChatBubbleIcon from "@/assets/icons/shared/chatBubble.svg";
import { Colors } from "@/shared/constants/colors";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Props {
  name: string;
  lastSeen: string;
  avatarUri?: string;
  onBack: () => void;
  onSearchPress: () => void;
  onQrPress: () => void;
  onMessagePress: () => void;
}

export function UserHeaderHero({
  name,
  lastSeen,
  avatarUri,
  onBack,
  onSearchPress,
  onQrPress,
  onMessagePress,
}: Props) {
   const { isDark, themeColors } = useAppTheme();


  return (
    <View style={styles.bannerContainer}>
      <Image
        source={
          avatarUri
            ? { uri: avatarUri }
            : require("@/assets/images/default-avatar.png")
        }
        style={styles.bannerImage}
        resizeMode="cover"
      />
      <View style={styles.bannerOverlay} />

      <MySafeAreaView
        edges={["top"]}
        color="transparent"
        style={styles.topBarContainer}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.roundIconBtn} onPress={onBack}>
            <BackIcon width={22} height={22} color="white" />
          </TouchableOpacity>

          <View style={styles.rightActions}>
            <TouchableOpacity
              style={styles.roundIconBtn}
              onPress={onSearchPress}
            >
              <SearchIcon width={24} height={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.roundIconBtn} onPress={onQrPress}>
              <QrCodeIcon width={24} height={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </MySafeAreaView>

      <View style={styles.identityContainer}>
        <Typography
          size={28}
          weight="bold"
          color="white"
          style={styles.titleText}
        >
          {name}
        </Typography>
        <Typography size={14} color="#FFFFFFE5">
          {lastSeen}
        </Typography>
      </View>

      <TouchableOpacity
        style={[styles.floatingMsgBtn, {backgroundColor: themeColors.primary}]}
        activeOpacity={0.85}
        onPress={onMessagePress}
      >
        <ChatBubbleIcon width={32} height={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    width: SCREEN_WIDTH,
    height: 340,
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  topBarContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  roundIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  identityContainer: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 90,
    gap: 4,
  },
  floatingMsgBtn: {
    position: "absolute",
    bottom: -28,
    right: 24,
    width: 75,
    height: 75,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 20,
  },
  titleText: {
    lineHeight: 34,
  },
});
