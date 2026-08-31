import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { SubScreenHeader } from "@/shared/components/SubScreenHeader";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import { BlockedContactItem } from "@/features/settings/components/BlockedContactItem";

const BLOCKED_CONTACTS = [
  {
    id: "1",
    name: "Annette Black",
    phone: "+61-827-680-673",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  },
  {
    id: "2",
    name: "Arlene McCoy",
    phone: "+61-827-680-673",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
  },
  {
    id: "3",
    name: "Annie Miles",
    phone: "+61-827-680-673",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
  },
];

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