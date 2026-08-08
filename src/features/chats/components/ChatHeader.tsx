import React from "react";
import { StyleSheet, View, TextInput, useColorScheme } from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import SearchIcon from "@/assets/icons/chat/search.svg";

interface ChatHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
}

export function ChatHeader({ searchQuery, onSearchChange }: ChatHeaderProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  // Header background: #163043 in dark mode, Primary Green in light mode
  const headerBgColor = isDark ? "#163043" : themeColors.primary;

  return (
    <View style={[styles.banner, { backgroundColor: headerBgColor }]}>
      <Typography
        variant="h1"
        size={22}
        weight="bold"
        color="#FFFFFF"
        style={styles.title}
      >
        Chats
      </Typography>

      {/* Search Input Bar */}
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(255, 255, 255, 0.2)",
            borderColor: isDark ? "#2A4558" : "transparent",
            borderWidth: isDark ? 1 : 0,
          },
        ]}
      >
        <SearchIcon width={18} height={18} color="#94A3B8" />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search chat, people and more..."
          placeholderTextColor={isDark ? "#64748B" : "rgba(255, 255, 255, 0.7)"}
          style={[
            styles.input,
            { color: isDark ? themeColors.text : "#FFFFFF" },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  title: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
});