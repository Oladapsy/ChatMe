import React from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ActionSheetIOS,
  Platform,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import CameraPlusIcon from "@/assets/icons/shared/cameraPlus.svg";
import UserIcon from "@/assets/icons/shared/user.svg";
import { Colors } from "@/shared/constants/colors";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

interface Props {
  uri?: string;
  onSelectImage?: (uri: string | undefined) => void;
}

export function AvatarPicker({ uri, onSelectImage }: Props) {
  const { themeColors } = useAppTheme();

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Camera roll access is required.");
      return;
    }

    // ✅ SDK 52/57 updated mediaTypes syntax
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      if (onSelectImage) {
        onSelectImage(result.assets[0].uri);
      }
    }
  };

  const handlePress = () => {
    if (!uri) {
      handlePickImage();
      return;
    }

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Change Photo", "Remove Photo"],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handlePickImage();
          if (buttonIndex === 2 && onSelectImage) onSelectImage(undefined);
        },
      );
    } else {
      Alert.alert("Profile Photo", "Choose an option", [
        { text: "Cancel", style: "cancel" },
        { text: "Change Photo", onPress: handlePickImage },
        {
          text: "Remove Photo",
          onPress: () => onSelectImage?.(undefined),
          style: "destructive",
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[styles.avatarCircle, { borderColor: themeColors.background }]}
      >
        {uri ? (
          <Image source={{ uri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <UserIcon width={81} height={87} color="white" />
          </View>
        )}
        <View
          style={[
            styles.cameraBadge,
            {
              borderColor: themeColors.background,
              backgroundColor: themeColors.primary,
            },
          ]}
        >
          <CameraPlusIcon width={16} height={16} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCircle: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: "#B3C2CE",
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
  },
});
