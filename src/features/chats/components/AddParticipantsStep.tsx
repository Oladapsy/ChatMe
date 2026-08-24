import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import { ParticipantItem } from "./ParticipantItem";
import SearchIcon from "@/assets/icons/shared/search.svg";
import { Contact, MOCK_CONTACTS } from "@/features/contacts/data/mockContacts";

interface Props {
  selectedContacts: Contact[];
  onToggleContact: (contact: Contact) => void;
  onNext: () => void;
  isDark: boolean;
}

export function AddParticipantsStep({
  selectedContacts,
  onToggleContact,
  onNext,
  isDark,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = MOCK_CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const countText =
    selectedContacts.length > 0 ? `(${selectedContacts.length})` : "";
  const isValid = selectedContacts.length > 0;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: isDark ? "#163043" : "#F9FAFB",
            borderColor: isDark ? "#254156" : "#EAEEF2",
          },
        ]}
      >
        <SearchIcon
          width={18}
          height={18}
          color={isDark ? "#536878" : "#94A3B8"}
        />
        <TextInput
          style={[
            styles.searchInput,
            { color: isDark ? "#FFFFFF" : "#081C2C" },
          ]}
          placeholder="Search people..."
          placeholderTextColor={isDark ? "#536878" : "#94A3B8"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Contacts Grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
      >
        {filteredContacts.map((contact) => {
          const isSelected = selectedContacts.some((c) => c.id === contact.id);
          return (
            <ParticipantItem
              key={contact.id}
              contact={contact}
              selected={isSelected}
              onToggle={onToggleContact}
              isDark={isDark}
            />
          );
        })}
      </ScrollView>

      {/* Action Button */}
      <TouchableOpacity
        style={[
          styles.actionBtn,
          {
            backgroundColor: isValid
              ? Colors.light.primary
              : isDark
                ? "#254156"
                : "#ABDBBE",
          },
        ]}
        onPress={onNext}
        disabled={!isValid}
        activeOpacity={0.8}
      >
        <Typography size={16} weight="bold" color="white">
          Next
        </Typography>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: 16,
  },
  searchBox: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingBottom: 16,
  },
  actionBtn: {
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
});
