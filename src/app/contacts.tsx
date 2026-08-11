import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  SectionList,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import { useContacts, ContactItem } from "@/features/contacts/hooks/useContacts";
import { ContactSearchBar } from "@/features/contacts/components/ContactSearchBar";
import { ContactItemRow } from "@/features/contacts/components/ContactItemRow";
import MySafeAreaView from "@/shared/components/MySafeAreaView";

export default function ContactsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const [searchQuery, setSearchQuery] = useState("");
  const { contacts, loading } = useContacts();

 // 1. Filter and group contacts by first letter
const sections = useMemo(() => {
  const query = searchQuery.trim().toLowerCase();

  // Filter against your active contacts state (not static MOCK_CONTACTS)
  const filtered = contacts.filter((c) => {
    const nameMatch = c.name?.toLowerCase().includes(query) ?? false;
    const phoneMatch = c.phone?.toLowerCase().includes(query) ?? false;
    return nameMatch || phoneMatch;
  });

  // Sort alphabetically
  filtered.sort((a, b) => a.name.localeCompare(b.name));

  // If user is searching, hide the section header letters (A, B, C...)
  if (query.length > 0) {
    return [{ title: "", data: filtered }];
  }

  // Group by first letter for regular view
  const grouped: { [key: string]: typeof contacts } = {};
  filtered.forEach((contact) => {
    const letter = contact.name.charAt(0).toUpperCase() || "#";
    if (!grouped[letter]) {
      grouped[letter] = [];
    }
    grouped[letter].push(contact);
  });

  return Object.keys(grouped).map((letter) => ({
    title: letter,
    data: grouped[letter],
  }));
}, [contacts, searchQuery]); // Make sure `contacts` and `searchQuery` are both in dependencies

  const handleSelectContact = (contact: ContactItem) => {
    // router.push({
    //   pathname: "/chat-room",
    //   params: { id: contact.id, name: contact.name, avatar: contact.avatar },
    // });
    console.log("/chat-room")
  };

  return (
   <View style={[styles.container, { backgroundColor: themeColors.background }]}>
  <SafeAreaView edges={["top",]}  style={styles.headerSafeArea}>
    {/* Handle Bar */}
    <View style={styles.handleContainer}>
      <View
        style={[
          styles.handleBar,
          { backgroundColor: isDark ? "#334155" : "#E2E8F0" },
        ]}
      />
    </View>

    <View style={styles.titleContainer}>
      <Typography size={18} weight="bold" color={themeColors.text}>
        Contact
      </Typography>
    </View>

    {/* Search Component */}
    <ContactSearchBar
      value={searchQuery}
      onChangeText={(text) => setSearchQuery(text)}
    />
  </SafeAreaView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section: { title } }) => {
            if (!title) return null;
            return (
              <View
                style={[
                  styles.sectionHeader,
                  { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" },
                ]}
              >
                <Typography size={13} weight="bold" color="#64748B">
                  {title}
                </Typography>
              </View>
            );
          }}
          renderItem={({ item }) => (
            <ContactItemRow
              item={item}
              textColor={themeColors.text}
              onSelect={handleSelectContact}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSafeArea: {
    width: "100%",
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  handleBar: {
    width: 36,
    height: 5,
    borderRadius: 3,
  },
  titleContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});