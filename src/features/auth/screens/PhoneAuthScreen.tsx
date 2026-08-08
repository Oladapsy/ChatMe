import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { Button } from "@/shared/components/Button";
import { Colors } from "@/shared/constants/colors";
import { COUNTRIES } from "@/features/auth/constants/countryData";
import { useRouter } from "expo-router";

type Country = (typeof COUNTRIES)[number];

export default function PhoneAuthScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];
  const router = useRouter();

  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const isValidNumber = phoneNumber.replace(/[^0-9]/g, "").length >= 8;

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setShowDropdown(false);
  };

  const handleNext = () => {
    if (!isValidNumber) return;
    const fullNumber = `${selectedCountry.code}${phoneNumber}`;
    console.log("Proceeding with phone number:", fullNumber);
    router.push({
      pathname: "/(auth)/verify-otp",
      params: { phone: fullNumber },
    });
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        setShowDropdown(false);
      }}
    >
      <MySafeAreaView color={themeColors.background}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.content}>
            {/* Header Text */}
            <Typography
              variant="h1"
              size={24}
              lineHeight={32}
              weight="bold"
              color={themeColors.text}
            >
              What&apos;s your phone number?
            </Typography>

            <Typography
              variant="body"
              size={14}
              color={themeColors.textSecondary}
              style={styles.subtitle}
            >
              We will send you the verification code.
            </Typography>

            {/* Input Label */}
            <Typography
              variant="caption"
              weight="medium"
              color={themeColors.textSecondary}
              style={styles.label}
            >
              Phone Number
            </Typography>

            {/* Phone Input Box */}
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
              {/* Country Code Trigger */}
              <TouchableOpacity
                style={styles.countryTrigger}
                onPress={() => {
                  Keyboard.dismiss();
                  setShowDropdown((prev) => !prev);
                }}
                activeOpacity={0.7}
              >
                <Typography variant="body" size={18}>
                  {selectedCountry.flag}
                </Typography>
                <Typography
                  variant="body"
                  weight="bold"
                  color={themeColors.text}
                >
                  {selectedCountry.code}
                </Typography>
              </TouchableOpacity>

              {/* Number Input */}
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                placeholder="Phone number"
                placeholderTextColor={themeColors.textSecondary}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                onFocus={() => {
                  setIsFocused(true);
                  setShowDropdown(false);
                }}
                onBlur={() => setIsFocused(false)}
                maxLength={15}
              />
            </View>

            {/* Dropdown Menu */}
            {showDropdown && (
              <View
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: isDark ? "#1F3C51" : "#FFFFFF",
                    borderColor: isDark ? "#2D4B63" : "#E5E7EB",
                  },
                ]}
              >
                <FlatList
                  data={COUNTRIES}
                  keyExtractor={(item) => item.name}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={true}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => handleSelectCountry(item)}
                      activeOpacity={0.7}
                    >
                      <Typography variant="body" size={18}>
                        {item.flag}
                      </Typography>
                      <Typography
                        variant="body"
                        weight="medium"
                        color={themeColors.text}
                        style={styles.countryName}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant="body"
                        size={14}
                        color={themeColors.textSecondary}
                      >
                        {item.code}
                      </Typography>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>

          {/* Action Button */}
          <View style={styles.footer}>
            <Button
              title="Next"
              onPress={handleNext}
              disabled={!isValidNumber}
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
    paddingTop: 40,
    zIndex: 1,
  },
  subtitle: {
    marginTop: 8,
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
  countryTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  dropdown: {
    marginTop: 8,
    maxHeight: 200,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  countryName: {
    flex: 1,
  },
  footer: {
    paddingBottom: 24,
  },
});
