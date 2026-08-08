import React from "react";
import {
  Modal,
  StyleSheet,
  View,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Button } from "@/shared/components/Button";
import { Colors } from "@/shared/constants/colors";
import LockIcon from "@/assets/icons/security/lock-closed.svg";

interface PinPromptModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function PinPromptModal({
  visible,
  onAccept,
  onDecline,
}: PinPromptModalProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? "#163043" : "#FFFFFF" },
          ]}
        >
          {/* Top Floating Lock Icon */}
          <View
            style={[
              styles.iconBadge,
            { backgroundColor: isDark ? "#1F3C51" : "#FFFFFF" },
            ]}
          >
            <LockIcon width={24} height={24} color={themeColors.primary} />
          </View>

          <Typography
            variant="h2"
            size={18}
            weight="bold"
            align="center"
            color={themeColors.text}
            style={styles.title}
          >
            Do you want to add a pin code?
          </Typography>

          <Typography
            variant="body"
            size={13}
            align="center"
            color={themeColors.textSecondary}
            style={styles.subtitle}
          >
            Add a verification code to make it more secure.
          </Typography>

          <View style={styles.buttonGroup}>
            <Button title="Yes" onPress={onAccept} textWeight="bold" />
            <TouchableOpacity
              onPress={onDecline}
              style={[
                styles.declineButton,
                { backgroundColor: isDark ? "#1F3C51" : "#F4FDF9" },
              ]}
              activeOpacity={0.7}
            >
              <Typography weight="bold" color={themeColors.primary}>
                No, thanks
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  card: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -48,
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 18,
    marginBottom: 24,
  },
  buttonGroup: {
    width: "100%",
    gap: 12,
  },
  declineButton: {
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
