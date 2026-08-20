import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Colors } from "@/shared/constants/colors";
import { ChatRoomHeader } from "@/features/chats/components/ChatRoomHeader";
import { AttachmentModal } from "@/features/chats/components/AttachmentModal";
import { useCameraHandler } from "@/features/chats/hooks/useCameraHandler";
import { ChatInputBar } from "@/features/chats/components/ChatInputBar";

// Icons
import CloseIcon from "@/assets/icons/shared/close.svg";

export default function ChatRoomScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const { name, avatar, isGroup, membersText } = useLocalSearchParams<{
    id: string;
    name: string;
    avatar?: string;
    isGroup?: string; // Expo router passes params as strings
    membersText?: string;
  }>();

  const isGroupChat = isGroup === "true";

  const [messageText, setMessageText] = useState("");
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [attachmentVisible, setAttachmentVisible] = useState(false);
  const { takePhoto, pickImage } = useCameraHandler();

  const handleSendText = () => {
    if (!messageText.trim() && !selectedImageUri) return;

    if (selectedImageUri) {
      console.log("Sending Image:", selectedImageUri, "Caption:", messageText);
      setSelectedImageUri(null);
    } else {
      console.log("Send Text:", messageText);
    }

    setMessageText("");
  };

  const handleSendAudio = (uri: string, durationSec: number) => {
    console.log("Send Voice Note:", uri, "Duration:", durationSec);
  };

  const handleCameraCapture = async () => {
    const photoUri = await takePhoto();
    if (photoUri) {
      setSelectedImageUri(photoUri);
    }
  };

  const handleGalleryPick = async () => {
    const imageUri = await pickImage();
    if (imageUri) {
      setSelectedImageUri(imageUri);
    }
  };

  return (
    <MySafeAreaView
      color={isDark ? themeColors.background : themeColors.primary}
    >
      {/* Header Configured for Group or Direct Chat */}
      <ChatRoomHeader
        name={name}
        avatar={avatar}
        isGroup={isGroupChat}
        membersText={membersText}
        backgroundColor={isDark ? themeColors.background : themeColors.primary}
        onHeaderPress={() =>
          console.log("Header pressed — navigate to details")
        }
        onVideoCall={() => console.log("Video call clicked")}
        onVoiceCall={() => console.log("Voice call clicked")}
      />

      {/* Keyboard Avoiding Body */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages Feed Area populated later */}
        <View
          style={[
            styles.chatBody,
            { backgroundColor: isDark ? "#0A1926" : "#F4F6F8" },
          ]}
        >
          <FlatList
            data={[]}
            renderItem={null}
            keyExtractor={(_, i) => i.toString()}
          />
        </View>

        {/* Selected Image Preview Box */}
        {selectedImageUri && (
          <View
            style={[
              styles.previewContainer,
              { backgroundColor: isDark ? "#163043" : "#FFFFFF" },
            ]}
          >
            <Image
              source={{ uri: selectedImageUri }}
              style={styles.previewImage}
            />
            <TouchableOpacity
              style={styles.removePreviewBtn}
              onPress={() => setSelectedImageUri(null)}
            >
              <CloseIcon width={14} height={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Input Bar */}
        <ChatInputBar
          text={messageText}
          onChangeText={setMessageText}
          onSendText={handleSendText}
          onSendAudio={handleSendAudio}
          onOpenAttachment={() => setAttachmentVisible(true)}
        />
      </KeyboardAvoidingView>

      {/* Attachment Modal Sheet */}
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
  keyboardView: {
    flex: 1,
  },
  chatBody: {
    flex: 1,
  },
  previewContainer: {
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 6,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  removePreviewBtn: {
    position: "absolute",
    top: 4,
    left: 60,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 12,
    padding: 4,
  },
});
