import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { UserProfile } from "@/features/chats/types/chat";
import { UserHeaderHero } from "@/features/chats/components/user/UserHeaderHero";
import { UserInfoSectionCard } from "@/features/chats/components/user/UserInfoSectionCard";
import { UserAboutMediaSection } from "@/features/chats/components/user/UserAboutMediaSection";
import { Typography } from "@/shared/components/Typography";
import BlockIcon from "@/assets/icons/shared/Block.svg";
import { Colors } from "@/shared/constants/colors";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

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
  const { isDark, themeColors } = useAppTheme();


  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* 1. Profile Hero */}
        <UserHeaderHero
          name={profile.name}
          lastSeen={profile.lastSeen}
          avatarUri={profile.avatarUri}
          onBack={onBack}
          onSearchPress={onSearchPress}
          onQrPress={onQrPress}
          onMessagePress={onMessagePress}
        />

        {/* 2. Phone & Description */}
        <UserInfoSectionCard
          phone={profile.phone}
          description={profile.description}
        />

        <View
          style={[
            styles.divider,
            { backgroundColor: isDark ? "#163043" : "#EAEEF2" },
          ]}
        />

        {/* 3. Media Preview & Settings */}
        <UserAboutMediaSection
          photoCount={profile.photoCount}
          starCount={profile.starCount}
          linkCount={profile.linkCount}
          isMuted={profile.isMuted}
          previewPhotos={profile.previewPhotos}
          onPhotosPress={onPhotosPress}
          onStarredPress={onStarredPress}
          onLinksPress={onLinksPress}
          onToggleNotifications={onToggleNotifications}
        />

        <View
          style={[
            styles.divider,
            { backgroundColor: isDark ? "#163043" : "#EAEEF2" },
          ]}
        />

        {/* 4. Block Action Button */}
        <TouchableOpacity
          style={[
            styles.blockRow,
            { backgroundColor: themeColors.background},
          ]}
          activeOpacity={0.7}
          onPress={onBlockPress}
        >
          <BlockIcon width={22} height={22} color="#DD524C" />
          <Typography size={15} weight="bold" color="#DD524C">
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
  divider: {
    height: 8,
  },
  blockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
});
