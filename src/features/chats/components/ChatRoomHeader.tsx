import React from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

import { Typography } from "@/shared/components/Typography";

// Header Icons
import BackChevronIcon from "@/assets/icons/shared/chevron-left.svg";
import VideoCallIcon from "@/assets/icons/chat/video-camera.svg";
import PhoneCallIcon from "@/assets/icons/chat/phone.svg";
import UserPlaceholderIcon from "@/assets/icons/shared/user.svg";
import GroupIcon from "@/assets/icons/chat/group.svg";

interface ChatRoomHeaderProps {
  name?: string;
  avatar?: string;
  lastSeen?: string;
  isGroup?: boolean;
  membersText?: string;
  backgroundColor: string;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
  onHeaderPress?: () => void;
}

export function ChatRoomHeader({
  name = "Unknown Contact",
  avatar,
  lastSeen = "5 minutes",
  isGroup = false,
  membersText = "User1, User2, You",
  backgroundColor,
  onVideoCall,
  onVoiceCall,
  onHeaderPress,
}: ChatRoomHeaderProps) {
  const router = useRouter();

  const subTitle = isGroup ? membersText : `Active ${lastSeen} ago`;

  return (
    <View style={[styles.header, { backgroundColor }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <BackChevronIcon width={24} height={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.profileSection}
        onPress={onHeaderPress}
        activeOpacity={onHeaderPress ? 0.7 : 1}
      >
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholderAvatar]}>
              <UserPlaceholderIcon width={24} height={24} color="white" />
            </View>
          )}
        </View>

        {/* Title & Group Icon Container */}
        <View style={styles.headerTitle}>
          <View style={styles.nameRow}>
            {isGroup && (
              <GroupIcon
                width={18}
                height={18}
                color="white"
                style={styles.groupIcon}
              />
            )}
            <Typography
              size={16}
              weight="bold"
              color="white"
              numberOfLines={1}
              style={styles.nameText}
            >
              {name}
            </Typography>
          </View>

          <Typography size={12} color="#FFFFFFE5" numberOfLines={1}>
            {subTitle}
          </Typography>
        </View>
      </TouchableOpacity>

      {/* Header Actions */}
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.actionIcon} onPress={onVideoCall}>
          <VideoCallIcon width={24} height={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIcon} onPress={onVoiceCall}>
          <PhoneCallIcon width={20} height={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    paddingRight: 8,
  },
  profileSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    marginLeft: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "white",
  },
  placeholderAvatar: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    gap: 3,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupIcon: {
    marginRight: 6,
  },
  nameText: {
    flexShrink: 1,
  },
  headerActions: {
    flexDirection: "row",
  },
  actionIcon: {
    padding: 6,
    marginLeft: 4,
  },
});