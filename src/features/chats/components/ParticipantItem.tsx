import React from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import { Typography } from "@/shared/components/Typography";
import CheckIcon from "@/assets/icons/shared/check.svg";
import { Contact } from "@/features/contacts/data/mockContacts";
import { Colors } from "@/shared/constants/colors";

interface Props {
  contact: Contact;
  selected: boolean;
  onToggle: (contact: Contact) => void;
  isDark: boolean;
}

export function ParticipantItem({
  contact,
  selected,
  onToggle,
  isDark,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onToggle(contact)}
      activeOpacity={0.8}
    >
      <View style={styles.avatarWrapper}>
        <Image source={{ uri: contact.avatar }} style={styles.avatar} />
        {selected && (
          <View style={styles.checkmarkBadge}>
            <View style={styles.checkmarkBadge}>
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
        color={isDark ? "#FFFFFF" : "#081C2C"}
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
  checkmarkBadge: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 32,
    borderColor: Colors.light.primary,
    borderWidth: 2,
    backgroundColor: "#081C2C70",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    marginTop: 4,
  },
});
