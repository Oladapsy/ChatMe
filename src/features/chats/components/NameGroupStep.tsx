import React, { useState } from "react";
import { StyleSheet, View, TextInput, ScrollView } from "react-native";

import { Typography } from "@/shared/components/Typography";
import {
  AvatarPicker,
  type SelectedImage,
} from "@/features/contacts/components/AvatarPicker";
import { Button } from "@/shared/components/Button";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

interface Props {
  onCreate: (groupData: {
    name: string;
    description: string;
    image?: SelectedImage;
  }) => void;
  isDark: boolean;
  isCreating?: boolean;
}

export function NameGroupStep({ onCreate, isDark, isCreating = false }: Props) {
  const { themeColors } = useAppTheme();

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<
    SelectedImage | undefined
  >();
  const [avatarUri, setAvatarUri] = useState<string | undefined>();

  // Focus ring state
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isDescFocused, setIsDescFocused] = useState(false);

  const isValid = groupName.trim().length > 0 && !isCreating;

  const getNameBorderColor = () =>
    isNameFocused ? "#52C47C" : isDark ? "#6E8597" : "#EAEEF2";

  const getDescBorderColor = () =>
    isDescFocused ? "#52C47C" : isDark ? "#6E8597" : "#EAEEF2";

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.container}>
        {/* Avatar Picker Component */}
        <View style={styles.avatarPickerWrapper}>
          <AvatarPicker
            uri={avatarUri}
            onSelectImage={(image) => {
              setSelectedAvatar(image);
              setAvatarUri(image?.uri);
            }}
          />
        </View>

        {/* Group Name Input */}
        <View style={styles.fieldGroup}>
          <Typography
            size={14}
            weight="bold"
            color={themeColors.text}
            style={styles.label}
          >
            Name of group
          </Typography>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? themeColors.cardBackground : "white",
                borderColor: getNameBorderColor(),
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: themeColors.text }]}
              placeholder="Name group"
              placeholderTextColor={themeColors.textSecondary}
              value={groupName}
              onChangeText={setGroupName}
              onFocus={() => setIsNameFocused(true)}
              onBlur={() => setIsNameFocused(false)}
              editable={!isCreating}
            />
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.fieldGroup}>
          <Typography
            size={14}
            weight="bold"
            color={themeColors.text}
            style={styles.label}
          >
            Description{" "}
            <Typography size={14} color={themeColors.textSecondary}>
              (Optional)
            </Typography>
          </Typography>
          <View
            style={[
              styles.textAreaContainer,
              {
                backgroundColor: isDark ? themeColors.cardBackground : "white",
                borderColor: getDescBorderColor(),
              },
            ]}
          >
            <TextInput
              style={[styles.textArea, { color: themeColors.text }]}
              placeholder="Type description..."
              placeholderTextColor={themeColors.textSecondary}
              multiline
              value={description}
              onChangeText={setDescription}
              onFocus={() => setIsDescFocused(true)}
              onBlur={() => setIsDescFocused(false)}
              editable={!isCreating}
            />
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.buttonWrapper}>
          <Button
            title={isCreating ? "Creating..." : "Create"}
            onPress={() =>
              onCreate({ name: groupName, description, image: selectedAvatar })
            }
            disabled={!isValid}
            textWeight="bold"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  avatarPickerWrapper: {
    alignItems: "center",
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  inputContainer: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  input: {
    fontSize: 15,
  },
  textAreaContainer: {
    height: 80,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textArea: {
    fontSize: 15,
    textAlignVertical: "top",
  },
  buttonWrapper: {
    marginTop: "auto",
    paddingTop: 16,
    paddingBottom: 40,
  },
});
