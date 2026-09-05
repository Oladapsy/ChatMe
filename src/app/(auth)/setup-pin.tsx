import React, { useState } from "react";
import { StyleSheet, View} from "react-native";
import { useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { BackButton } from "@/shared/components/BackButton";
import Keypad from "@/shared/components/Keypad";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

const PIN_LENGTH = 4;

export default function SetupPinScreen() {
  const router = useRouter();
      const { isDark, themeColors } = useAppTheme();


  const [pin, setPin] = useState<string[]>([]);

  const handleDigitPress = (digit: string) => {
    if (pin.length < PIN_LENGTH) {
      const updatedPin = [...pin, digit];
      setPin(updatedPin);

      if (updatedPin.length === PIN_LENGTH) {
        setTimeout(() => {
          console.log("PIN Created:", updatedPin.join(""));
          router.replace("/(tabs)");
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
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.backButtonWrapper}>
            <BackButton />
          </View>

          <Typography
            variant="h1"
            size={24}
            weight="bold"
            align="center"
            color={themeColors.text}
          >
            Setup pin code
          </Typography>

          <Typography
            variant="body"
            size={14}
            align="center"
            color={themeColors.textSecondary}
            style={styles.subtitle}
          >
            Make sure the code is safe and no one{"\n"}else knows.
          </Typography>

          {/* 4 PIN Indicator Dots */}
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
                        : themeColors.border
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
  backButtonWrapper: {
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
