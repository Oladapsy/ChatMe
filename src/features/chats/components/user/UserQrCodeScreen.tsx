import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  useColorScheme,
  Dimensions,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import BackIcon from "@/assets/icons/shared/chevron-left.svg";
import CameraIcon from "@/assets/icons/shared/gallery.svg";

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
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#06131E" : "#F4F6F8" }]}>
      {/* Top Header */}
      <MySafeAreaView edges={["top"]} color="transparent">
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
            <BackIcon width={24} height={24} color="white" />
          </TouchableOpacity>
        </View>
      </MySafeAreaView>

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
            <Typography size={20} weight="bold" color="#0F2637">
              {name}
            </Typography>
            <Typography size={14} color="#64748B">
              {phone}
            </Typography>
          </View>

          {/* QR Code Graphic */}
          <View style={styles.qrContainer}>
            <QRCode value={qrValue} size={SCREEN_WIDTH * 0.62} logoMargin={2} />
          </View>
        </View>
      </View>

      {/* Bottom Floating Scan QR Action */}
      <MySafeAreaView edges={["bottom"]} color="transparent">
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
      </MySafeAreaView>
    </View>
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
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 24,
    position: "relative",
  },
  avatarWrapper: {
    position: "absolute",
    top: -44,
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
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
    backgroundColor: "#1E3447",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
    gap: 10,
  },
});