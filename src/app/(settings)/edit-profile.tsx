import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import { BackButton } from "@/shared/components/BackButton";

import { AvatarPicker } from "@/features/contacts/components/AvatarPicker";
import { FormInput } from "@/features/contacts/components/FormInput";
import { CountryPhoneInput } from "@/features/contacts/components/CountryPhoneInput";

import UserIcon from "@/assets/icons/shared/user.svg";
import { Button } from "@/shared/components/Button";
import { useMe } from "@/features/auth/hooks/useMe";
import { useUpdateMe } from "@/features/auth/hooks/useUpdateMe";

export default function EditProfileScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const { data: user, isPending, isError, error } = useMe();
  const updateMeMutation = useUpdateMe();

  if (isPending) {
    return <ActivityIndicator color={themeColors.primary} />;
  }
  
  if (isError) {
    console.log("Failed to fetch user:", error);
    return null;
  }

  // Mock initial profile state (replace with your global state or auth hook)
  const [avatarUri, setAvatarUri] = useState<string | undefined>(
    user?.avatarUrl || undefined,
  );
  const [name, setName] = useState(user?.displayName || undefined);
  const [phone, setPhone] = useState(user?.phoneNumber || "0000000000");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isValid = name.trim().length > 0 && phone.trim().length > 0;
  // remove the +234 or other country code if present in the phone number
  const handlePhoneChange = (text: string) => {
    if (text.startsWith("+234")) {
      setPhone(text.slice(4));
    } else {
      setPhone(text);
    }}

  const handleSave = async () => {
    if (!isValid || saving) return;

    setSaving(true);
    try {
      // API or storage save operation goes here
      console.log("Saving updated profile...", { avatarUri, name, phone });

      router.back();
    } catch (error) {
      console.warn("Failed to update profile:", error);
      Alert.alert("Error", "Could not update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MySafeAreaView color={themeColors.headBg} edges={["top"]}>
      <View style={{ flex: 1, backgroundColor: themeColors.background }}>
        {/* 1. TOP HEADER GREEN BANNER */}
        <View
          style={[styles.topSection, { backgroundColor: themeColors.headBg }]}
        >
          <View style={styles.header}>
            <BackButton showBorder={false} Iconcolor="white" />
          </View>
        </View>

        {/* 2. OVERLAPPING AVATAR */}
        <View style={styles.avatarAbsoluteWrapper}>
          <AvatarPicker
            uri={avatarUri}
            onSelectImage={(uri) => setAvatarUri(uri)}
          />
        </View>

        {/* 3. EDIT PROFILE FORM */}
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
              onChangeText={setPhone}
              onFocus={() => setFocusedInput("phone")}
              onBlur={() => setFocusedInput(null)}
              focused={focusedInput === "phone"}
            />
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Save"
              loading={saving}
              disabled={!isValid || saving}
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
