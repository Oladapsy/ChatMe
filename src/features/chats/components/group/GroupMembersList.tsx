
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

import { Typography } from "@/shared/components/Typography";
import SearchIcon from "@/assets/icons/shared/search.svg";
import AddUserIcon from "@/assets/icons/shared/userPlus.svg";
import TrashIcon from "@/assets/icons/chat/trash.svg";

import type { GroupMember } from "@/features/chats/types/chat";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import { AddGroupMembersModal } from "@/features/chats/components/AddGroupMembersModal";
import { SwipeActionButton } from "@/features/chats/components/SwipeActionButton";
import { useMe } from "@/features/auth/hooks/useMe";
import {
  useRemoveGroupMember,
  useUpdateGroupMemberRole,
  useTransferGroupOwnership,
} from "@/features/chats/hooks/useGroupMemberMutations";

type MemberRole = "owner" | "admin" | "member";

interface Props {
  members: GroupMember[];
  conversationId?: string;
  currentUserRole?: MemberRole;
  onSearchMembers?: () => void;
  onAddMember?: () => void;
  onMemberPress?: (member: GroupMember) => void;
  onMembersAdded?: () => void;
}

export function GroupMembersList({
  members,
  conversationId,
  currentUserRole,
  onSearchMembers,
  onAddMember,
  onMemberPress,
  onMembersAdded,
}: Props) {
  const { themeColors } = useAppTheme();
  const { data: currentUser } = useMe();

  const [addMembersVisible, setAddMembersVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const groupId = conversationId ?? "";

  const removeMemberMutation = useRemoveGroupMember(groupId);
  const updateRoleMutation = useUpdateGroupMemberRole(groupId);
  const transferOwnershipMutation = useTransferGroupOwnership(groupId);

  const currentMember = members.find(
    (member) => member.id === currentUser?.id,
  );

  // The conversation response's role takes precedence.
  const myRole = currentUserRole ?? currentMember?.role;

  const isGroupOwner = myRole === "owner";
  const isGroupAdmin = myRole === "admin";
  const canManageMembers = isGroupOwner || isGroupAdmin;

  // TEMPORARY DIAGNOSTIC: remove after confirming ownership works.
  console.log("GROUP MEMBER PERMISSIONS", {
    currentUserId: currentUser?.id,
    currentUserRole,
    currentMemberRole: currentMember?.role,
    myRole,
    isGroupOwner,
    canManageMembers,
  });

  const isMutationPending =
    removeMemberMutation.isPending ||
    updateRoleMutation.isPending ||
    transferOwnershipMutation.isPending;

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return members;

    return members.filter((member) =>
      member.name.toLowerCase().includes(query),
    );
  }, [members, searchQuery]);

  const showError = (title: string, error: unknown) => {
    const message =
      error instanceof Error ? error.message : "Please try again.";

    Alert.alert(title, message);
  };

  const handleSearchPress = () => {
    if (onSearchMembers) {
      onSearchMembers();
      return;
    }

    setIsSearching((current) => {
      if (current) setSearchQuery("");
      return !current;
    });
  };

  const handleOpenAddMembers = () => {
    if (!conversationId) {
      if (onAddMember) {
        onAddMember();
      } else {
        Alert.alert(
          "Unable to add members",
          "The group conversation ID is missing.",
        );
      }

      return;
    }

    setAddMembersVisible(true);
  };

  const handleMembersAdded = () => {
    setAddMembersVisible(false);
    onMembersAdded?.();
  };

  const handleChangeRole = (member: GroupMember) => {
    if (!conversationId || !canManageMembers || isMutationPending) return;
    if (member.id === currentUser?.id || member.role === "owner") return;

    const nextRole: "admin" | "member" =
      member.role === "admin" ? "member" : "admin";

    const action = nextRole === "admin" ? "promote" : "demote";

    Alert.alert(
      nextRole === "admin" ? "Promote to admin?" : "Demote admin?",
      `Are you sure you want to ${action} ${member.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: nextRole === "admin" ? "Promote" : "Demote",
          onPress: () => {
            updateRoleMutation.mutate(
              { memberId: member.id, role: nextRole },
              {
                onError: (error) =>
                  showError("Unable to update member role", error),
              },
            );
          },
        },
      ],
    );
  };

  const handleRemoveMember = (member: GroupMember) => {
    if (!conversationId || !canManageMembers || isMutationPending) return;
    if (member.id === currentUser?.id || member.role === "owner") return;

    Alert.alert(
      "Remove member?",
      `Remove ${member.name} from this group?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            removeMemberMutation.mutate(member.id, {
              onError: (error) =>
                showError("Unable to remove member", error),
            });
          },
        },
      ],
    );
  };

  const handleTransferOwnership = (member: GroupMember) => {
    if (!conversationId || !isGroupOwner || isMutationPending) return;
    if (member.id === currentUser?.id || member.role === "owner") return;

    Alert.alert(
      "Transfer ownership?",
      `Make ${member.name} the owner of this group? Your role will change.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Transfer",
          style: "destructive",
          onPress: () => {
            transferOwnershipMutation.mutate(member.id, {
              onError: (error) =>
                showError("Unable to transfer ownership", error),
            });
          },
        },
      ],
    );
  };

  const renderRoleAction = (member: GroupMember) => {
    if (!canManageMembers) return null;
    if (member.id === currentUser?.id || member.role === "owner") return null;

    const isAdmin = member.role === "admin";

    return (
      <View style={styles.swipeAction}>
        <SwipeActionButton
          label={isAdmin ? "Demote" : "Promote"}
          icon={AddUserIcon}
          backgroundColor={themeColors.primary}
          isCompact
          onPress={() => handleChangeRole(member)}
        />
      </View>
    );
  };

  const renderRightActions = (member: GroupMember) => {
    const isSelf = member.id === currentUser?.id;
    const canRemove =
      canManageMembers && !isSelf && member.role !== "owner";
    const canTransfer =
      isGroupOwner && !isSelf && member.role !== "owner";

    if (!canRemove && !canTransfer) return null;

    return (
      <View style={styles.swipeActions}>
        {canTransfer && (
          <View style={styles.swipeAction}>
            <SwipeActionButton
              label="Transfer"
              icon={AddUserIcon}
              backgroundColor="#D99A27"
              isCompact
              onPress={() => handleTransferOwnership(member)}
            />
          </View>
        )}

        {canRemove && (
          <View style={styles.swipeAction}>
            <SwipeActionButton
              label="Remove"
              icon={TrashIcon}
              backgroundColor="#DD524C"
              isCompact
              onPress={() => handleRemoveMember(member)}
            />
          </View>
        )}
      </View>
    );
  };

  const getPresenceLabel = (isOnline: boolean | undefined) => {
    if (isOnline === undefined) return "Status unavailable";
    return isOnline ? "Online" : "Offline";
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Typography size={16} weight="bold" color={themeColors.descText}>
          {members.length} members
        </Typography>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleSearchPress}
            accessibilityRole="button"
            accessibilityLabel="Search group members"
          >
            <SearchIcon
              width={20}
              height={20}
              color={themeColors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleOpenAddMembers}
            accessibilityRole="button"
            accessibilityLabel="Add group members"
          >
            <AddUserIcon
              width={20}
              height={20}
              color={themeColors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {isSearching && (
        <TextInput
          style={[
            styles.searchInput,
            {
              color: themeColors.text,
              backgroundColor: themeColors.cardBackground,
              borderColor: themeColors.border,
            },
          ]}
          placeholder="Search members by name"
          placeholderTextColor={themeColors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          returnKeyType="search"
          accessibilityLabel="Search group members by name"
        />
      )}

      {filteredMembers.length > 0 ? (
        filteredMembers.map((member) => {
          const isSelf = member.id === currentUser?.id;
          const displayedRole =
            isSelf && currentUserRole
              ? currentUserRole
              : member.role;

          const presenceLabel = getPresenceLabel(member.isOnline);

          return (
            <Swipeable
              key={member.id}
              enabled={
                Boolean(conversationId) &&
                canManageMembers &&
                !isSelf
              }
              friction={2}
              leftThreshold={30}
              rightThreshold={40}
              renderLeftActions={() => renderRoleAction(member)}
              renderRightActions={() => renderRightActions(member)}
            >
              <TouchableOpacity
                style={[
                  styles.memberRow,
                  { backgroundColor: themeColors.background },
                ]}
                onPress={() => onMemberPress?.(member)}
                activeOpacity={0.7}
              >
                <View style={styles.avatarContainer}>
                  <Image
                    source={
                      member.avatarUri
                        ? { uri: member.avatarUri }
                        : require("@/assets/images/default-avatar.png")
                    }
                    style={styles.avatar}
                  />

                  {member.isOnline === true && (
                    <View style={styles.onlineDot} />
                  )}
                </View>

                <View style={styles.memberInfo}>
                  <Typography
                    size={15}
                    weight="medium"
                    color={themeColors.text}
                  >
                    {member.id === currentUser?.id ? "You" : member.name}
                  </Typography>

                  <View style={styles.memberStatusRow}>
                    {displayedRole === "owner" ||
                    displayedRole === "admin" ? (
                      <Typography size={13} color={themeColors.primary}>
                        {displayedRole === "owner"
                          ? "Group owner"
                          : "Admin"}
                      </Typography>
                    ) : null}

                    <Typography
                      size={13}
                      color={
                        member.isOnline === true
                          ? "#52C47C"
                          : themeColors.textSecondary
                      }
                    >
                      {presenceLabel}
                    </Typography>
                  </View>
                </View>
              </TouchableOpacity>
            </Swipeable>
          );
        })
      ) : (
        <Typography
          size={14}
          color={themeColors.textSecondary}
          align="center"
          style={styles.emptyText}
        >
          No members found.
        </Typography>
      )}

      {conversationId ? (
        <AddGroupMembersModal
          visible={addMembersVisible}
          conversationId={conversationId}
          existingMemberIds={members.map((member) => member.id)}
          onClose={() => setAddMembersVisible(false)}
          onMembersAdded={handleMembersAdded}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#52C47C",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  memberInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  memberStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  swipeActions: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 4,
    paddingVertical: 6,
    paddingLeft: 4,
  },
  swipeAction: {
    width: 76,
  },
  emptyText: {
    paddingVertical: 24,
  },
});
