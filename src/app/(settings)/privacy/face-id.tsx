import { StyleSheet, Text, View } from "react-native";
import React from "react";
import MySafeAreaView from "@/shared/components/MySafeAreaView";
import FaceIdOverlay from "@/features/settings/components/FaceIdOverlay";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import { BackButton } from "@/shared/components/BackButton";

export default function FaceId() {
  const { themeColors } = useAppTheme();
  return (
    <MySafeAreaView
      style={{ backgroundColor: themeColors.background, padding: 20 }}
    >
      <View>
        <BackButton />
      </View>
      <Text>face-id</Text>
      <FaceIdOverlay />
    </MySafeAreaView>
  );
}

const styles = StyleSheet.create({});
