import React from "react";
import { useColorScheme } from "react-native";
import { Tabs } from "expo-router";
import Phone from "@/assets/icons/tabs/phone.svg";
import Chat from "@/assets/icons/tabs/chat.svg";
import Settings from "@/assets/icons/tabs/settings.svg";

import { Colors } from "@/shared/constants/colors";

export default function TabLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: isDark ? "#6B7280" : "#9CA3AF",
        tabBarStyle: {
          backgroundColor: isDark ? "#0D1B2A" : "#FFFFFF",
          borderTopColor: isDark ? "#1F3C51" : "#E5E7EB",
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="call"
        options={{
          title: "Call",
          tabBarIcon: ({ color }) => (
            <Phone width={22} height={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "Chats",
          tabBarIcon: ({ color }) => (
            <Chat width={22} height={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Settings width={22} height={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
