import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import BackIcon from "@/assets/icons/shared/chevron-left.svg";
import CameraIcon from "@/assets/icons/shared/camera.svg";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Props {
  name: string;
  phone: string;
  avatarUri?: string;
  qrValue: string;
  onBack: () => void;
  onScanQrPress?: () => void;
}

export function UserQrCodeScreen({
  name,
  phone,
  avatarUri,
  qrValue,
  onBack,
  onScanQrPress,
}: Props) {
  const { isDark, themeColors } = useAppTheme();

  return (
    <MySafeAreaView color={isDark ? themeColors.qrBg : themeColors.primary}>
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? themeColors.qrBg : themeColors.primary },
        ]}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
            <BackIcon width={24} height={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Main Content Area */}
        <View style={styles.content}>
          {/* White Card Container */}
          <View style={styles.card}>
            {/* Circular Avatar */}
            <View style={styles.avatarWrapper}>
              <Image
                source={
                  avatarUri
                    ? { uri: avatarUri }
                    : require("@/assets/images/default-avatar.png")
                }
                style={styles.avatar}
              />
            </View>

            {/* User Details */}
            <View style={styles.userInfo}>
              <Typography size={20} weight="bold" color="#081C2C">
                {name}
              </Typography>
              <Typography size={14} color="#6E8597">
                {phone}
              </Typography>
            </View>

            {/* QR Code Graphic */}
            <View style={styles.qrContainer}>
              <QRCode
                value={qrValue}
                size={SCREEN_WIDTH * 0.62}
                logoMargin={2}
              />
            </View>
          </View>
        </View>

        {/* Bottom Floating Scan QR Action */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.scanBtn}
            activeOpacity={0.8}
            onPress={onScanQrPress}
          >
            <CameraIcon width={22} height={22} color="white" />
            <Typography size={15} weight="bold" color="white">
              Scan QR code
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </MySafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 52,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 24,
    position: "relative",
  },
  avatarWrapper: {
    position: "absolute",
    top: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  userInfo: {
    alignItems: "center",
    gap: 4,
    marginBottom: 28,
  },
  qrContainer: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    alignItems: "center",
    paddingBottom: 24,
  },
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF1F",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
    gap: 10,
  },
});
