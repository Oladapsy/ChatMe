import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";

import { ParticipantItem } from "./ParticipantItem";
import { Contact, MOCK_CONTACTS } from "@/features/contacts/data/mockContacts";
import { ContactSearchBar } from "@/features/contacts/components/ContactSearchBar";
import { Button } from "@/shared/components/Button";

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

  const isValid = selectedContacts.length > 0;

  return (
    <View style={styles.container}>
      {/* Reusable Search Bar with focus states */}
      <View style={styles.searchContainer}>
        <ContactSearchBar value={searchQuery} onChangeText={setSearchQuery} />
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
            />
          );
        })}
      </ScrollView>

      {/* Reusable Action Button */}
      <View style={styles.buttonWrapper}>
        <Button
          title="Next"
          onPress={onNext}
          disabled={!isValid}
          textWeight="bold"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    marginHorizontal: -16, // Counteract internal padding from ContactSearchBar
    marginBottom: 15,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingBottom: 10,
  },
  buttonWrapper: {
    marginTop: 0,
  },
});
