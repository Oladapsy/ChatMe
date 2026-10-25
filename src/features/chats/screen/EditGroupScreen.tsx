import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { BackButton } from "@/shared/components/BackButton";
import { Button } from "@/shared/components/Button";
import { Typography } from "@/shared/components/Typography";

import {
  AvatarPicker,
  type SelectedImage,
} from "@/features/contacts/components/AvatarPicker";
import { FormInput } from "@/features/contacts/components/FormInput";

import { useAppTheme } from "@/shared/hooks/useAppTheme";
import type { GroupDetails } from "@/features/chats/types/chat";

interface Props {
  groupDetails: GroupDetails;
  saving?: boolean;
  onBack: () => void;
  onSave: (values: {
    name: string;
    selectedAvatar?: SelectedImage;
  }) => Promise<void>;
}

export function EditGroupScreen({
  groupDetails,
  saving = false,
  onBack,
  onSave,
}: Props) {
  const { isDark, themeColors } = useAppTheme();

  const [name, setName] = useState(groupDetails.name);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(
    groupDetails.coverImageUri,
  );
  const [selectedAvatar, setSelectedAvatar] = useState<
    SelectedImage | undefined
  >();

  useEffect(() => {
    setName(groupDetails.name);
    setAvatarUri(groupDetails.coverImageUri);
    setSelectedAvatar(undefined);
  }, [groupDetails]);

  const isValid = name.trim().length > 0;

  const handleSave = async () => {
    if (!isValid || saving) return;

    await onSave({
      name: name.trim(),
      selectedAvatar,
    });
  };

  return (
    <MySafeAreaView
      color={isDark ? themeColors.headBg : themeColors.primary}
      edges={["top"]}
    >
      <View
        style={[styles.container, { backgroundColor: themeColors.background }]}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: isDark
                ? themeColors.headBg
                : themeColors.primary,
            },
          ]}
        >
          <BackButton showBorder={false} Iconcolor="white" />

          <Typography size={18} weight="bold" color="white">
            Edit group
          </Typography>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarContainer}>
            <AvatarPicker
              uri={avatarUri}
              onSelectImage={(image) => {
                if (image) {
                  setSelectedAvatar(image);
                  setAvatarUri(image.uri);
                }
              }}
            />

            <Typography
              size={13}
              color={themeColors.textSecondary}
              style={styles.avatarHint}
            >
              Tap the photo to change the group picture
            </Typography>
          </View>

          <FormInput
            label="Group name"
            placeholder="Enter group name"
            value={name}
            onChangeText={setName}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Cancel" onPress={onBack} disabled={saving} />

          <View style={styles.buttonSpacing} />

          <Button
            title="Save changes"
            onPress={handleSave}
            loading={saving}
            disabled={!isValid || saving}
            textWeight="bold"
          />
        </View>
      </View>
    </MySafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarHint: {
    marginTop: 12,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  buttonSpacing: {
    height: 12,
  },
});
