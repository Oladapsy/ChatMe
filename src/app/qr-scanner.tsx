import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";

import BackIcon from "@/assets/icons/shared/chevron-left.svg";
import FlashIcon from "@/assets/icons/chat/flash.svg";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";

export default function QRScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [scanned, setScanned] = useState(false);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Typography size={16} color="white" style={{ marginBottom: 16 }}>
          We need your permission to show the camera
        </Typography>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Typography size={15} weight="bold" color="white">
            Grant Permission
          </Typography>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    // Process scanned contact payload (e.g. JSON or phone string)
    // Navigates back or populates form state
    router.back();
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        // facing="back"
      />

      {/* Top Controls */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconCircle}
        >
          <BackIcon width={22} height={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Viewfinder Reticle */}
      <View style={styles.overlay}>
        <View style={styles.scannerBox}>
          {/* Green Corner Brackets */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.flashButton}
          onPress={() => setTorch((prev) => !prev)}
        >
          <FlashIcon
            width={22}
            height={22}
            color={torch ? "#52C47C" : "#FFFFFF"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0E1D2A",
    padding: 20,
  },
  permBtn: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  topBar: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scannerBox: {
    width: 280,
    height: 280,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 32,
    height: 32,
    borderColor: Colors.dark.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  bottomBar: {
    position: "absolute",
    bottom: 60,
    alignSelf: "center",
  },
  flashButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
});
