import React, { useState } from "react";
import { StyleSheet, View, ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { SubScreenHeader } from "@/shared/components/SubScreenHeader";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import SearchIcon from "@/assets/icons/shared/search.svg";
import { FaqAccordionItem } from "@/features/settings/components/FaqAccordionItem";
import { MOCK_FAQS } from "@/features/settings/data/settingsData";

export default function FaqScreen() {
  const router = useRouter();
  const { isDark, themeColors } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Track active single accordion item ID (default to first item "1")
  const [expandedId, setExpandedId] = useState<string | null>("1");

  const filteredFaqs = MOCK_FAQS.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (id: string) => {
    setExpandedId((prevId) => (prevId === id ? null : id));
  };

  return (
    <View style={styles.container}>
      {/* Header with Search */}
      <MySafeAreaView
        edges={["top"]}
        color={themeColors.headBg}
        style={styles.topSafeArea}
      >
        <SubScreenHeader title="FAQ" onBack={() => router.back()} />

        <View style={styles.searchWrapper}>
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.12)"
                  : "rgba(255, 255, 255, 0.25)",
              },
            ]}
          >
            <SearchIcon
              width={18}
              height={18}
              color="#FFFFFF"
            />
            <TextInput
              placeholder="Search questions ..."
              placeholderTextColor="rgba(255, 255, 255, 0.75)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>
        </View>
      </MySafeAreaView>

      {/* FAQ Accordion List */}
      <MySafeAreaView
        edges={["bottom", "left", "right"]}
        color={themeColors.background}
        style={styles.bodySafeArea}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {filteredFaqs.map((item) => (
            <FaqAccordionItem
              key={item.id}
              question={item.question}
              answer={item.answer}
              isExpanded={expandedId === item.id}
              onToggle={() => handleToggle(item.id)}
            />
          ))}
        </ScrollView>
      </MySafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSafeArea: {
    flex: 0,
  },
  bodySafeArea: {
    flex: 1,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
});