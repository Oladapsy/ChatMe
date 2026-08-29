import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  useColorScheme,
  Dimensions,
} from "react-native";
import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import { UserProfile } from "@/features/chats/types/chat";

// Icons
import BackIcon from "@/assets/icons/shared/chevron-left.svg";
import SearchIcon from "@/assets/icons/shared/search.svg";
import QrCodeIcon from "@/assets/icons/chat/qrcode.svg";
import ChatBubbleIcon from "@/assets/icons/shared/chatBubble.svg";
import ImageIcon from "@/assets/icons/shared/gallery.svg";
import StarIcon from "@/assets/icons/shared/star.svg";
import LinkIcon from "@/assets/icons/shared/link.svg";
import BellIcon from "@/assets/icons/shared/volume.svg";
import ChevronRightIcon from "@/assets/icons/shared/chevron-right.svg";
import BlockIcon from "@/assets/icons/shared/Block.svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Props {
  profile: UserProfile;
  onBack: () => void;
  onSearchPress: () => void;
  onQrPress: () => void;
  onMessagePress: () => void;
  onPhotosPress: () => void;
  onStarredPress: () => void;
  onLinksPress: () => void;
  onToggleNotifications: (value: boolean) => void;
  onBlockPress: () => void;
}

export function UserProfileDetailScreen({
  profile,
  onBack,
  onSearchPress,
  onQrPress,
  onMessagePress,
  onPhotosPress,
  onStarredPress,
  onLinksPress,
  onToggleNotifications,
  onBlockPress,
}: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* 1. Header Banner Image with Overlay */}
        <View style={styles.bannerContainer}>
          <Image
            source={
              profile.avatarUri
                ? { uri: profile.avatarUri }
                : require("@/assets/images/default-avatar.png")
            }
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay} />

          {/* Top Actions Floating Bar */}
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
                  <SearchIcon width={20} height={20} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.roundIconBtn}
                  onPress={onQrPress}
                >
                  <QrCodeIcon width={20} height={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </MySafeAreaView>

          {/* User Basic Identity */}
          <View style={styles.identityContainer}>
            <Typography size={24} weight="bold" color="white">
              {profile.name}
            </Typography>
            <Typography size={14} color="rgba(255, 255, 255, 0.7)">
              {profile.lastSeen}
            </Typography>
          </View>

          {/* Floating Message Action Button */}
          <TouchableOpacity
            style={styles.floatingMsgBtn}
            activeOpacity={0.85}
            onPress={onMessagePress}
          >
            <ChatBubbleIcon width={26} height={26} color="white" />
          </TouchableOpacity>
        </View>

        {/* 2. Phone & Description Info Section */}
        <View
          style={[
            styles.infoSection,
            { backgroundColor: isDark ? "#0A1926" : "#FFFFFF" },
          ]}
        >
          <View style={styles.infoRow}>
            <Typography size={16} weight="bold" color={themeColors.text}>
              {profile.phone}
            </Typography>
            <Typography size={13} color={themeColors.textSecondary}>
              Phone number
            </Typography>
          </View>

          <View style={styles.infoRow}>
            <Typography size={16} weight="bold" color={themeColors.text}>
              {profile.description}
            </Typography>
            <Typography size={13} color={themeColors.textSecondary}>
              Description
            </Typography>
          </View>
        </View>

        <View
          style={[
            styles.sectionDivider,
            { backgroundColor: isDark ? "#08131D" : "#EBEFF3" },
          ]}
        />

        {/* 3. About Section (Shared Media, Items, Notifications) */}
        <View
          style={[
            styles.aboutSection,
            { backgroundColor: isDark ? "#0A1926" : "#FFFFFF" },
          ]}
        >
          <Typography
            size={16}
            weight="bold"
            color={themeColors.text}
            style={styles.sectionTitle}
          >
            About
          </Typography>

          {/* Photos Row Preview */}
          <TouchableOpacity
            style={styles.mediaHeaderRow}
            activeOpacity={0.7}
            onPress={onPhotosPress}
          >
            <View style={styles.mediaTitleLeft}>
              <ImageIcon
                width={22}
                height={22}
                color={isDark ? "#57B77D" : themeColors.primary}
              />
              <Typography size={15} weight="medium" color={themeColors.text}>
                {profile.photoCount} photos
              </Typography>
            </View>
            <ChevronRightIcon
              width={20}
              height={20}
              color={themeColors.textSecondary}
            />
          </TouchableOpacity>

          {/* Photo Horizontal Preview Strip */}
          {profile.previewPhotos && profile.previewPhotos.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoStrip}
            >
              {profile.previewPhotos.map((url, idx) => (
                <Image
                  key={`${url}-${idx}`}
                  source={{ uri: url }}
                  style={styles.photoThumb}
                />
              ))}
            </ScrollView>
          )}

          {/* Starred Messages Row */}
          <TouchableOpacity
            style={styles.navRow}
            activeOpacity={0.7}
            onPress={onStarredPress}
          >
            <View style={styles.mediaTitleLeft}>
              <StarIcon
                width={22}
                height={22}
                color={isDark ? "#57B77D" : themeColors.primary}
              />
              <Typography size={15} weight="medium" color={themeColors.text}>
                {profile.starCount} star message
              </Typography>
            </View>
            <ChevronRightIcon
              width={20}
              height={20}
              color={themeColors.textSecondary}
            />
          </TouchableOpacity>

          {/* Shared Links Row */}
          <TouchableOpacity
            style={styles.navRow}
            activeOpacity={0.7}
            onPress={onLinksPress}
          >
            <View style={styles.mediaTitleLeft}>
              <LinkIcon
                width={22}
                height={22}
                color={isDark ? "#57B77D" : themeColors.primary}
              />
              <Typography size={15} weight="medium" color={themeColors.text}>
                {profile.linkCount} shared links
              </Typography>
            </View>
            <ChevronRightIcon
              width={20}
              height={20}
              color={themeColors.textSecondary}
            />
          </TouchableOpacity>

          {/* Notifications Toggle */}
          <View style={styles.navRow}>
            <View style={styles.mediaTitleLeft}>
              <BellIcon
                width={22}
                height={22}
                color={isDark ? "#57B77D" : themeColors.primary}
              />
              <Typography size={15} weight="medium" color={themeColors.text}>
                Notifications
              </Typography>
            </View>
            <Switch
              value={!profile.isMuted}
              onValueChange={onToggleNotifications}
              trackColor={{ false: "#2C3E50", true: "#57B77D" }}
              thumbColor={"#FFFFFF"}
            />
          </View>
        </View>

        <View
          style={[
            styles.sectionDivider,
            { backgroundColor: isDark ? "#08131D" : "#EBEFF3" },
          ]}
        />

        {/* 4. Block Contact Button */}
        <TouchableOpacity
          style={[
            styles.blockRow,
            { backgroundColor: isDark ? "#0A1926" : "#FFFFFF" },
          ]}
          activeOpacity={0.7}
          onPress={onBlockPress}
        >
          <BlockIcon width={22} height={22} color="#E53935" />
          <Typography size={15} weight="bold" color="#E53935">
            Block contact
          </Typography>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#57B77D",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 20,
  },
  infoSection: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 20,
  },
  infoRow: {
    gap: 2,
  },
  sectionDivider: {
    height: 8,
  },
  aboutSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  mediaHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  mediaTitleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  photoStrip: {
    gap: 10,
    paddingVertical: 8,
    paddingBottom: 16,
  },
  photoThumb: {
    width: 68,
    height: 68,
    borderRadius: 16,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  blockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
});