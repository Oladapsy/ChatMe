import React, { useMemo, useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";

import { Typography } from "@/shared/components/Typography";
import SearchIcon from "@/assets/icons/shared/search.svg";
import AddUserIcon from "@/assets/icons/shared/userPlus.svg";

import type { GroupMember } from "@/features/chats/types/chat";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import { AddGroupMembersModal } from "@/features/chats/components/AddGroupMembersModal";

interface Props {
  members: GroupMember[];
  conversationId?: string;
  onSearchMembers?: () => void;
  onAddMember?: () => void;
  onMemberPress?: (member: GroupMember) => void;
  onMembersAdded?: () => void;
}

export function GroupMembersList({
  members,
  conversationId,
  onSearchMembers,
  onAddMember,
  onMemberPress,
  onMembersAdded,
}: Props) {
  const { themeColors } = useAppTheme();

  const [addMembersVisible, setAddMembersVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return members;

    return members.filter((member) =>
      member.name.toLowerCase().includes(query),
    );
  }, [members, searchQuery]);

  const handleSearchPress = () => {
    if (onSearchMembers) {
      onSearchMembers();
      return;
    }

    setIsSearching((current) => {
      if (current) {
        setSearchQuery("");
      }

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
        filteredMembers.map((member) => (
          <TouchableOpacity
            key={member.id}
            style={styles.memberRow}
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

              {member.isOnline && <View style={styles.onlineDot} />}
            </View>

            <View style={styles.memberInfo}>
              <Typography size={15} weight="medium" color={themeColors.text}>
                {member.name}
              </Typography>

              <View style={styles.memberStatusRow}>
                {member.role === "owner" || member.role === "admin" ? (
                  <Typography size={13} color={themeColors.primary}>
                    {member.role === "owner" ? "Group owner" : "Admin"}
                  </Typography>
                ) : null}

                <Typography
                  size={13}
                  color={
                    member.isOnline ? "#52C47C" : themeColors.textSecondary
                  }
                >
                  {member.isOnline ? "Online" : "Offline"}
                </Typography>
              </View>
            </View>
          </TouchableOpacity>
        ))
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
    borderRadius: 27,
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#52C47C",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  memberInfo: {
    justifyContent: "center",
    gap: 2,
  },
  memberStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  emptyText: {
    paddingVertical: 24,
  },
});
