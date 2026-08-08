import React, { useState } from "react";
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
import { useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { Button } from "@/shared/components/Button";
import { Colors } from "@/shared/constants/colors";

// Icons
import ChevronLeft from "@/assets/icons/auth/chevron-left.svg";
import UserIcon from "@/assets/icons/profile/user.svg"; // Replace with your user icon SVG

export default function SetupProfileScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const [name, setName] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const isValidName = name.trim().length >= 2;

  const handleNext = () => {
    if (!isValidName) return;
    console.log("Saving user name:", name.trim());
    // Navigate to next step or main tabs
    // router.replace("/(tabs)");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <MySafeAreaView color={themeColors.background}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.content}>
            {/* Back Button */}
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

            {/* Header Text */}
            <Typography
              variant="h1"
              size={24}
              lineHeight={32}
              weight="bold"
              color={themeColors.text}
              style={styles.title}
            >
              Whats your name?
            </Typography>

            <Typography
              variant="body"
              size={14}
              color={themeColors.textSecondary}
              style={styles.subtitle}
            >
              Write your name. You can change it back in settings.
            </Typography>

            {/* Input Label */}
            <Typography
              variant="caption"
              weight="medium"
              color={themeColors.textSecondary}
              style={styles.label}
            >
              Name
            </Typography>

            {/* Input Box with Left User Icon */}
            <View
              style={[
                styles.inputContainer,
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
              <View style={styles.iconWrapper}>
                {UserIcon ? (
                  <UserIcon
                    width={20}
                    height={20}
                    color={
                      isFocused ? themeColors.primary : themeColors.textSecondary
                    }
                  />
                ) : (
                  <Typography color={themeColors.textSecondary}>👤</Typography>
                )}
              </View>

              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                placeholder="Name"
                placeholderTextColor={themeColors.textSecondary}
                value={name}
                onChangeText={setName}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleNext}
              />
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.footer}>
            <Button
              title="Next"
              onPress={handleNext}
              disabled={!isValidName}
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
  label: {
    marginBottom: 8,
  },
  inputContainer: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  iconWrapper: {
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    paddingBottom: 24,
  },
});