import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Colors } from "@/shared/constants/colors";
import { BackButton } from "@/shared/components/BackButton";

import { AvatarPicker } from "@/features/contacts/components/AvatarPicker";
import { FormInput } from "@/features/contacts/components/FormInput";
import { CountryPhoneInput } from "@/features/contacts/components/CountryPhoneInput";

import UserIcon from "@/assets/icons/shared/user.svg";
import { Button } from "@/shared/components/Button";

import { useMe } from "@/features/auth/hooks/useMe";
import { useUpdateMe } from "@/features/auth/hooks/useUpdateMe";
import { uploadImage } from "@/services/cloudinary";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

export default function EditProfileScreen() {
  const router = useRouter();

  const { isDark, themeColors } = useAppTheme();

  // Get current profile
  const { data: user, isPending, isError, error } = useMe();

  // Update profile mutation
  const updateMeMutation = useUpdateMe();

  // Form state
  const [avatarUri, setAvatarUri] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Populate form when user data arrives
  useEffect(() => {
    if (user) {
      setAvatarUri(user.avatarUrl ?? undefined);
      setName(user.displayName ?? "");

      const phoneNumber = user.phoneNumber ?? "";

      if (phoneNumber.startsWith("+234")) {
        setPhone(phoneNumber.slice(4));
      } else {
        setPhone(phoneNumber);
      }
    }
  }, [user]);

  if (isPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={themeColors.primary} />
      </View>
    );
  }

  if (isError || !user) {
    console.log("Failed to fetch user:", error);

    return (
      <View style={styles.loadingContainer}>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const isValid =
    name.trim().length > 3 &&
    phone.trim().length > 5 &&
    phone.trim().length < 15;

  const handleSave = async () => {
    if (!isValid || updateMeMutation.isPending) {
      return;
    }

    try {
      let finalAvatarUrl = user.avatarUrl;

      if (avatarUri && avatarUri !== user.avatarUrl) {
        console.log("Uploading new avatar...");

        const uploadResult = await uploadImage(avatarUri);

        console.log("Cloudinary upload result:", uploadResult);

        finalAvatarUrl = uploadResult.secure_url;

        console.log("Final avatar URL:", finalAvatarUrl);
      }

      await updateMeMutation.mutateAsync({
        displayName: name.trim(),
        avatarUrl: finalAvatarUrl ?? null,
      });

      router.back();
    } catch (error: any) {
      console.log("UPDATE PROFILE ERROR");
      console.log("STATUS:", error.response?.status);
      console.log("DATA:", error.response?.data);

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Could not update your profile. Please try again.",
      );
    }
  };

  return (
    <MySafeAreaView
      color={isDark ? themeColors.headBg : themeColors.primary}
      edges={["top"]}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: themeColors.background,
        }}
      >
        {/* HEADER */}
        <View
          style={[
            styles.topSection,
            {
              backgroundColor: isDark
                ? themeColors.headBg
                : themeColors.primary,
            },
          ]}
        >
          <View style={styles.header}>
            <BackButton showBorder={false} Iconcolor="white" />
          </View>
        </View>

        {/* AVATAR */}
        <View style={styles.avatarAbsoluteWrapper}>
          <AvatarPicker uri={avatarUri} onSelectImage={setAvatarUri} />
        </View>

        {/* FORM */}
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
          >
            <FormInput
              label="Name"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              onFocus={() => setFocusedInput("name")}
              onBlur={() => setFocusedInput(null)}
              focused={focusedInput === "name"}
              icon={
                <UserIcon
                  width={18}
                  height={18}
                  color={isDark ? "#536878" : "#94A3B8"}
                />
              }
            />

            <CountryPhoneInput
              value={phone}
              editable={false}
              onChangeText={setPhone}
              onFocus={() => setFocusedInput("phone")}
              onBlur={() => setFocusedInput(null)}
              focused={focusedInput === "phone"}
            />
          </ScrollView>

          {/* SAVE */}
          <View style={styles.footer}>
            <Button
              title="Save"
              loading={updateMeMutation.isPending}
              disabled={!isValid || updateMeMutation.isPending}
              onPress={handleSave}
              textWeight="bold"
            />
          </View>
        </View>
      </View>
    </MySafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  topSection: {
    height: 140,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 48,
  },

  avatarAbsoluteWrapper: {
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
    elevation: 10,
  },

  formContent: {
    paddingTop: 84,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginBottom: 20,
  },
});
