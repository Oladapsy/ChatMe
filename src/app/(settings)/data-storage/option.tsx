import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { SubScreenHeader } from "@/shared/components/SubScreenHeader";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import CheckIcon from "@/assets/icons/shared/check.svg";
import { AutoDownloadOption } from "@/features/settings/types/settings";

const OPTIONS: AutoDownloadOption[] = ["Off", "Wi-Fi", "Wi-Fi and Cellular"];

export default function AutoDownloadOptionScreen() {
  const router = useRouter();
  const { title } = useLocalSearchParams<{ title: string }>();
  const { isDark, themeColors } = useAppTheme();

  const [selectedOption, setSelectedOption] =
    useState<AutoDownloadOption>("Off");

  return (
    <View style={styles.container}>
      <MySafeAreaView
        edges={["top"]}
        color={isDark ? themeColors.headBg : themeColors.primary}
        style={styles.topSafeArea}
      >
        <SubScreenHeader
          title={title || "Photos"}
          onBack={() => router.back()}
        />
      </MySafeAreaView>

      <MySafeAreaView
        edges={["bottom", "left", "right"]}
        color={themeColors.background}
        style={styles.bodySafeArea}
      >
        <View style={styles.content}>
          {OPTIONS.map((opt) => {
            const isSelected = selectedOption === opt;
            return (
              <React.Fragment key={opt}>
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => setSelectedOption(opt)}
                  activeOpacity={0.7}
                >
                  <Typography
                    size={16}
                    color={themeColors.text}
                    weight="medium"
                  >
                    {opt}
                  </Typography>

                  <View
                    style={[
                      styles.radioCircle,
                      { borderColor: isDark ? "#4A5B61" : "#C4D1D9" },
                      isSelected && {
                        backgroundColor: themeColors.primary,
                        borderColor: themeColors.primary,
                      },
                    ]}
                  >
                    {isSelected && (
                      <CheckIcon width={14} height={14} color="#FFFFFF" />
                    )}
                  </View>
                </TouchableOpacity>
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: isDark ? "#1C2930" : "#E8EEF2" },
                  ]}
                />
              </React.Fragment>
            );
          })}
        </View>
      </MySafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSafeArea: {
    flex: 0,
  },
  bodySafeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
  },
});
