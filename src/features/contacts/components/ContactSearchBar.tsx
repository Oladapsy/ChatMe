import React, { useState } from "react";
import { StyleSheet, View, TextInput, useColorScheme } from "react-native";
import SearchIcon from "@/assets/icons/shared/search.svg";
import { Colors } from "@/shared/constants/colors";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

export function ContactSearchBar({ value, onChangeText }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const [isFocused, setIsFocused] = useState(false);

  // Border & Icon active color switching
  const activeBorderColor = isFocused
    ? themeColors.primary
    : isDark
    ? themeColors.border
    : "#EAEEF2";

  const activeIconColor = isFocused
    ? themeColors.primary
    : isDark
    ? "#8EA3B3"
    : "#6E8597";

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: isDark ? "transparent" : "#FFFFFF",
            borderColor: activeBorderColor,
          },
        ]}
      >
        <SearchIcon
          width={18}
          height={18}
          color={activeIconColor}
        />
        <TextInput
          style={[styles.input, { color: themeColors.text }]}
          placeholder="Search people..."
          placeholderTextColor={themeColors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
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
    height: "100%",
  },
});