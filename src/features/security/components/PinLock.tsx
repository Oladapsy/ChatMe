import { useEffect, useState, useRef } from "react";
import { AppState, Modal, View, StyleSheet } from "react-native";
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
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Typography size={24} weight="bold">Unlock ChatMe</Typography>
      <Typography color={themeColors.textSecondary}>{ready ? "Enter your four-digit PIN" : "Loading app security…"}</Typography>
      <Typography size={28} style={{ marginVertical: 24 }}>{"●".repeat(pin.length) + "○".repeat(4 - pin.length)}</Typography>
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
    </View>
  </Modal>;
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 12 } });
