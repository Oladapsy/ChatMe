import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  useColorScheme,
} from "react-native";

import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";

// Icons
import CameraIcon from "@/assets/icons/auth/camera.svg";
import GalleryIcon from "@/assets/icons/auth/gallery.svg";

interface PhotoPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onChooseFromLibrary: () => void;
}

export function PhotoPickerModal({
  visible,
  onClose,
  onTakePhoto,
  onChooseFromLibrary,
}: PhotoPickerModalProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

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
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
});
