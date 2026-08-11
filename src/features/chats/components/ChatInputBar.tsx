import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { useAudioRecorder, AudioModule, RecordingPresets } from "expo-audio";

import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";

import PaperclipIcon from "@/assets/icons/chat/paperClip.svg";
import SendIcon from "@/assets/icons/chat/send.svg";
import MicIcon from "@/assets/icons/chat/mic.svg";
import TrashIcon from "@/assets/icons/chat/trash.svg";

interface Props {
  text: string;
  onChangeText: (val: string) => void;
  onSendText: () => void;
  onSendAudio: (audioUri: string, durationSec: number) => void;
  onOpenAttachment: () => void;
}

export function ChatInputBar({
  text,
  onChangeText,
  onSendText,
  onSendAudio,
  onOpenAttachment,
}: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const [isRecordingState, setIsRecordingState] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState<ReturnType<
    typeof setInterval
  > | null>(null);

  // Initialize expo-audio recorder
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // Clean up timer when unmounting
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
    <View style={styles.container}>
      {isRecordingState ? (
        /* Recording Audio Active UI */
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
        /* Input Pill: [ Paperclip | Input Field | Mic Icon | Send Button ] */
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
            multiline
          />

          {/* Mic button-> i downloaded it using the iphone imsg from iconify */}
          <TouchableOpacity onPress={startRecording} style={styles.iconBtn}>
            <MicIcon width={22} height={22} color={themeColors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor:
                  text.trim().length > 0
                    ? themeColors.primary
                    : "rgba(16, 185, 129, 0.4)",
              },
            ]}
            onPress={onSendText}
            disabled={text.trim().length === 0}
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
    paddingVertical: 8,
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
