import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";

import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";

// Icons
import CameraIcon from "@/assets/icons/auth/camera.svg";
import GalleryIcon from "@/assets/icons/auth/gallery.svg";

// Expo Media Library
import {
  AssetField,
  MediaType,
  Query,
  requestPermissionsAsync,
} from "expo-media-library";
import { useAppTheme } from "../hooks/useAppTheme";

interface PhotoPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onChooseFromLibrary: () => void;
  onSelectImage: (uri: string) => void;
}

interface GalleryPreview {
  id: string;
  uri: string;
}

export function PhotoPickerModal({
  visible,
  onClose,
  onTakePhoto,
  onChooseFromLibrary,
  onSelectImage,
}: PhotoPickerModalProps) {
    const { isDark, themeColors } = useAppTheme();


  const [previews, setPreviews] = useState<GalleryPreview[]>([]);

  useEffect(() => {
    if (!visible) return;

    const loadRecentPhotos = async () => {
      const { status } = await requestPermissionsAsync();
      if (status !== "granted") return;

      const assets = await new Query()
        .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
        .orderBy({ key: AssetField.CREATION_TIME, ascending: false })
        .limit(20)
        .exe();

      const resolved = await Promise.all(
        assets.map(async (asset) => ({
          id: asset.id,
          uri: await asset.getUri(),
        })),
      );

      setPreviews(resolved);
    };

    loadRecentPhotos();
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: themeColors.cardBackground },
              ]}
            >
              {/* Horizontal Media Previews */}
              {previews.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.mediaRow}
                  keyboardShouldPersistTaps="handled"
                >
                  <TouchableOpacity
                    style={[
                      styles.cameraTile,
                      { backgroundColor: isDark ? "#254156" : "#EAEEF2" },
                    ]}
                    onPress={onTakePhoto}
                  >
                    <CameraIcon
                      width={25}
                      height={25}
                      color={themeColors.textSecondary}
                    />
                  </TouchableOpacity>

                  {previews.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => onSelectImage(item.uri)}
                    >
                      <Image
                        source={{ uri: item.uri }}
                        style={styles.photoTile}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Action Buttons */}
              <TouchableOpacity
                style={styles.optionRow}
                onPress={onTakePhoto}
                activeOpacity={0.7}
              >
                <CameraIcon
                  width={25}
                  height={25}
                  color={themeColors.primary}
                />

                <Typography
                  variant="body"
                  weight="medium"
                  color={themeColors.text}
                >
                  Take Photo
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionRow}
                onPress={onChooseFromLibrary}
                activeOpacity={0.7}
              >
                <GalleryIcon
                  width={20}
                  height={20}
                  color={themeColors.primary}
                />

                <Typography
                  variant="body"
                  weight="medium"
                  color={themeColors.text}
                >
                  Choose From Library
                </Typography>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  mediaRow: {
    gap: 10,
    paddingBottom: 4,
  },
  cameraTile: {
    width: 68,
    height: 68,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  photoTile: {
    width: 68,
    height: 68,
    borderRadius: 12,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
});