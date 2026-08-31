import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { SubScreenHeader } from "@/shared/components/SubScreenHeader";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import { BlockedContactItem } from "@/features/settings/components/BlockedContactItem";
import { BLOCKED_CONTACTS } from "@/features/settings/data/blockedContacts";


export default function BlockedContactsScreen() {
  const router = useRouter();
  const { isDark, themeColors } = useAppTheme();

  return (
    <View style={styles.container}>
      <MySafeAreaView
        edges={["top"]}
        color={themeColors.headBg}
        style={styles.topSafeArea}
      >
        <SubScreenHeader title="Blocked Contact" onBack={() => router.back()} />
      </MySafeAreaView>

      <MySafeAreaView
        edges={["bottom", "left", "right"]}
        color={themeColors.background}
        style={styles.bodySafeArea}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.list}>
            {BLOCKED_CONTACTS.map((item) => (
              <BlockedContactItem
                key={item.id}
                name={item.name}
                phone={item.phone}
                avatarUrl={item.avatarUrl}
                onPress={() => {}}
                isDark={isDark}
                themeColors={themeColors}
              />
            ))}
          </View>

          <Typography
            size={12}
            color={isDark ? themeColors.descText : "#8EA3B3"}
            style={styles.footerNote}
          >
            Blocked contacts can't send messages and call you.
          </Typography>
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
  list: {
    marginTop: 8,
  },
  footerNote: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
});