// This is for the new chat i gave it contact because its navigates to
// contact first...
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, SectionList, StyleSheet, View } from "react-native";

import { ContactItemRow } from "@/features/contacts/components/ContactItemRow";
import { ContactSearchBar } from "@/features/contacts/components/ContactSearchBar";
import {
  ContactItem,
  useContacts,
} from "@/features/contacts/hooks/useContacts";
import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

export default function ContactsScreen() {
  const router = useRouter();
  const { isDark, themeColors } = useAppTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const { contacts, loading } = useContacts();

  // Dynamic top background color
  // green for light and dark for dark
  const topSafeAreaColor = isDark
    ? themeColors.background
    : themeColors.primary;

  // Filter and group contacts by first letter
  const sections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = contacts.filter((c) => {
      const nameMatch = c.name?.toLowerCase().includes(query) ?? false;
      const phoneMatch = c.phone?.toLowerCase().includes(query) ?? false;
      return nameMatch || phoneMatch;
    });

    filtered.sort((a, b) => a.name.localeCompare(b.name));

    if (query.length > 0) {
      return [{ title: "", data: filtered }];
    }

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
  }, [contacts, searchQuery]);

  const handleSelectContact = (contact: ContactItem) => {
    router.push({
      pathname: "/chat-room",
      params: {
        id: contact.id,
        name: contact.name,
        avatar: contact.avatar ?? "",
      },
    });
  };

  return (
    <MySafeAreaView color={topSafeAreaColor} edges={["top"]}>
      {/* the main body */}
      <View style={[styles.card, { backgroundColor: themeColors.background }]}>
        {/* Sheet Handle Bar */}
        <View style={styles.handleContainer}>
          <View
            style={[
              styles.handleBar,
              { backgroundColor: isDark ? "#3A566A" : "#EAEEF2" },
            ]}
          />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Typography size={19} weight="bold" color={themeColors.text}>
            Contact
          </Typography>
        </View>

        {/* Search Input */}
        <ContactSearchBar value={searchQuery} onChangeText={setSearchQuery} />

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={themeColors.primary} />
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            renderSectionHeader={({ section: { title } }) => {
              if (!title) return null;
              return (
                <View
                  style={[
                    styles.sectionHeader,
                    { backgroundColor: isDark ? "#3A566A" : "#EAEEF2" },
                  ]}
                >
                  <Typography
                    size={15}
                    weight="bold"
                    color={themeColors.textSecondary}
                  >
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
    </MySafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
  },
  handleBar: {
    width: 48,
    height: 6,
    borderRadius: 100,
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
