import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, useColorScheme } from "react-native";
import { useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import Keypad from "@/shared/components/Keypad";
import { Colors } from "@/shared/constants/colors";
import ChevronLeft from "@/assets/icons/auth/chevron-left.svg";

const PIN_LENGTH = 4;

export default function SetupPinScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const [pin, setPin] = useState<string[]>([]);

  const handleDigitPress = (digit: string) => {
    if (pin.length < PIN_LENGTH) {
      const updatedPin = [...pin, digit];
      setPin(updatedPin);

      if (updatedPin.length === PIN_LENGTH) {
        setTimeout(() => {
          console.log("PIN Created:", updatedPin.join(""));
        //   router.replace("/(tabs)");
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <MySafeAreaView color={themeColors.background}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                borderColor: isDark ? "#2D4B63" : "#E5E7EB",
                backgroundColor: isDark ? "#1F3C51" : "#FFFFFF",
              },
            ]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            {ChevronLeft ? (
              <ChevronLeft width={20} height={20} color={themeColors.text} />
            ) : (
              <Typography>←</Typography>
            )}
          </TouchableOpacity>

          <Typography
            variant="h1"
            size={22}
            weight="bold"
            align="center"
            color={themeColors.text}
          >
            Setup pin code
          </Typography>

          <Typography
            variant="body"
            size={13}
            align="center"
            color={themeColors.textSecondary}
            style={styles.subtitle}
          >
            Make sure the code is safe and no one{"\n"}else knows.
          </Typography>

          {/* 4 Pin Indicator Dots */}
          <View style={styles.dotContainer}>
            {Array.from({ length: PIN_LENGTH }).map((_, index) => {
              const isFilled = index < pin.length;
              return (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: isFilled
                        ? themeColors.primary
                        : "transparent",
                      borderColor: isFilled
                        ? themeColors.primary
                        : isDark
                        ? "#2D4B63"
                        : "#E5E7EB",
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Custom Keypad */}
        <View style={styles.keypadWrapper}>
          <Keypad onPressDigit={handleDigitPress} onDelete={handleDelete} />
        </View>
      </View>
    </MySafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    paddingTop: 16,
    alignItems: "center",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 32,
  },
  subtitle: {
    marginTop: 8,
    lineHeight: 18,
  },
  dotContainer: {
    flexDirection: "row",
    gap: 16,
    marginTop: 32,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
  },
  keypadWrapper: {
    width: "100%",
  },
});