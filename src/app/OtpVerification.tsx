import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    NativeSyntheticEvent,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    useColorScheme,
    View,
} from "react-native";

import { BackButton } from "@/shared/components/BackButton";
import { Button } from "@/shared/components/Button";
import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";

const OTP_LENGTH = 4;
const RESEND_TIMER = 30;

export default function OtpVerificationScreen() {
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

  // Countdown timer effect
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Handle single character entry and auto-focus next box
  const handleChangeText = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, "");

    // Handle complete code paste
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

  // Handle backspace navigation between boxes using inline generic event typing
  const handleKeyPress = (
    e: NativeSyntheticEvent<{ key: string }>,
    index: number,
  ) => {
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

  const handleVerify = () => {
    if (!isComplete) return;
    const code = otp.join("");
    console.log("Verifying OTP:", code);
    // router.push("/(auth)/setup-profile");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <MySafeAreaView color={themeColors.background}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.content}>
            {/* Reusable Back Button */}
            <View style={styles.backButtonWrapper}>
              <BackButton />
            </View>

            {/* Header Text */}
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

            {/* OTP Input Fields */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => {
                const isFocused = focusedIndex === index;
                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      {
                        backgroundColor: themeColors.inputBackground,
                        borderColor: isFocused
                          ? themeColors.primary
                          : themeColors.border,
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

            {/* Resend Code Section */}
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

          {/* Action Button */}
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
  backButtonWrapper: {
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
