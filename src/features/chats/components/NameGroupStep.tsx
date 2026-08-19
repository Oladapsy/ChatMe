import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import CameraIcon from "@/assets/icons/shared/camera.svg";

interface Props {
  onCreate: (groupData: { name: string; description: string; imageUri?: string }) => void;
  isDark: boolean;
}

export function NameGroupStep({ onCreate, isDark }: Props) {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string>();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const isValid = groupName.trim().length > 0;

  return (
    <View style={styles.container}>
      <Typography
        size={18}
        weight="bold"
        align="center"
        color={isDark ? "#FFFFFF" : "#081C2C"}
        style={styles.title}
      >
        New Group
      </Typography>

      {/* Circular Avatar Picker */}
      <View style={styles.avatarPickerWrapper}>
        <TouchableOpacity
          style={[
            styles.avatarCircle,
            { backgroundColor: isDark ? "#163043" : "#F2FAF5" },
          ]}
          onPress={pickImage}
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
          color={isDark ? "#DDE2E8" : "#1F3C51"}
          style={styles.label}
        >
          Name of group
        </Typography>
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: isDark ? "#163043" : "#FFFFFF",
              borderColor: isDark ? "#254156" : "#EAEEF2",
            },
          ]}
        >
          <TextInput
            style={[styles.input, { color: isDark ? "#FFFFFF" : "#081C2C" }]}
            placeholder="Name group"
            placeholderTextColor={isDark ? "#536878" : "#94A3B8"}
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
          color={isDark ? "#DDE2E8" : "#1F3C51"}
          style={styles.label}
        >
          Description{" "}
          <Typography size={14} color={isDark ? "#8EA3B3" : "#6E8597"}>
            (Optional)
          </Typography>
        </Typography>
        <View
          style={[
            styles.textAreaContainer,
            {
              backgroundColor: isDark ? "#163043" : "#FFFFFF",
              borderColor: isDark ? "#254156" : "#EAEEF2",
            },
          ]}
        >
          <TextInput
            style={[
              styles.textArea,
              { color: isDark ? "#FFFFFF" : "#081C2C" },
            ]}
            placeholder="Type description..."
            placeholderTextColor={isDark ? "#536878" : "#94A3B8"}
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
                ? "#254156"
                : "#ABDBBE",
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
  title: {
    marginBottom: 20,
  },
  avatarPickerWrapper: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 100,
    height: 100,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  inputContainer: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  input: {
    fontSize: 14,
  },
  textAreaContainer: {
    height: 80,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textArea: {
    fontSize: 14,
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