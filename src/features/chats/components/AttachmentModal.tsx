import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
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

interface Props {
  visible: boolean;
  onClose: () => void;
  onOpenCamera: () => void;
  onOpenGallery: () => void;
  onSelectDocument: () => void;
  onSelectLocation: () => void;
  onSelectContact: () => void;
}

const RECENT_PREVIEWS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
];

export function AttachmentModal({
  visible,
  onClose,
  onOpenCamera,
  onOpenGallery,
  onSelectDocument,
  onSelectLocation,
  onSelectContact,
}: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
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

                {/* Quick Gallery Thumbnails */}
                {RECENT_PREVIEWS.map((uri, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      onClose();
                      onOpenGallery();
                    }}
                  >
                    <Image source={{ uri }} style={styles.photoTile} />
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
                  <GalleryIcon width={20} height={20} color={themeColors.primary} />
                  <Typography
                   size={16}
                    weight="medium"
                    color={themeColors.text}
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
                  <DocumentIcon width={20} height={20} color={themeColors.primary} />
                  <Typography
                   size={16}
                    weight="medium"
                    color={themeColors.text}
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
                  <LocationIcon width={20} height={20} color={themeColors.primary} />
                  <Typography
                    size={16}
                    weight="medium"
                    color={themeColors.text}
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
                  <ContactIcon width={20} height={20} color={themeColors.primary} />
                  <Typography
                    size={16}
                    weight="medium"
                    color={themeColors.text}
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
    </Modal>
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
    borderRadius: 24,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
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
