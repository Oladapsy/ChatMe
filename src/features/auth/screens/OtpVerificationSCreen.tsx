import { RecoveryState } from "@/shared/components/RecoveryState";
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
  View,
} from "react-native";

import { BackButton } from "@/shared/components/BackButton";
import { Button } from "@/shared/components/Button";
import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";

// to get the otp again and challenge id
import { useResendOtp } from "@/features/auth/hooks/useResendOtp";
import { useVerifyOtp } from "@/features/auth/hooks/useVerifyOtp";

// storage

import { useAppTheme } from "@/shared/hooks/useAppTheme";



export default function OtpVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    phone?: string;
    codeLength?: string;
    challengeId?: string;
    resendInSeconds?: string;
  }>();
  const [codeLength, setCodeLength] = useState(Number(params.codeLength) || 0);
  const phone = params.phone || "unknown number";
  const [currentChallengeId, setCurrentChallengeId] = useState(
    params.challengeId,
  );

  const resendOtpMutation = useResendOtp();
  const verifyOtpMutation = useVerifyOtp();

  const { themeColors } = useAppTheme();


  const [otp, setOtp] = useState<string[]>(Array(codeLength).fill(""));
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [timer, setTimer] = useState(Number(params.resendInSeconds ?? 0));

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
    if (cleanText.length >= codeLength) {
      const codeArray = cleanText.slice(0, codeLength).split("");
      setOtp(codeArray);
      inputRefs.current[codeLength - 1]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleanText.slice(-1);
    setOtp(newOtp);

    if (cleanText && index < codeLength - 1) {
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
    if (timer > 0 || !currentChallengeId) return;



    resendOtpMutation.mutate(
      {
        challengeId: currentChallengeId,
      },
      {
        onSuccess: (data) => {


          setCurrentChallengeId(data.challengeId);
          setTimer(data.resendInSeconds);
          setCodeLength(data.codeLength);
          setOtp(Array(data.codeLength).fill(""));
          inputRefs.current[0]?.focus();
        },
        onError: (error) => {
          setVerificationError("A new code could not be sent. Please try again.");
        },
      },
    );
  };

  const handleVerify = () => {
    if (verifyOtpMutation.isPending || !isComplete || !currentChallengeId) return;

    setVerificationError(null);
    const code = otp.join("");



    verifyOtpMutation.mutate(
      {
        challengeId: currentChallengeId,
        code,
        device: {
          name: "Chateo Mobile",
          platform: Platform.OS === "ios" ? "ios" : "android",
        },
      },
      {
        onSuccess: async (data) => {
          router.replace(data.user.profileComplete ? "/(tabs)" : "/(auth)/setup-profile");
        },
        onError: (error) => {
          setVerificationError("This code could not be verified. Check the code and your connection, then try again.");
        },
      },
    );
  };

  if (!currentChallengeId || !Number.isInteger(codeLength) || codeLength < 1 || codeLength > 10) return <RecoveryState message="This verification link is incomplete. Request a new code." back={() => router.replace("/")} />;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <MySafeAreaView color={themeColors.background}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.content}>
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

            {verificationError && <Typography accessibilityRole="alert" color={themeColors.text}>{verificationError}</Typography>}

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
                      maxLength={codeLength}
                      accessibilityLabel={`Verification code digit ${index + 1}`}
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
                  disabled={resendOtpMutation.isPending}
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
                    {resendOtpMutation.isPending
                      ? "Resending..."
                      : "Resend code"}
                  </Typography>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.footer}>
            <Button
              title={verifyOtpMutation.isPending ? "Verifying..." : "Next"}
              onPress={handleVerify}
              disabled={!isComplete || verifyOtpMutation.isPending}
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
