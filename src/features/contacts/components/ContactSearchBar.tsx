import React from "react";
import { StyleSheet, View, TextInput, useColorScheme } from "react-native";
import SearchIcon from "@/assets/icons/shared/search.svg";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

export function ContactSearchBar({ value, onChangeText }: Props) {
  const isDark = useColorScheme() === "dark";

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: isDark ? "transparent" : "#FFFFFF",
            borderColor: isDark ? "#2D3748" : "#E2E8F0",
          },
        ]}
      >
        <SearchIcon width={18} height={18} color={isDark ? "#8E9BAE" : "#94A3B8"} />
        <TextInput
          style={[styles.input, { color: isDark ? "#FFFFFF" : "#0F1828" }]}
          placeholder="Search people..."
          placeholderTextColor={isDark ? "#526070" : "#94A3B8"}
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
          autoCapitalize="none"
          editable={true}
          keyboardType="default"
          returnKeyType="search"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    height: "100%", // Ensures full tap target area for typing
  },
});