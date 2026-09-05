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
        tabBarInactiveTintColor: themeColors.textSecondary,
        tabBarStyle: {
          backgroundColor: themeColors.tabBg,
          elevation: 0,
          shadowOpacity: 0.1,
          height: 80,
          paddingBottom: 12,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          marginTop: 4,
        },
      }}
      initialRouteName="index"
    >
      <Tabs.Screen
        name="call"
        options={{
          title: "Call",
          tabBarIcon: ({ color }) => (
            <Phone width={24} height={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "Chats",
          tabBarIcon: ({ color }) => (
            <Chat width={24} height={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Settings width={24} height={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
