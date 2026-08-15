import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from "react-native";

import { BackButton } from "@/shared/components/BackButton";
import { Button } from "@/shared/components/Button";
import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";

import UserIcon from "@/assets/icons/profile/user.svg";

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
    router.replace("/(auth)/upload-photo");
  };

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
              What&apos;s your name?
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
                  backgroundColor: themeColors.inputBackground,
                  borderColor: isFocused
                    ? themeColors.primary
                    : themeColors.border,
                },
              ]}
            >
              <View style={styles.iconWrapper}>
                <UserIcon
                  width={20}
                  height={20}
                  color={
                    isFocused ? themeColors.primary : themeColors.textSecondary
                  }
                />
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
