import { goBackOrHome } from "@/shared/utils/goBackOrHome";
import React, { useState } from "react";
import { Alert, StyleSheet, View} from "react-native";
import { usePinStore } from "@/store/pinStore";
import { useLocalSearchParams, useRouter } from "expo-router";

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

  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const security = usePinStore();
  const [firstPin, setFirstPin] = useState("");
  const [busy, setBusy] = useState(false);
  const disabling = mode === "disable";
  const handleDigitPress = async (digit: string) => {
    if (busy || pin.length >= PIN_LENGTH) return;
    const next = [...pin, digit];
    setPin(next);
    if (next.length !== PIN_LENGTH) return;
    const code = next.join("");
    if (!disabling && !firstPin) { setFirstPin(code); setPin([]); return; }
    if (!disabling && code !== firstPin) {
      Alert.alert("PINs do not match", "Please choose your PIN again.");
      setFirstPin(""); setPin([]); return;
    }
    setBusy(true);
    try {
      if (disabling) {
        if (!await security.verify(code)) throw new Error("Incorrect PIN.");
        await security.disable();
      } else await security.setup(code);
      goBackOrHome(router);
    } catch (error) { Alert.alert("App PIN", error instanceof Error ? error.message : "Could not save PIN."); }
    finally { setBusy(false); setPin([]); }
  };

  const handleDelete = () => {
    if (busy) return;
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
            {disabling ? "Turn off app PIN" : firstPin ? "Confirm your PIN" : "Set up app PIN"}
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
