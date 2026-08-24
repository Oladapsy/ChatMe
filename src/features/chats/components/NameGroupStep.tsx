import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";

import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import CameraIcon from "@/assets/icons/shared/camera.svg";
import { useCameraHandler } from "@/features/chats/hooks/useCameraHandler";

interface Props {
  onCreate: (groupData: { name: string; description: string; imageUri?: string }) => void;
  isDark: boolean;
}

export function NameGroupStep({ onCreate, isDark }: Props) {
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
            { backgroundColor: isDark ? "#F2FAF5" : "#F2FAF5" },
          ]}
          onPress={handlePickAvatar}
          activeOpacity={0.8}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatarImage} />
          ) : (
            <CameraIcon width={36} height={36} color={Colors.light.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Group Name Input */}
      <View style={styles.fieldGroup}>
        <Typography
          size={14}
          weight="medium"
          color={isDark ? "#FFFFFF" : "#1F3C51"}
          style={styles.label}
        >
          Name of group
        </Typography>
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: isDark ? "#162B3A" : "#FFFFFF",
              borderColor: isDark ? "#233F53" : "#EAEEF2",
            },
          ]}
        >
          <TextInput
            style={[styles.input, { color: isDark ? "#FFFFFF" : "#081C2C" }]}
            placeholder="Name group"
            placeholderTextColor={isDark ? "#526E82" : "#94A3B8"}
            value={groupName}
            onChangeText={setGroupName}
          />
        </View>
      </View>

      {/* Description Input */}
      <View style={styles.fieldGroup}>
        <Typography
          size={14}
          weight="medium"
          color={isDark ? "#FFFFFF" : "#1F3C51"}
          style={styles.label}
        >
          Description{" "}
          <Typography size={14} color={isDark ? "#718EA3" : "#6E8597"}>
            (Optional)
          </Typography>
        </Typography>
        <View
          style={[
            styles.textAreaContainer,
            {
              backgroundColor: isDark ? "#162B3A" : "#FFFFFF",
              borderColor: isDark ? "#233F53" : "#EAEEF2",
            },
          ]}
        >
          <TextInput
            style={[
              styles.textArea,
              { color: isDark ? "#FFFFFF" : "#081C2C" },
            ]}
            placeholder="Type description..."
            placeholderTextColor={isDark ? "#526E82" : "#94A3B8"}
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={[
          styles.actionBtn,
          {
            backgroundColor: isValid
              ? Colors.light.primary
              : isDark
                ? "#57B77D"
                : "#ABDBBE",
            opacity: isValid ? 1 : 0.8,
          },
        ]}
        onPress={() => onCreate({ name: groupName, description, imageUri })}
        disabled={!isValid}
        activeOpacity={0.8}
      >
        <Typography size={16} weight="bold" color="white">
          Create
        </Typography>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarPickerWrapper: {
    alignItems: "center",
    marginBottom: 28,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 120,
    height: 120,
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
  actionBtn: {
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
  },
});