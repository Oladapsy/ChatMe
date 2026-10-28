import { GroupDescriptionCard } from "@/features/chats/components/group/GroupDescriptionCard";
import { GroupHeaderHero } from "@/features/chats/components/group/GroupHeaderHero";
import { GroupMediaPreviewRow } from "@/features/chats/components/group/GroupMediaPreviewRow";
import { GroupMembersList } from "@/features/chats/components/group/GroupMembersList";
import { GroupDetails, GroupMember } from "@/features/chats/types/chat";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { useQueryClient } from "@tanstack/react-query";

type MemberRole = "owner" | "admin" | "member";

interface Props {
  groupDetails: GroupDetails;
  currentUserRole?: MemberRole;
  onBack: () => void;
  onNavigatePhotos: () => void;
  onNavigateStars: () => void;
  onNavigateLinks: () => void;
  onEditGroup?: () => void;
  onSelectMember?: (member: GroupMember) => void;
}

export function GroupDetailScreen({
  groupDetails,
  currentUserRole,
  onBack,
  onNavigatePhotos,
  onNavigateStars,
  onNavigateLinks,
  onEditGroup,
  onSelectMember,
}: Props) {
  const { isDark, themeColors } = useAppTheme();

  const router = useRouter();

  const queryClient = useQueryClient();

  const handleMemberPress = (member: GroupMember) => {
    onSelectMember?.(member);
  };

  const handleMembersAdded = () => {
    queryClient.invalidateQueries({
      queryKey: ["conversation", groupDetails.id],
    });
  };

  const handleSearchMembers = () => {
    router.push({
      pathname: "/chat-room",
      params: { id: groupDetails.id, search: "true" },
    });
  };

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* 1. Hero Cover Header */}
      <GroupHeaderHero
        name={groupDetails.name}
        coverImageUri={groupDetails.coverImageUri}
        onBack={onBack}
        onEdit={onEditGroup}
        onSearch={handleSearchMembers}
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
          conversationId={groupDetails.id}
          currentUserRole={currentUserRole}
          onMemberPress={handleMemberPress}
          onMembersAdded={handleMembersAdded}
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
