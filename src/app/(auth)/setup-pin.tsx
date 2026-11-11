import { goBackOrHome } from "@/shared/utils/goBackOrHome";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View} from "react-native";
import { usePinStore } from "@/store/pinStore";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { BackButton } from "@/shared/components/BackButton";
import Keypad from "@/shared/components/Keypad";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

const PIN_LENGTH = 4;

export default function SetupPinScreen() {
  const router = useRouter();
      const { themeColors } = useAppTheme();


  const [pin, setPin] = useState<string[]>([]);

  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const security = usePinStore();
  const [firstPin, setFirstPin] = useState("");
  const [busy, setBusy] = useState(false);
  const disabling = mode === "disable";
  const handleDigitPress = async (digit: string) => {
    if (!security.ready || busy || pin.length >= PIN_LENGTH) return;
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

  if (security.ready && security.enabled && !disabling) return <Redirect href="/(tabs)" />;
  if (security.ready && !security.enabled && disabling) return <Redirect href="/(tabs)" />;

  return (
    <MySafeAreaView color={themeColors.background}>
      <View style={styles.backButtonWrapper}>
        <BackButton />
      </View>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>

          <Typography
            variant="h1"
            size={24}
            lineHeight={32}
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
            {disabling ? "Enter your current PIN to turn off app locking." : firstPin ? "Enter the same four digits again." : "Choose a four-digit PIN to protect your chats."}
          </Typography>

          {/* 4 PIN Indicator Dots */}
          <View style={styles.dotContainer} accessible accessibilityLabel={`${pin.length} of ${PIN_LENGTH} PIN digits entered`}>
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
      </ScrollView>
    </MySafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    gap: 32,
  },
  header: {
    alignItems: "center",
  },
  backButtonWrapper: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  subtitle: {
    marginTop: 8,
    lineHeight: 18,
  },
  dotContainer: {
    flexDirection: "row",
    gap: 16,
    marginTop: 24,
    paddingVertical: 8,
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
