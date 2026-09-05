import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAudioRecorder, AudioModule, RecordingPresets } from "expo-audio";

import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";

import PaperclipIcon from "@/assets/icons/chat/paperClip.svg";
import SendIcon from "@/assets/icons/chat/send.svg";
import MicIcon from "@/assets/icons/chat/mic.svg";
import TrashIcon from "@/assets/icons/chat/trash.svg";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

interface Props {
  text: string;
  onChangeText: (val: string) => void;
  onSendText: () => void;
  onSendAudio: (audioUri: string, durationSec: number) => void;
  onOpenAttachment: () => void;
  hasAttachments?: boolean;
}

export function ChatInputBar({
  text,
  onChangeText,
  onSendText,
  onSendAudio,
  onOpenAttachment,
  hasAttachments = false,
}: Props) {
    const { isDark, themeColors } = useAppTheme();

  const insets = useSafeAreaInsets();

  const [isRecordingState, setIsRecordingState] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState<ReturnType<
    typeof setInterval
  > | null>(null);

  const canSend = text.trim().length > 0 || hasAttachments;

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  const startRecording = async () => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) return;

      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      audioRecorder.record();
      setIsRecordingState(true);
      setRecordDuration(0);

      const interval = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    } catch (err) {
      console.warn("Failed to start recording:", err);
    }
  };

  const stopAndSendRecording = async () => {
    if (timerInterval) clearInterval(timerInterval);
    setIsRecordingState(false);

    try {
      await audioRecorder.stop();
      await AudioModule.setAudioModeAsync({ allowsRecording: false });

      const uri = audioRecorder.uri;
      if (uri) {
        onSendAudio(uri, recordDuration);
      }
    } catch (err) {
      console.warn("Failed to stop recording:", err);
    }

    setRecordDuration(0);
  };

  const cancelRecording = async () => {
    if (timerInterval) clearInterval(timerInterval);
    setIsRecordingState(false);

    try {
      await audioRecorder.stop();
      await AudioModule.setAudioModeAsync({ allowsRecording: false });
    } catch (err) {
      console.warn("Failed to cancel recording:", err);
    }

    setRecordDuration(0);
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}
    >
      {isRecordingState ? (
        <View
          style={[
            styles.inputPill,
            { backgroundColor: themeColors.cardBackground },
          ]}
        >
          <TouchableOpacity onPress={cancelRecording} style={styles.iconBtn}>
            <TrashIcon width={22} height={22} color={themeColors.error} />
          </TouchableOpacity>

          <Typography
            size={15}
            weight="bold"
            color={themeColors.error}
            style={styles.timer}
          >
            ● {formatTime(recordDuration)} Recording...
          </Typography>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: themeColors.primary }]}
            onPress={stopAndSendRecording}
          >
            <SendIcon width={18} height={18} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={[
            styles.inputPill,
            { backgroundColor: themeColors.cardBackground },
          ]}
        >
          <TouchableOpacity onPress={onOpenAttachment} style={styles.iconBtn}>
            <PaperclipIcon
              width={22}
              height={22}
              color={themeColors.textSecondary}
            />
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { color: themeColors.text }]}
            placeholder="Type a message..."
            placeholderTextColor={themeColors.textSecondary}
            value={text}
            onChangeText={onChangeText}
            returnKeyType="send"
            onSubmitEditing={onSendText}
          />

          <TouchableOpacity onPress={startRecording} style={styles.iconBtn}>
            <MicIcon width={22} height={22} color={themeColors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: canSend
                  ? themeColors.primary
                  : themeColors.primary + "80",
              },
            ]}
            onPress={onSendText}
            disabled={!canSend}
          >
            <SendIcon width={18} height={18} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: "transparent",
    // paddingBottom: 8,
  },
  inputPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 28,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 56,
  },
  iconBtn: {
    padding: 6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    marginHorizontal: 6,
    maxHeight: 100,
  },
  timer: {
    flex: 1,
    marginLeft: 10,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
});
