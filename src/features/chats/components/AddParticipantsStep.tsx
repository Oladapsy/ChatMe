import React, { useMemo, useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, View, ScrollView } from "react-native";
import axios from "axios";

import { ParticipantItem } from "./ParticipantItem";
import type { Contact } from "@/features/contacts/data/mockContacts";
import { ContactSearchBar } from "@/features/contacts/components/ContactSearchBar";
import { useContacts } from "@/features/contacts/hooks/useContacts";
import { searchUsers } from "@/features/contacts/api/discoveryApi";
import { useMe } from "@/features/auth/hooks/useMe";
import { Button } from "@/shared/components/Button";
import { Typography } from "@/shared/components/Typography";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

interface Props {
  selectedContacts: Contact[];
  onToggleContact: (contact: Contact) => void;
  onNext: () => void;

  // New props for adding members to an existing group
  existingMemberIds?: string[];
  actionLabel?: string;
  isSubmitting?: boolean;
}

export function AddParticipantsStep({
  selectedContacts,
  onToggleContact,
  onNext,
  existingMemberIds = [],
  actionLabel = "Next",
  isSubmitting = false,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);

  const existingMemberIdSet = useMemo(
    () => new Set(existingMemberIds),
    [existingMemberIds],
  );

  const {
    contacts,
    loading: loadingContacts,
    permissionGranted,
  } = useContacts();
  const { themeColors } = useAppTheme();
  const { data: currentUser } = useMe();

  // Debounce the search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 1. Synced Device Contacts who are registered ChatMe users (deduplicated & excluding self)
  const registeredDeviceContacts = useMemo<Contact[]>(() => {
    const uniqueUsers = new Map<string, Contact>();

    contacts
      .filter(
        (contact) =>
          contact.isOnApp &&
          Boolean(contact.userId) &&
          contact.userId !== currentUser?.id,
      )
      .forEach((contact) => {
        const userId = contact.userId!;

        if (!uniqueUsers.has(userId)) {
          uniqueUsers.set(userId, {
            id: userId,
            name: contact.name,
            phone: contact.phone,
            avatar: contact.avatar ?? "",
          });
        }
      });

    return Array.from(uniqueUsers.values());
  }, [contacts, currentUser?.id]);

  // 2. Perform Global Server Search using searchUsers API when query is typed (min 2 characters)
  useEffect(() => {
    const query = debouncedQuery.trim();

    // Prevent searching if empty or less than 2 characters to avoid 400 Bad Request
    if (!query || query.length < 2) {
      setSearchResults([]);
      setIsSearchingGlobal(false);
      return;
    }

    let isMounted = true;
    const fetchGlobalUsers = async () => {
      try {
        setIsSearchingGlobal(true);
        const response = await searchUsers(query);

        if (isMounted && response?.items) {
          const globalMatches: Contact[] = response.items
            .filter((user) => user.id !== currentUser?.id)
            .map((user) => ({
              id: user.id,
              name: user.displayName ?? "Unknown",
              phone: "",
              avatar: user.avatarUrl ?? "",
            }));

          setSearchResults(globalMatches);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log("SEARCH API STATUS:", error.response?.status);
        }
        if (isMounted) {
          setSearchResults([]);
        }
      } finally {
        if (isMounted) {
          setIsSearchingGlobal(false);
        }
      }
    };

    void fetchGlobalUsers();

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, currentUser?.id]);

  // 3. Merge Local Device Contacts and Global Server Search Results
  const displayedContacts = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();

    const availableContacts = registeredDeviceContacts.filter(
      (contact) => !existingMemberIdSet.has(contact.id),
    );

    if (!trimmedQuery) {
      return availableContacts;
    }

    const localMatches = availableContacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(trimmedQuery) ||
        contact.phone.includes(trimmedQuery),
    );

    const seenIds = new Set(localMatches.map((contact) => contact.id));
    const combined = [...localMatches];

    for (const remoteContact of searchResults) {
      if (
        !seenIds.has(remoteContact.id) &&
        !existingMemberIdSet.has(remoteContact.id)
      ) {
        seenIds.add(remoteContact.id);
        combined.push(remoteContact);
      }
    }

    return combined;
  }, [
    searchQuery,
    registeredDeviceContacts,
    searchResults,
    existingMemberIdSet,
  ]);

  const isValid = selectedContacts.length > 0;
  const isLoading =
    loadingContacts ||
    (isSearchingGlobal && searchQuery.trim() !== debouncedQuery);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <ContactSearchBar value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
      >
        {loadingContacts && !searchQuery ? (
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
        ) : !permissionGranted && !searchQuery ? (
          <View style={styles.messageContainer}>
            <Typography size={14} color={themeColors.text}>
              Allow contact access or search above to find people on ChatMe.
            </Typography>
          </View>
        ) : displayedContacts.length === 0 ? (
          <View style={styles.messageContainer}>
            {isSearchingGlobal ? (
              <ActivityIndicator color={themeColors.primary} />
            ) : (
              <Typography size={14} color={themeColors.text}>
                No registered ChatMe users found.
              </Typography>
            )}
          </View>
        ) : (
          displayedContacts.map((contact) => {
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
          title={actionLabel}
          onPress={onNext}
          disabled={!isValid || isLoading || isSubmitting}
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
