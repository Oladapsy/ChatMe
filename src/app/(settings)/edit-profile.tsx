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
import { BackButton } from "@/shared/components/BackButton";

import {
  AvatarPicker,
  type SelectedImage,
} from "@/features/contacts/components/AvatarPicker";
import { FormInput } from "@/features/contacts/components/FormInput";
import { CountryPhoneInput } from "@/features/contacts/components/CountryPhoneInput";

import UserIcon from "@/assets/icons/shared/user.svg";
import { Button } from "@/shared/components/Button";

import { useMe } from "@/features/auth/hooks/useMe";
import { useUpdateMe } from "@/features/auth/hooks/useUpdateMe";
import { uploadMedia } from "@/services/mediaUpload";
import { useUpdateAvatar } from "@/features/auth/hooks/useUpdateAvatar";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

import { useRemoveAvatar } from "@/features/auth/hooks/useRemoveAvatar";

export default function EditProfileScreen() {
  const router = useRouter();

  const { isDark, themeColors } = useAppTheme();

  // Get current profile
  const { data: user, isPending, isError, error } = useMe();

  // Update profile mutation
  const updateMeMutation = useUpdateMe();
  // update avatar
  const updateAvatarMutation = useUpdateAvatar();
  const removeAvatarMutation = useRemoveAvatar();

  // Form state
  const [avatarUri, setAvatarUri] = useState<string | undefined>();
  const [selectedAvatar, setSelectedAvatar] = useState<
    SelectedImage | undefined
  >();
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Populate form when user data arrives
  useEffect(() => {
    if (user) {
      setAvatarUri(user.avatarUrl ?? undefined);
      setSelectedAvatar(undefined);
      setAvatarRemoved(false);
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
    if (saving) return;

    setSaving(true);

    try {
      console.log("1. SAVE STARTED");
      console.log("2. selectedAvatar:", selectedAvatar);

      if (avatarRemoved && user.avatarUrl) {
        console.log("3. REMOVING AVATAR");

        await removeAvatarMutation.mutateAsync();

        console.log("4. AVATAR REMOVED");
      } else if (selectedAvatar) {
        console.log("3. STARTING MEDIA UPLOAD");

        const media = await uploadMedia({
          uri: selectedAvatar.uri,
          purpose: "profile_avatar",
          contentType: selectedAvatar.mimeType,
          sizeBytes: selectedAvatar.fileSize,
          originalFilename: selectedAvatar.fileName,
        });

        console.log("4. MEDIA UPLOAD SUCCESS:", media);

        console.log("5. CONNECTING AVATAR:", media.id);

        await updateAvatarMutation.mutateAsync({
          mediaId: media.id,
        });

        console.log("6. AVATAR CONNECTED");
      }

      console.log("7. UPDATING NAME");

      await updateMeMutation.mutateAsync({
        displayName: name.trim(),
      });

      console.log("8. PROFILE UPDATE SUCCESS");

      router.back();
    } catch (error: any) {
      console.log("========== UPDATE PROFILE ERROR ==========");
      console.log("ERROR OBJECT:", error);
      console.log("ERROR MESSAGE:", error?.message);
      console.log("ERROR RESPONSE:", error?.response);
      console.log("ERROR STACK:", error?.stack);
    } finally {
      setSaving(false);
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
          <AvatarPicker
            uri={avatarUri}
            onSelectImage={(image) => {
              setSelectedAvatar(image);
              setAvatarUri(image?.uri);
              setAvatarRemoved(!image);
            }}
          />
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
