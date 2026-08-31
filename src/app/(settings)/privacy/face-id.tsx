import { StyleSheet, View } from "react-native";
import React from "react";
import MySafeAreaView from "@/shared/components/MySafeAreaView";
import FaceIdOverlay from "@/features/settings/components/FaceIdOverlay";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import { BackButton } from "@/shared/components/BackButton";
import { Typography } from "@/shared/components/Typography";

export default function FaceId() {
  const { themeColors } = useAppTheme();
  return (
    <MySafeAreaView
      style={{ backgroundColor: themeColors.background, padding: 20 }}
    >
      <View style={{marginBottom: 20}}>
        <BackButton />
      </View>
      <Typography>face-id yet to be implemented</Typography>
      <FaceIdOverlay />
    </MySafeAreaView>
  );
}

const styles = StyleSheet.create({});
