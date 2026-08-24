import React from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Typography } from "@/shared/components/Typography";
import CheckIcon from "@/assets/icons/shared/check.svg";
import UserIcon from "@/assets/icons/shared/user.svg";
import { Contact } from "@/features/contacts/data/mockContacts";
import { Colors } from "@/shared/constants/colors";

interface Props {
  contact: Contact;
  selected: boolean;
  onToggle: (contact: Contact) => void;
}

export function ParticipantItem({ contact, selected, onToggle }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onToggle(contact)}
      activeOpacity={0.8}
    >
      <View style={styles.avatarWrapper}>
        {contact.avatar ? (
          <Image source={{ uri: contact.avatar }} style={styles.avatar} />
        ) : (
          <View
            style={[
              styles.avatar,
              styles.fallbackAvatar,
              { backgroundColor: themeColors.avatarBg },
            ]}
          >
            <UserIcon
              width={24}
              height={24}
              color={isDark ? "#E2E8F0" : "#1E293B"}
            />
          </View>
        )}

        {selected && (
          <View style={styles.outerRing}>
            <View style={styles.innerRing}>
              <CheckIcon width={24} height={24} color="white" />
            </View>
          </View>
        )}
      </View>
      <Typography
        size={14}
        weight="medium"
        align="center"
        numberOfLines={1}
        color={themeColors.text}
        style={styles.name}
      >
        {contact.name.split(" ")[0]}
      </Typography>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "25%",
    alignItems: "center",
    marginBottom: 32,
    paddingTop: 4,
  },
  avatarWrapper: {
    position: "relative",
    width: 56,
    height: 56,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  outerRing: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    padding: 2,
  },
  innerRing: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 2,
    backgroundColor: "#081C2C70",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    marginTop: 4,
  },
  fallbackAvatar: {
    justifyContent: "center",
    alignItems: "center",
  },
});
