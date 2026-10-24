import React, { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View, ScrollView } from "react-native";

import { ParticipantItem } from "./ParticipantItem";
import type { Contact } from "@/features/contacts/data/mockContacts";
import { ContactSearchBar } from "@/features/contacts/components/ContactSearchBar";
import { useContacts } from "@/features/contacts/hooks/useContacts";
import { Button } from "@/shared/components/Button";
import { Typography } from "@/shared/components/Typography";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

interface Props {
  selectedContacts: Contact[];
  onToggleContact: (contact: Contact) => void;
  onNext: () => void;
}

export function AddParticipantsStep({
  selectedContacts,
  onToggleContact,
  onNext,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const { contacts, loading, permissionGranted } = useContacts();
  const { themeColors } = useAppTheme();

  // Only registered ChatMe users can be added to a group.
  const registeredContacts = useMemo<Contact[]>(
    () =>
      contacts
        .filter((contact) => contact.isOnApp && Boolean(contact.userId))
        .map((contact) => ({
          id: contact.userId!,
          name: contact.name,
          phone: contact.phone,
          avatar: contact.avatar ?? "",
        })),
    [contacts],
  );

  const filteredContacts = registeredContacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  const isValid = selectedContacts.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <ContactSearchBar value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
      >
        {loading ? (
          <View style={styles.messageContainer}>
            <ActivityIndicator color={themeColors.primary} />
            <Typography
              size={14}
              color={themeColors.text}
              style={styles.messageText}
            >
              Loading your contacts...
            </Typography>
          </View>
        ) : !permissionGranted ? (
          <View style={styles.messageContainer}>
            <Typography size={14} color={themeColors.text}>
              Allow contact access to find people on ChatMe.
            </Typography>
          </View>
        ) : filteredContacts.length === 0 ? (
          <View style={styles.messageContainer}>
            <Typography size={14} color={themeColors.text}>
              No registered ChatMe contacts found.
            </Typography>
          </View>
        ) : (
          filteredContacts.map((contact) => {
            const isSelected = selectedContacts.some(
              (selected) => selected.id === contact.id,
            );

            return (
              <ParticipantItem
                key={contact.id}
                contact={contact}
                selected={isSelected}
                onToggle={onToggleContact}
              />
            );
          })
        )}
      </ScrollView>

      <View style={styles.buttonWrapper}>
        <Button
          title="Next"
          onPress={onNext}
          disabled={!isValid || loading}
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
    marginHorizontal: -16,
    marginBottom: 15,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingBottom: 16,
    flexGrow: 1,
  },
  messageContainer: {
    flex: 1,
    width: "100%",
    minHeight: 140,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  messageText: {
    marginTop: 12,
  },
  buttonWrapper: {
    paddingTop: 12,
    paddingBottom: 40,
  },
});
