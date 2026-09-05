import React from "react";
import {
  Modal,
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
import { Typography } from "@/shared/components/Typography";
import { useAppTheme } from "../hooks/useAppTheme";

interface Props {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
}

export function CustomAlertModal({
  visible,
  title,
  message,
  buttonText = "OK",
  onClose,
}: Props) {
    const { isDark, themeColors } = useAppTheme();


  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: isDark ? "#192B3A" : "#FFFFFF" },
          ]}
        >
          <Typography
            size={18}
            weight="bold"
            color={themeColors.text}
            style={styles.title}
          >
            {title}
          </Typography>

          <Typography
            size={14}
            color={isDark ? "#8EA3B3" : "#6E8597"}
            style={styles.message}
          >
            {message}
          </Typography>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: themeColors.primary }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Typography size={16} weight="bold" color="white">
              {buttonText}
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  container: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    width: "100%",
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
});
