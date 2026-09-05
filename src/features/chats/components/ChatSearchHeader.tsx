import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Typography } from "@/shared/components/Typography";
import SearchIcon from "@/assets/icons/chat/search.svg";
import { Colors } from "@/shared/constants/colors";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

interface Props {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onCancel: () => void;
  backgroundColor: string;
}

export function ChatSearchHeader({
  searchQuery,
  onSearchChange,
  onCancel,
  backgroundColor,
}: Props) {
    const { isDark, themeColors } = useAppTheme();

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Focus automatically when search opens
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  return (
    <View style={[styles.header, { backgroundColor }]}>
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: themeColors.searchBorder,
            backgroundColor: "#FFFFFF0F",
          },
        ]}
      >
        <SearchIcon width={18} height={18} color="white" />
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search..."
          placeholderTextColor="#FFFFFFE5"
          returnKeyType="search"
          autoCorrect={false}
          cursorColor="#FFFFFFE5"
        />
      </View>

      <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
        <Typography size={16} color="#FFFFFFE5">
          Cancel
        </Typography>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  input: {
    flex: 1,
    color: "#FFFFFFE5",
    fontSize: 16,
    padding: 0,
  },
  cancelBtn: {
    paddingVertical: 4,
  },
});
