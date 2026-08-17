import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  useColorScheme,
  TextInputProps,
} from "react-native";

import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import { COUNTRIES } from "@/features/auth/constants/countryData";

export type Country = (typeof COUNTRIES)[number];

interface Props extends Omit<TextInputProps, "onChangeText"> {
  value: string;
  onChangeText: (phoneNumber: string) => void;
  selectedCountry?: Country;
  onSelectCountry?: (country: Country) => void;
  focused?: boolean;
}

export function CountryPhoneInput({
  value,
  onChangeText,
  selectedCountry = COUNTRIES[0],
  onSelectCountry,
  focused,
  onFocus,
  onBlur,
  ...props
}: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const [currentCountry, setCurrentCountry] =
    useState<Country>(selectedCountry);
  const [showDropdown, setShowDropdown] = useState(false);
  const [internalFocused, setInternalFocused] = useState(false);

  const isFocused = focused !== undefined ? focused : internalFocused;

  const handleSelect = (country: Country) => {
    setCurrentCountry(country);
    if (onSelectCountry) {
      onSelectCountry(country);
    }
    setShowDropdown(false);
  };

  const borderColor = isFocused ? "#52C47C" : isDark ? "#6E8597" : "#EAEEF2";

  return (
    <View style={styles.container}>
      <Typography
        size={14}
        weight="medium"
        color={isDark ? "#DDE2E8" : "#1F3C51"}
        style={styles.label}
      >
        Phone Number
      </Typography>

      {/* Input Box */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: themeColors.background,
            borderColor,
          },
        ]}
      >
        {/* Country Selector */}
        <TouchableOpacity
          style={[
            styles.countryTrigger,
            { borderRightColor: isDark ? "#2D4B63" : "#E5E7EB" },
          ]}
          onPress={() => {
            Keyboard.dismiss();
            setShowDropdown((prev) => !prev);
          }}
          activeOpacity={0.7}
        >
          <Typography size={18}>{currentCountry.flag}</Typography>
          <Typography size={14} weight="bold" color={themeColors.text}>
            {currentCountry.code}
          </Typography>
        </TouchableOpacity>

        {/* Text Input */}
        <TextInput
          style={[styles.input, { color: themeColors.text }]}
          placeholder="Phone number"
          placeholderTextColor={isDark ? "#536878" : "#94A3B8"}
          keyboardType="phone-pad"
          value={value}
          onChangeText={onChangeText}
          onFocus={(e) => {
            setInternalFocused(true);
            setShowDropdown(false);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setInternalFocused(false);
            if (onBlur) onBlur(e);
          }}
          maxLength={15}
          {...props}
        />
      </View>

      {/* Dropdown Menu using ScrollView + map instead of FlatList */}
      {showDropdown && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: isDark ? "#192B3A" : "#FFFFFF",
              borderColor: isDark ? "#2D4B63" : "#E5E7EB",
            },
          ]}
        >
          <ScrollView
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            {COUNTRIES.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={styles.dropdownItem}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <Typography size={18}>{item.flag}</Typography>
                <Typography
                  size={14}
                  weight="medium"
                  color={themeColors.text}
                  style={styles.countryName}
                >
                  {item.name}
                </Typography>
                <Typography size={13} color={isDark ? "#8EA1B1" : "#64748B"}>
                  {item.code}
                </Typography>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    zIndex: 20,
  },
  label: {
    marginBottom: 6,
  },
  inputContainer: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
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
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
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
    elevation: 5,
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
});
