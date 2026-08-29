import React from "react";
import { ScrollView, StyleSheet, View, useColorScheme } from "react-native";
import { Colors } from "@/shared/constants/colors";
import { GroupDetails, GroupMember } from "@/features/chats/types/chat";
import { GroupHeaderHero } from "@/features/chats/components/group/GroupHeaderHero";
import { GroupDescriptionCard } from "@/features/chats/components/group/GroupDescriptionCard";
import { GroupMediaPreviewRow } from "@/features/chats/components/group/GroupMediaPreviewRow";
import { GroupMembersList } from "@/features/chats/components/group/GroupMembersList";
import { useRouter } from "expo-router";

interface Props {
  groupDetails: GroupDetails;
  onBack: () => void;
  onNavigatePhotos: () => void;
  onNavigateStars: () => void;
  onNavigateLinks: () => void;
  onSelectMember?: (member: GroupMember) => void;
}

export function GroupDetailScreen({
  groupDetails,
  onBack,
  onNavigatePhotos,
  onNavigateStars,
  onNavigateLinks,
  onSelectMember,
}: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];
  const router = useRouter()

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* 1. Hero Cover Header */}
      <GroupHeaderHero
        name={groupDetails.name}
        coverImageUri={groupDetails.coverImageUri}
        onBack={onBack}
        onSearch={() =>
          router.push({
            pathname: "/chat-room",
            params: {
              id: groupDetails.id,
              search: "true", // Tells ChatRoomScreen to open directly in search mode
            },
          })
        }
      />

      {/* 2. Description Card */}
      <GroupDescriptionCard description={groupDetails.description} />

      {/* Divider */}
      <View
        style={[
          styles.divider,
          { backgroundColor: isDark ? "#1E2D3B" : "#EAEEF2" },
        ]}
      />

      {/* 3. Photos, Stars & Links Navigation Row */}
      <GroupMediaPreviewRow
        photosCount={groupDetails.photosCount}
        starCount={groupDetails.starMessagesCount}
        linksCount={groupDetails.sharedLinksCount}
        recentPhotos={groupDetails.recentPhotos}
        onPressPhotos={onNavigatePhotos}
        onPressStars={onNavigateStars}
        onPressLinks={onNavigateLinks}
      />

      {/* Divider */}
      <View
        style={[
          styles.divider,
          { backgroundColor: isDark ? "#1E2D3B" : "#EAEEF2" },
        ]}
      />
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* 4. Member List */}
        <GroupMembersList
          members={groupDetails.members}
          onMemberPress={onSelectMember}
        />
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
    marginVertical: 4,
  },
});
