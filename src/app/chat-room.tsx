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
    isGroup?: string;
    membersText?: string;
  }>();

  const isGroupChat = isGroup === "true";

  const [messageText, setMessageText] = useState("");
  // 1. Changed state from single string to string array for multiple photos
  const [selectedImageUris, setSelectedImageUris] = useState<string[]>([]);
  const [attachmentVisible, setAttachmentVisible] = useState(false);

  // 2. Destructure pickImages instead of pickImage
  const { takePhoto, pickImages } = useCameraHandler();

  const handleSendText = () => {
    if (!messageText.trim() && selectedImageUris.length === 0) return;

    if (selectedImageUris.length > 0) {
      console.log(
        "Sending Images:",
        selectedImageUris,
        "Caption:",
        messageText,
      );
      setSelectedImageUris([]);
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
      setSelectedImageUris((prev) => [...prev, photoUri]);
    }
  };

  // 3. Updated gallery pick handler to process string array
  const handleGalleryPick = async () => {
    const imageUris = await pickImages();
    if (imageUris.length > 0) {
      setSelectedImageUris((prev) => [...prev, ...imageUris]);
    }
  };

  const handleSelectRecentPhoto = (uri: string) => {
    setSelectedImageUris((prev) =>
      prev.includes(uri) ? prev.filter((item) => item !== uri) : [...prev, uri],
    );
  };

  const removeSelectedImage = (uriToRemove: string) => {
    setSelectedImageUris((prev) => prev.filter((uri) => uri !== uriToRemove));
  };

  return (
    <MySafeAreaView
      color={isDark ? themeColors.background : themeColors.primary}
    >
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

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
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

        {/* 4. Multi-Image Preview Horizontal Carousel */}
        {selectedImageUris.length > 0 && (
          <View style={styles.previewWrapper}>
            <FlatList
              data={selectedImageUris}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(uri, idx) => `${uri}-${idx}`}
              contentContainerStyle={styles.previewStrip}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.previewContainer,
                    { backgroundColor: isDark ? "#163043" : "#FFFFFF" },
                  ]}
                >
                  <Image source={{ uri: item }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removePreviewBtn}
                    onPress={() => removeSelectedImage(item)}
                  >
                    <CloseIcon width={12} height={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}

        <ChatInputBar
          text={messageText}
          onChangeText={setMessageText}
          onSendText={handleSendText}
          onSendAudio={handleSendAudio}
          onOpenAttachment={() => setAttachmentVisible(true)}
          hasAttachments={selectedImageUris.length > 0}
        />
      </KeyboardAvoidingView>

      <AttachmentModal
        visible={attachmentVisible}
        onClose={() => setAttachmentVisible(false)}
        onOpenCamera={handleCameraCapture}
        onOpenGallery={handleGalleryPick}
        onSelectImage={handleSelectRecentPhoto} // Fixes the missing prop error
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
  previewWrapper: {
    maxHeight: 80,
    marginBottom: 6,
  },
  previewStrip: {
    paddingHorizontal: 16,
    gap: 8,
  },
  previewContainer: {
    padding: 4,
    borderRadius: 10,
    position: "relative",
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  removePreviewBtn: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 10,
    padding: 4,
  },
});
