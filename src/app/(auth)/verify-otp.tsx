import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { Button } from "@/shared/components/Button";
import { Colors } from "@/shared/constants/colors";

import ChevronLeft from "@/assets/icons/auth/chevron-left.svg";

const OTP_LENGTH = 4;
const RESEND_TIMER = 60;

export default function VerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const phone = params.phone || "+62 85-830-544-382";

  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [timer, setTimer] = useState<number>(RESEND_TIMER);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChangeText = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, "");

    if (cleanText.length >= OTP_LENGTH) {
      const codeArray = cleanText.slice(0, OTP_LENGTH).split("");
      setOtp(codeArray);
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleanText.slice(-1);
    setOtp(newOtp);

    if (cleanText && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isComplete = otp.every((digit) => digit !== "");

  const handleResendCode = () => {
    if (timer > 0) return;
    setTimer(RESEND_TIMER);
    setOtp(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
  };

  const handleVerify = async () => {
    if (!isComplete) return;

    // Example auth logic:
    // const response = await verifyOtpApi({ phone, code: otp.join("") });
    const isNewUser = true; // Replace with actual logic to determine if the user is new

    if (isNewUser) {
      router.push("/(auth)/setup-profile");
    } else {
      // router.replace("/(tabs)");
      console.log("Existing user, navigate to main app screen");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <MySafeAreaView color={themeColors.background}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.content}>
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
              size={24}
              lineHeight={32}
              weight="bold"
              color={themeColors.text}
              style={styles.title}
            >
              Verification code
            </Typography>

            <Typography
              variant="body"
              size={14}
              color={themeColors.textSecondary}
              style={styles.subtitle}
            >
              Enter the code number we sent to{" "}
              <Typography
                variant="body"
                size={14}
                weight="bold"
                color={themeColors.text}
              >
                {phone}
              </Typography>
            </Typography>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => {
                const isFocused = focusedIndex === index;
                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      {
                        backgroundColor: isDark ? "#1F3C51" : "#F9FAFB",
                        borderColor: isFocused
                          ? themeColors.primary
                          : isDark
                            ? "#2D4B63"
                            : "#E5E7EB",
                      },
                    ]}
                  >
                    <TextInput
                      ref={(ref) => {
                        inputRefs.current[index] = ref;
                      }}
                      style={[styles.otpInput, { color: themeColors.text }]}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(text) => handleChangeText(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      onFocus={() => setFocusedIndex(index)}
                      onBlur={() => setFocusedIndex(-1)}
                      selectTextOnFocus
                    />
                  </View>
                );
              })}
            </View>

            <View style={styles.resendContainer}>
              <Typography
                variant="body"
                size={13}
                color={themeColors.textSecondary}
                align="center"
              >
                If you don't get the code, resend it in{" "}
                <Typography
                  variant="body"
                  size={13}
                  weight="bold"
                  color={themeColors.text}
                >
                  {timer} seconds
                </Typography>
                .
              </Typography>

              {timer === 0 && (
                <TouchableOpacity
                  onPress={handleResendCode}
                  activeOpacity={0.7}
                  style={styles.resendButton}
                >
                  <Typography
                    variant="body"
                    size={14}
                    weight="bold"
                    color={themeColors.primary}
                    align="center"
                  >
                    Resend code
                  </Typography>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <Button
              title="Next"
              onPress={handleVerify}
              disabled={!isComplete}
              textWeight="bold"
            />
          </View>
        </KeyboardAvoidingView>
      </MySafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  content: {
    paddingTop: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 20,
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 32,
  },
  otpBox: {
    flex: 1,
    height: 64,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  otpInput: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    width: "100%",
    height: "100%",
  },
  resendContainer: {
    alignItems: "center",
    gap: 8,
  },
  resendButton: {
    paddingVertical: 4,
  },
  footer: {
    paddingBottom: 24,
  },
});
