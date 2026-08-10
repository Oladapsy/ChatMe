import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  SectionList,
  TextInput,
  TouchableOpacity,
  Image,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import { MOCK_CONTACTS, Contact, ContactSection } from "@/features/contacts/data/mockContacts";

// Icons
import BackIcon from "@/assets/icons/shared/chevron-left.svg";
import SearchIcon from "@/assets/icons/shared/search.svg";
import ChevronRightIcon from "@/assets/icons/shared/chevron-right.svg";

export default function ContactsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const [searchQuery, setSearchQuery] = useState("");

  // 1. Filter and group contacts by first letter
  const sections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = MOCK_CONTACTS.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query)
    );

    // Sort alphabetically
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    // Group by first letter
    const grouped: { [key: string]: Contact[] } = {};
    filtered.forEach((contact) => {
      const letter = contact.name.charAt(0).toUpperCase();
      if (!grouped[letter]) {
        grouped[letter] = [];
      }
      grouped[letter].push(contact);
    });

    return Object.keys(grouped).map((letter) => ({
      title: letter,
      data: grouped[letter],
    }));
  }, [searchQuery]);

  const handleSelectContact = (contact: Contact) => {
    // Navigate directly into a chat with selected contact
    // router.push({
    //   pathname: "/chat-room",
    //   params: { id: contact.id, name: contact.name, avatar: contact.avatar },
    // });
    console.log("chat room")
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: themeColors.background }}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <BackIcon width={24} height={24} color={themeColors.text} />
          </TouchableOpacity>

          <Typography size={18} weight="bold" color={themeColors.text}>
            Contact
          </Typography>

          <View style={{ width: 24 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                borderColor: isDark ? "#334155" : "#E2E8F0",
              },
            ]}
          >
            <SearchIcon width={18} height={18} color="#94A3B8" />
            <TextInput
              style={[styles.searchInput, { color: themeColors.text }]}
              placeholder="Search people..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </SafeAreaView>

      {/* Alphabetical Contact List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section: { title } }) => (
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
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.contactRow}
            activeOpacity={0.7}
            onPress={() => handleSelectContact(item)}
          >
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.contactInfo}>
              <Typography size={15} weight="bold" color={themeColors.text}>
                {item.name}
              </Typography>
              <Typography size={13} color="#94A3B8" style={styles.phone}>
                {item.phone}
              </Typography>
            </View>
            <ChevronRightIcon width={16} height={16} color="#CBD5E1" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  phone: {
    marginTop: 2,
  },
});