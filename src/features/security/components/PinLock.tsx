import { useEffect, useState, useRef } from "react";
import { AppState, Modal, ScrollView, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePinStore } from "@/store/pinStore";
import Keypad from "@/shared/components/Keypad";
import { Typography } from "@/shared/components/Typography";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

export function PinLock({ authenticated }: { authenticated: boolean }) {
  const { ready, locked, initialize, lock, verify } = usePinStore();
  const { themeColors } = useAppTheme();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const busy = useRef(false);
  useEffect(() => { void initialize().catch(() => setError("Unable to load app security. Restart the app.")); }, [initialize]);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", state => {
      if (state === "background") { lock(); setPin(""); }
    });
    return () => subscription.remove();
  }, [lock]);
  return <Modal visible={authenticated && (!ready || locked)} animationType="none" onRequestClose={() => {}}>
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Typography size={24} lineHeight={32} weight="bold" align="center">Unlock ChatMe</Typography>
      <Typography color={themeColors.textSecondary} align="center">{ready ? "Enter your four-digit PIN" : "Loading app security…"}</Typography>
      <View style={styles.dots} accessible accessibilityLabel={`${pin.length} of 4 PIN digits entered`}>
        {Array.from({ length: 4 }, (_, index) => <View key={index} style={[styles.dot, { borderColor: themeColors.text, backgroundColor: index < pin.length ? themeColors.text : "transparent" }]} />)}
      </View>
      <Typography color={themeColors.error}>{error}</Typography>
      <Keypad onDelete={() => { if (!busy.current) setPin(value => value.slice(0, -1)); }} onPressDigit={digit => {
        if (!ready || busy.current) return;
        const next = pin + digit;
        setPin(next);
        if (next.length === 4) {
          busy.current = true;
          void verify(next).then(valid => { if (!valid) setError("Incorrect PIN. Try again."); else setError(""); })
            .catch(err => setError(err.message)).finally(() => { setPin(""); busy.current = false; });
        }
      }} />
    </ScrollView>
    </SafeAreaView>
  </Modal>;
}
const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 12 },
  dots: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, paddingVertical: 24 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
});
