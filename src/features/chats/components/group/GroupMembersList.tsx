import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  useColorScheme,
} from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import SearchIcon from "@/assets/icons/shared/search.svg";
import AddUserIcon from "@/assets/icons/shared/userPlus.svg";
import { GroupMember } from "@/features/chats/types/chat";

interface Props {
  members: GroupMember[];
  onSearchMembers?: () => void;
  onAddMember?: () => void;
  onMemberPress?: (member: GroupMember) => void;
}

export function GroupMembersList({
  members,
  onSearchMembers,
  onAddMember,
  onMemberPress,
}: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Typography size={16} weight="bold" color={themeColors.descText}>
          {members.length} members
        </Typography>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.iconBtn} onPress={onSearchMembers}>
            <SearchIcon
              width={20}
              height={20}
              color={themeColors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onAddMember}>
            <AddUserIcon
              width={20}
              height={20}
              color={themeColors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Member Items */}
      {members.map((member) => (
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
            <Typography
              size={13}
              color={
                member.isOnline
                  ? themeColors.primary
                  : themeColors.textSecondary
              }
            >
              {member.isOnline ? "Online" : "Offline"}
            </Typography>
          </View>
        </TouchableOpacity>
      ))}
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
});
