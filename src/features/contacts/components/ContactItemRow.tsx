import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  useColorScheme,
} from "react-native";
import * as SMS from "expo-sms";

import { Typography } from "@/shared/components/Typography";
import { ContactItem } from "@/features/contacts/hooks/useContacts";
import ChevronRightIcon from "@/assets/icons/shared/chevron-right.svg";
import { Colors } from "@/shared/constants/colors";

interface Props {
  item: ContactItem;
  textColor: string;
  onSelect: (item: ContactItem) => void;
}

export function ContactItemRow({ item, textColor, onSelect }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const numberColor = isDark ? "#8EA3B3" : "#6E8597";

  const handlePress = async () => {
    if (item.isOnApp) {
      onSelect(item);
    } else {
      // Invite via SMS
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        await SMS.sendSMSAsync(
          [item.phone],
          "Hey! Join me on ChatApp: https://chatapp.link/download",
        );
      } else {
        alert("There is no sms available on this device")
      }
    }
  };

  // Fallback initial avatar if photo is missing
  const initial = item.name.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatarFallback]}>
          <Typography size={18} weight="bold" color={themeColors.primary}>
            {initial}
          </Typography>
        </View>
      )}

      <View style={styles.info}>
        <Typography size={16} weight="bold" color={textColor}>
          {item.name}
        </Typography>
        <Typography size={13} color={numberColor} style={styles.phone}>
          {item.phone}
        </Typography>
      </View>

      {item.isOnApp ? (
        <ChevronRightIcon width={16} height={16} color="#6E8597" />
      ) : (
        <View style={styles.inviteBadge}>
          <Typography size={13} weight="bold" color="#10B981">
            Invite
          </Typography>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E6F4EA",
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  phone: {
    marginTop: 4,
  },
  inviteBadge: {
    backgroundColor: "#E6F4EA",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
