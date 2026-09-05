import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Contact, requestPermissionsAsync } from "expo-contacts";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { AvatarPicker } from "@/features/contacts/components/AvatarPicker";
import { FormInput } from "@/features/contacts/components/FormInput";
import { CountryPhoneInput } from "@/features/contacts/components/CountryPhoneInput";
import { Colors } from "@/shared/constants/colors";
import { BackButton } from "@/shared/components/BackButton";

import UserIcon from "@/assets/icons/shared/user.svg";
import QrCodeIcon from "@/assets/icons/chat/qrcode.svg";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

// to get the qr-code data i'll use uselocalsearxhparams

export default function NewContactScreen() {
  const router = useRouter();
  const { isDark, themeColors } = useAppTheme();

  // get data from qr code
  const params = useLocalSearchParams<{
    scannedFirstName?: string;
    scannedLastName?: string;
    scannedPhone?: string;
  }>();

  const [avatarUri, setAvatarUri] = useState<string>();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isValid = firstName.trim().length > 0 && phone.trim().length > 0;

  // this set based on the params received!
  useEffect(() => {
    if (params.scannedFirstName) setFirstName(params.scannedFirstName);
    if (params.scannedLastName) setLastName(params.scannedLastName);
    if (params.scannedPhone) setPhone(params.scannedPhone);
  }, [params]);

  const handleSave = async () => {
    if (!isValid || saving) return;

    setSaving(true);
    try {
      const { status } = await requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Allow contacts access in Settings to save this contact to your phone.",
        );
        return;
      }

      // 1. if the string path exist , i passed it directly
      const contactData: any = {
        givenName: firstName.trim(),
        familyName: lastName.trim() || undefined,
      };

      if (avatarUri) {
        contactData.image = avatarUri; // Types expect string
      }

      // Creating the contact with structured object
      const contact = await Contact.create(contactData);

      await contact.addPhone({ label: "mobile", number: phone.trim() });

      router.back();
    } catch (error) {
      console.warn("Failed to save contact:", error);
      Alert.alert("Couldn't save contact", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MySafeAreaView
      color={isDark ? themeColors.headBg : themeColors.primary}
      edges={["top"]}
    >
      <View style={{ flex: 1, backgroundColor: themeColors.background }}>
        {/* 1. TOP HEADER REGION */}
        <View
          style={[styles.topSection, { backgroundColor: isDark ? themeColors.headBg : themeColors.primary }]}
        >
          <View style={styles.header}>
            <BackButton showBorder={false} Iconcolor="white" />
            <Typography size={18} weight="bold" color="white">
              New Contact
            </Typography>
            <View style={{ width: 44 }} />
          </View>
        </View>

        {/* 2. OVERLAPPING AVATAR (Absolute Positioning on Split Line) */}
        <View style={styles.avatarAbsoluteWrapper}>
          <AvatarPicker
            uri={avatarUri}
            onSelectImage={(uri) => setAvatarUri(uri)}
          />
        </View>

        {/* 3. MAIN FORM REGION */}
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
          >
            <FormInput
              label="First Name"
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              onFocus={() => setFocusedInput("firstName")}
              onBlur={() => setFocusedInput(null)}
              focused={focusedInput === "firstName"}
              icon={
                <UserIcon
                  width={18}
                  height={18}
                  color={isDark ? "#536878" : "#94A3B8"}
                />
              }
            />

            <FormInput
              label="Last Name"
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              onFocus={() => setFocusedInput("lastName")}
              onBlur={() => setFocusedInput(null)}
              focused={focusedInput === "lastName"}
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

            {/* QR Trigger */}
            <TouchableOpacity
              style={styles.qrContainer}
              onPress={() => router.push("/qr-scanner")}
            >
              <QrCodeIcon width={32} height={32} color={themeColors.primary} />
              <Typography
                size={16}
                color={isDark ? "#8EA3B3" : "#6E8597"}
                style={styles.qrText}
              >
                Or add via QR code
              </Typography>
            </TouchableOpacity>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.saveBtn,
                isValid
                  ? [styles.saveBtnActive, {backgroundColor: themeColors.primary}]
                  : isDark
                    ? [styles.saveBtnDisabledDark, {backgroundColor: themeColors.primary}]
                    : [styles.saveBtnDisabledLight, {backgroundColor: themeColors.primary}]
              ]}
              onPress={handleSave}
              disabled={!isValid || saving}
            >
              <Typography size={16} weight="bold" color="white">
                {saving ? "Saving..." : "Save"}
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </MySafeAreaView>
  );
}

const styles = StyleSheet.create({
  topSection: {
    height: 160,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 48,
  },
  avatarAbsoluteWrapper: {
    position: "absolute",
    top: 75,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
    elevation: 10,
  },
  formContent: {
    paddingTop: 88,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  qrContainer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
    gap: 8,
  },
  qrText: {
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginBottom: 40,
  },
  saveBtn: {
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnDisabledDark: {
    opacity: 0.5,
  },
  saveBtnDisabledLight: {
    opacity: 0.5,
  },
  saveBtnActive: {
  },
});
