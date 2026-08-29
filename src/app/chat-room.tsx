import React, { useState, useRef } from "react";
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

// Icons & Background
import CloseIcon from "@/assets/icons/shared/close.svg";
import ChatBgIcon from "@/assets/icons/chat/ChatBg.svg";

// Types & Components
import { Message } from "@/features/chats/types/message";
import { MessageBubble } from "@/features/chats/components/MessageBubble";
import { MOCK_MESSAGES } from "@/features/chats/data/mockMessages";

// header routing
import { useRouter } from "expo-router";

export default function ChatRoomScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const { id, name, avatar, isGroup, membersText } = useLocalSearchParams<{
    id: string;
    name: string;
    avatar?: string;
    isGroup?: string;
    membersText?: string;
  }>();

  const isGroupChat = isGroup === "true";
  const activeChatId = id || "1";

  const initialMessages = MOCK_MESSAGES[activeChatId] || [];
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const [messageText, setMessageText] = useState("");
  const [selectedImageUris, setSelectedImageUris] = useState<string[]>([]);
  const [attachmentVisible, setAttachmentVisible] = useState(false);

  const { takePhoto, pickImages } = useCameraHandler();
  const flatListRef = useRef<FlatList>(null);

  const processedMessages = messages.map((msg, index) => {
    const nextMsg = messages[index + 1];
    const isLastFromSender = !nextMsg || nextMsg.senderId !== msg.senderId;
    return {
      ...msg,
      showAvatar: isLastFromSender,
    };
  });

  const handleSendText = () => {
    if (!messageText.trim() && selectedImageUris.length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      chatId: activeChatId,
      senderId: "user_me",
      type: selectedImageUris.length > 0 ? "image" : "text",
      text: messageText.trim() || undefined,
      imageUris: selectedImageUris.length > 0 ? selectedImageUris : undefined,
      createdAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      isMe: true,
    };

    setMessages((prev) => [...prev, newMessage]);

    setMessageText("");
    setSelectedImageUris([]);
  };

  const handleSendAudio = (uri: string, durationSec: number) => {
    const audioMessage: Message = {
      id: Date.now().toString(),
      chatId: activeChatId,
      senderId: "user_me",
      type: "audio",
      audioUri: uri,
      audioDuration: durationSec,
      createdAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      isMe: true,
    };

    setMessages((prev) => [...prev, audioMessage]);
  };

  const handleCameraCapture = async () => {
    const photoUri = await takePhoto();
    if (photoUri) {
      setSelectedImageUris((prev) => [...prev, photoUri]);
    }
  };

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

  const handleHeaderPress = () => {
    if (isGroupChat) {
      router.push({
        pathname: "/group-details",
        params: { id: activeChatId },
      });
    } else {
      // console.log("User details route is coming soon!")
      router.push({
        pathname: "/user-details",
        params: { id: activeChatId },
      });
    }
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
        onHeaderPress={handleHeaderPress}
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
          {/* Background Vector Pattern */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <ChatBgIcon
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
              color={
                isDark
                  ? "rgba(255, 255, 255, 0.04)"
                  : "rgba(16, 185, 129, 0.06)"
              }
            />
          </View>

          {/* Chat Feed */}
          <FlatList
            ref={flatListRef}
            data={processedMessages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageBubble message={item} isGroup={isGroupChat} />
            )}
            contentContainerStyle={{
              paddingVertical: 10,
              flexGrow: 1,
              justifyContent: "flex-end",
            }}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        </View>

        {/* Selected Images Strip */}
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
                    { backgroundColor: isDark ? "#163043" : "white" },
                  ]}
                >
                  <Image source={{ uri: item }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removePreviewBtn}
                    onPress={() => removeSelectedImage(item)}
                  >
                    <CloseIcon width={12} height={12} color="white" />
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
        onSelectImage={handleSelectRecentPhoto}
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
    position: "relative",
  },
  previewWrapper: {
    maxHeight: 80,
    marginBottom: 6,
  },
  previewStrip: {
    paddingHorizontal: 16,
    paddingTop: 10,
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
