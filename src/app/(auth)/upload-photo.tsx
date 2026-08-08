import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { Button } from "@/shared/components/Button";
import { BackButton } from "@/shared/components/BackButton";
import { PhotoPickerModal } from "@/shared/components/PhotoPickerModal";
import { Colors } from "@/shared/constants/colors";

// Icons
import CheckCircleIcon from "@/assets/icons/auth/checkIcon.svg";
import PlaceholderGraphic from "@/assets/icons/auth/Placeholder.svg";
import AddPhotoIcon from "@/assets/icons/auth/add-a-photo.svg";
import UploadingBg from "@/assets/icons/auth/uploading.svg";

type UploadStatus = "idle" | "uploading" | "success";

export default function UploadPhotoScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [showPickerModal, setShowPickerModal] = useState(false);

  // Request permissions and open camera
  const handleTakePhone = async () => {
    setShowPickerModal(false);
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      processImageUpload(result.assets[0].uri);
    }
  };

  // Request permissions and open image library
  const handleChooseFromLibrary = async () => {
    setShowPickerModal(false);
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission to access photo library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      processImageUpload(result.assets[0].uri);
    }
  };

  // Process image upload
  const processImageUpload = (uri: string) => {
    setImageUri(uri);
    setStatus("uploading");

    // Simulate network upload delay
    setTimeout(() => {
      setStatus("success");
    }, 2000);
  };

  const handleNext = () => {
    console.log("Uploaded photo URI:", imageUri);
    router.replace("/(tabs)");
  };

  return (
    <MySafeAreaView color={themeColors.background}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.content}>
          <View style={styles.backButtonWrapper}>
            <BackButton />
          </View>

          <Typography
            variant="h1"
            size={24}
            lineHeight={32}
            weight="bold"
            color={themeColors.text}
            align="center"
            style={styles.title}
          >
            Upload a photo
          </Typography>

          {/* Preview & Status Display */}
          <View style={styles.previewSection}>
            {status === "idle" && (
              <View style={styles.placeholderContainer}>
                {PlaceholderGraphic ? (
                  <PlaceholderGraphic width={160} height={160} />
                ) : (
                  <View
                    style={[
                      styles.avatarCircle,
                      { backgroundColor: themeColors.cardBackground },
                    ]}
                  />
                )}
                <View
                  style={[
                    styles.floatingIcon,
                    { backgroundColor: themeColors.primary },
                  ]}
                >
                  <AddPhotoIcon width={20} height={20} color="#FFFFFF" />
                </View>
              </View>
            )}

            {status === "uploading" && (
              <View style={styles.uploadingContainer}>
                <View style={styles.placeholderContainer}>
                  {UploadingBg ? (
                    <UploadingBg width={160} height={160} />
                  ) : (
                    <View
                      style={[
                        styles.avatarCircle,
                        { backgroundColor: themeColors.cardBackground },
                      ]}
                    />
                  )}
                  <View
                    style={[
                      styles.floatingIcon,
                      { backgroundColor: themeColors.primary },
                    ]}
                  >
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  </View>
                </View>

                <Typography
                  variant="body"
                  size={14}
                  color={themeColors.textSecondary}
                  align="center"
                  style={styles.statusText}
                >
                  Wait a second, your photo{"\n"}is still uploading
                </Typography>
              </View>
            )}

            {status === "success" && imageUri && (
              <View style={styles.successContainer}>
                <View style={styles.avatarWrapper}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.avatarImage}
                  />
                  <View
                    style={[
                      styles.floatingIcon,
                      { backgroundColor: themeColors.primary },
                    ]}
                  >
                    <CheckCircleIcon width={16} height={16} color="#FFFFFF" />
                  </View>
                </View>

                <Typography
                  variant="body"
                  size={14}
                  color={themeColors.textSecondary}
                  align="center"
                  style={styles.statusText}
                >
                  Done! Your photo{"\n"}successfully uploaded
                </Typography>
              </View>
            )}
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.footer}>
          {status === "success" ? (
            <Button title="Next" onPress={handleNext} textWeight="bold" />
          ) : (
            <Button
              title="Upload Photo"
              onPress={() => setShowPickerModal(true)}
              disabled={status === "uploading"}
              textWeight="bold"
            />
          )}
        </View>

        {/* Modular Picker Modal */}
        <PhotoPickerModal
          visible={showPickerModal}
          onClose={() => setShowPickerModal(false)}
          onTakePhoto={handleTakePhone}
          onChooseFromLibrary={handleChooseFromLibrary}
        />
      </View>
    </MySafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  content: {
    paddingTop: 16,
  },
  backButtonWrapper: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 48,
  },
  previewSection: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  placeholderContainer: {
    position: "relative",
    width: 160,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  avatarWrapper: {
    position: "relative",
    width: 120,
    height: 120,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  floatingIcon: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  uploadingContainer: {
    alignItems: "center",
  },
  successContainer: {
    alignItems: "center",
  },
  statusText: {
    marginTop: 24,
    lineHeight: 22,
  },
  footer: {
    paddingBottom: 24,
  },
});
