import React from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { SubScreenHeader } from "@/shared/components/SubScreenHeader";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import { BlockedContactItem } from "@/features/settings/components/BlockedContactItem";
import { useBlockedUsers } from "@/features/contacts/hooks/useBlockedUsers";
import { useUnblockUser } from "@/features/contacts/api/useUnblockUser";

export default function BlockedContactsScreen() {
  const router = useRouter();
  const { isDark, themeColors } = useAppTheme();

  const { data, isLoading, isError, refetch, isRefetching } = useBlockedUsers();

  const { mutate: unblock, isPending: isUnblocking } = useUnblockUser();

  const blockedUsers = data?.items ?? [];
  const unblockMutation = useUnblockUser();

  const handleUnblock = (userId: string, displayName: string) => {
    Alert.alert(
      "Unblock contact",
      `Are you sure you want to unblock ${displayName}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Unblock",
          onPress: () => {
            unblock(userId, {
              onSuccess: () => {
                Alert.alert(
                  "Contact unblocked",
                  `${displayName} has been unblocked.`,
                );
              },
              onError: () => {
                Alert.alert(
                  "Couldn't unblock contact",
                  "Please check your connection and try again.",
                );
              },
            });
          },
        },
      ],
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <MySafeAreaView
        edges={["top"]}
        color={isDark ? themeColors.headBg : themeColors.primary}
        style={styles.topSafeArea}
      >
        <SubScreenHeader
          title="Blocked Contacts"
          onBack={() => router.back()}
        />
      </MySafeAreaView>

      <MySafeAreaView
        edges={["bottom", "left", "right"]}
        color={themeColors.background}
        style={styles.bodySafeArea}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch()}
            />
          }
        >
          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={themeColors.primary} />
              <Typography size={14} color={themeColors.textSecondary}>
                Loading blocked contacts...
              </Typography>
            </View>
          ) : isError ? (
            <View style={styles.center}>
              <Typography size={14} color={themeColors.textSecondary}>
                Couldn't load blocked contacts.
              </Typography>

              <Typography
                size={14}
                color={themeColors.primary}
                onPress={() => void refetch()}
              >
                Try again
              </Typography>
            </View>
          ) : blockedUsers.length === 0 ? (
            <View style={styles.center}>
              <Typography size={16} weight="bold" color={themeColors.text}>
                No blocked contacts
              </Typography>

              <Typography size={14} color={themeColors.textSecondary}>
                People you block will appear here.
              </Typography>
            </View>
          ) : (
            <View style={styles.list}>
              {blockedUsers.map((item) => (
                <BlockedContactItem
                  key={item.user.id}
                  name={item.user.displayName}
                  avatarUrl={item.user.avatarUrl}
                  onPress={() =>
                    handleUnblock(item.user.id, item.user.displayName)
                  }
                  isDark={isDark}
                  themeColors={themeColors}
                  isUnblocking={
                    unblockMutation.isPending &&
                    unblockMutation.variables === item.user.id
                  }
                />
              ))}
            </View>
          )}

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
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 48,
  },
  footerNote: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
  },
});
