import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  useColorScheme,
} from "react-native";

import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import CameraIcon from "@/assets/icons/shared/add-a-photo.svg";
import { useCameraHandler } from "@/features/chats/hooks/useCameraHandler";
import { Button } from "@/shared/components/Button";

interface Props {
  onCreate: (groupData: {
    name: string;
    description: string;
    imageUri?: string;
  }) => void;
  isDark: boolean;
}

export function NameGroupStep({ onCreate, isDark }: Props) {
  const scheme = useColorScheme();
  const themeColors = Colors[scheme === "dark" ? "dark" : "light"];

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string>();

  const { pickImages } = useCameraHandler();

  const handlePickAvatar = async () => {
    const uris = await pickImages();
    if (uris.length > 0) {
      setImageUri(uris[0]);
    }
  };

  const isValid = groupName.trim().length > 0;

  return (
    <View style={styles.container}>
      {/* Circular Avatar Picker */}
      <View style={styles.avatarPickerWrapper}>
        <TouchableOpacity
          style={[
            styles.avatarCircle,
            {
              backgroundColor: isDark ? "#F5FBF7" : "#F2FAF5",
            },
          ]}
          onPress={handlePickAvatar}
          activeOpacity={0.8}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatarImage} />
          ) : (
            <CameraIcon width={36} height={36} color={themeColors.primary} />
          )}
        </TouchableOpacity>
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
              backgroundColor: isDark ? themeColors.cardBackground : "#FFFFFF",
              borderColor: isDark
                ? themeColors.textSecondary
                : themeColors.border,
            },
          ]}
        >
          <TextInput
            style={[styles.input, { color: themeColors.text }]}
            placeholder="Name group"
            placeholderTextColor={themeColors.textSecondary}
            value={groupName}
            onChangeText={setGroupName}
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
              borderColor: isDark
                ? themeColors.textSecondary
                : themeColors.border,
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
          />
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.buttonWrapper}>
        <Button
          title="Create"
          onPress={() => onCreate({ name: groupName, description, imageUri })}
          disabled={!isValid}
          textWeight="bold"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarPickerWrapper: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 132,
    height: 132,
  },
  fieldGroup: {
    marginBottom: 20,
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
  },
});
