import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  useColorScheme,
} from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";

// Icons
import CameraIcon from "@/assets/icons/shared/camera.svg";
import GalleryIcon from "@/assets/icons/shared/gallery.svg";
import DocumentIcon from "@/assets/icons/chat/document.svg";
import LocationIcon from "@/assets/icons/chat/location.svg";
import ContactIcon from "@/assets/icons/chat/contact2.svg";

// expo media library (new stable class-based API)
import {
  AssetField,
  MediaType,
  Query,
  requestPermissionsAsync,
} from "expo-media-library";

interface Props {
  visible: boolean;
  onClose: () => void;
  onOpenCamera: () => void;
  onOpenGallery: () => void;
  onSelectImage: (uri: string) => void; // Added back to handle thumbnail selections
  onSelectDocument: () => void;
  onSelectLocation: () => void;
  onSelectContact: () => void;
}

interface GalleryPreview {
  id: string;
  uri: string;
}

export function AttachmentModal({
  visible,
  onClose,
  onOpenCamera,
  onOpenGallery,
  onSelectImage,
  onSelectDocument,
  onSelectLocation,
  onSelectContact,
}: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

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

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheetCard,
                { backgroundColor: themeColors.cardBackground },
              ]}
            >
              {/* Horizontal Media Previews */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mediaRow}
                keyboardShouldPersistTaps="handled"
              >
                {/* Expo Camera Tile */}
                <TouchableOpacity
                  style={[
                    styles.cameraTile,
                    { backgroundColor: isDark ? "#254156" : "#EAEEF2" },
                  ]}
                  onPress={() => {
                    onClose();
                    onOpenCamera();
                  }}
                >
                  <CameraIcon
                    width={25}
                    height={23}
                    color={themeColors.textSecondary}
                  />
                </TouchableOpacity>

                {/* Recent gallery thumbnails, tap to select and close */}
                {previews.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      onSelectImage(item.uri);
                      onClose(); // Closes the modal sheet so the image preview is visible
                    }}
                  >
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.photoTile}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Attachment Actions */}
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    onClose();
                    onOpenGallery();
                  }}
                >
                  <GalleryIcon
                    width={20}
                    height={20}
                    color={themeColors.primary}
                  />
                  <Typography
                    size={16}
                    weight="medium"
                    color={themeColors.modalText}
                    style={styles.label}
                  >
                    Photo or Gallery
                  </Typography>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    onClose();
                    onSelectDocument();
                  }}
                >
                  <DocumentIcon
                    width={20}
                    height={20}
                    color={themeColors.primary}
                  />
                  <Typography
                    size={16}
                    weight="medium"
                    color={themeColors.modalText}
                    style={styles.label}
                  >
                    Document
                  </Typography>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    onClose();
                    onSelectLocation();
                  }}
                >
                  <LocationIcon
                    width={20}
                    height={20}
                    color={themeColors.primary}
                  />
                  <Typography
                    size={16}
                    weight="medium"
                    color={themeColors.modalText}
                    style={styles.label}
                  >
                    Location
                  </Typography>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    onClose();
                    onSelectContact();
                  }}
                >
                  <ContactIcon
                    width={20}
                    height={20}
                    color={themeColors.primary}
                  />
                  <Typography
                    size={16}
                    weight="medium"
                    color={themeColors.modalText}
                    style={styles.label}
                  >
                    Contact
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 115,
  },
  sheetCard: {
    borderRadius: 16,
    paddingVertical: 16,
  },
  mediaRow: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 12,
  },
  cameraTile: {
    width: 68,
    height: 68,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  photoTile: {
    width: 68,
    height: 68,
    borderRadius: 8,
  },
  optionsContainer: {
    paddingHorizontal: 16,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  label: {
    marginLeft: 14,
  },
});
