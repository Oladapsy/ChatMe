import React, { useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity, useColorScheme, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import { AttachmentModal } from "@/features/chats/components/AttachmentModal";
import { useCameraHandler } from "@/features/chats/hooks/useCameraHandler";
import { ChatInputBar } from "@/features/chats/components/ChatInputBar";

// Header Icons
import BackChevronIcon from "@/assets/icons/shared/chevron-left.svg";
import VideoCallIcon from "@/assets/icons/chat/video-camera.svg";
import PhoneCallIcon from "@/assets/icons/chat/phone.svg";

export default function ChatRoomScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const { id, name, avatar } = useLocalSearchParams<{
    id: string;
    name: string;
    avatar?: string;
  }>();

  const [messageText, setMessageText] = useState("");
  const [attachmentVisible, setAttachmentVisible] = useState(false);
  const { takePhoto, pickImage } = useCameraHandler();

  const contactName = name || "Keanu Murphy";

  const handleSendText = () => {
    if (!messageText.trim()) return;
    console.log("Send Text:", messageText);
    setMessageText("");
  };

  const handleSendAudio = (uri: string, durationSec: number) => {
    console.log("Send Voice Note:", uri, "Duration:", durationSec);
  };

  const handleCameraCapture = async () => {
    const photoUri = await takePhoto();
    if (photoUri) {
      console.log("Captured image URI from Camera:", photoUri);
    }
  };

  const handleGalleryPick = async () => {
    const imageUri = await pickImage();
    if (imageUri) {
      console.log("Selected image URI from Gallery:", imageUri);
    }
  };

  return (
    <MySafeAreaView color={isDark ? themeColors.background : themeColors.primary}>
      {/* Dynamic Header */}
      <View style={[styles.header, { backgroundColor: isDark ? themeColors.background : themeColors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <BackChevronIcon width={24} height={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Image source={{ uri: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" }} style={styles.avatar} />

        <View style={styles.headerTitle}>
          <Typography size={16} weight="bold" color="#FFFFFF">
            {contactName}
          </Typography>
          <Typography size={12} color="rgba(255, 255, 255, 0.8)">
            Active 5 minutes ago
          </Typography>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionIcon}><VideoCallIcon width={22} height={22} color="#FFFFFF" /></TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}><PhoneCallIcon width={22} height={22} color="#FFFFFF" /></TouchableOpacity>
        </View>
      </View>

      {/* Message Feed Container */}
      <View style={[styles.chatBody, { backgroundColor: isDark ? "#0A1926" : "#F4F6F8" }]}>
        <FlatList data={[]} renderItem={null} keyExtractor={(_, i) => i.toString()} />
      </View>

      {/* Input Bar */}
      <ChatInputBar
        text={messageText}
        onChangeText={setMessageText}
        onSendText={handleSendText}
        onSendAudio={handleSendAudio}
        onOpenAttachment={() => setAttachmentVisible(true)}
      />

      {/* Attachment Sheet */}
      <AttachmentModal
        visible={attachmentVisible}
        onClose={() => setAttachmentVisible(false)}
        onOpenCamera={handleCameraCapture}
        onOpenGallery={handleGalleryPick}
        onSelectDocument={() => console.log("Document selected")}
        onSelectLocation={() => console.log("Location selected")}
        onSelectContact={() => console.log("Contact selected")}
      />
    </MySafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    paddingRight: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 4,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: "row",
  },
  actionIcon: {
    padding: 6,
    marginLeft: 4,
  },
  chatBody: {
    flex: 1,
  },
});