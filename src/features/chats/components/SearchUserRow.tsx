import React from "react";
import {
  StyleSheet,
  View,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Typography } from "@/shared/components/Typography";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

// SVG Icon for chat bubble indicator
import ChatBubbleIcon from "@/assets/icons/chat/ChatBg.svg";

interface SearchUserRowProps {
  person: {
    id: string;
    displayName: string;
    avatarUrl?: string | null; // <-- ALLOW NULL HERE
  };
  isLoading?: boolean;
  onPress: () => void;
}

export function SearchUserRow({
  person,
  isLoading,
  onPress,
}: SearchUserRowProps) {
  const { themeColors } = useAppTheme();

  return (
    <Pressable
      disabled={isLoading}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed ? themeColors.cardBackground : "transparent",
        },
      ]}
      onPress={onPress}
    >
      {/* 1. Avatar or Fallback Initials */}
      {person.avatarUrl ? (
        <Image source={{ uri: person.avatarUrl }} style={styles.avatar} />
      ) : (
        <View
          style={[
            styles.avatarFallback,
            { backgroundColor: themeColors.primary },
          ]}
        >
          <Typography size={16} weight="bold" color="white">
            {person.displayName
              ? person.displayName.charAt(0).toUpperCase()
              : "?"}
          </Typography>
        </View>
      )}

      {/* 2. Display Name & Subtitle */}
      <View style={styles.textContainer}>
        <Typography size={16} weight="bold" color={themeColors.text}>
          {person.displayName}
        </Typography>
        <Typography size={13} color={themeColors.textSecondary}>
          ChatMe user
        </Typography>
      </View>

      {/* 3. Right Action Indicator */}
      {isLoading ? (
        <ActivityIndicator size="small" color={themeColors.primary} />
      ) : (
        <View style={styles.actionIcon}>
          <ChatBubbleIcon
            width={18}
            height={18}
            color={themeColors.textSecondary}
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  actionIcon: {
    paddingLeft: 8,
  },
});
