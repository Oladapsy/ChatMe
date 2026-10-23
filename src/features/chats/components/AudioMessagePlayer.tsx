import { useEffect } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Pressable, StyleSheet, Text, View } from "react-native";
import PauseIcon from "@/assets/icons/chat/pause.svg";
import PlayIcon from "@/assets/icons/chat/play.svg";
import {
  playExclusiveAudio,
  releaseAudioPlayer,
} from "@/features/chats/utils/audioPlaybackController";

import { useAppTheme } from "@/shared/hooks/useAppTheme";

type AudioMessagePlayerProps = {
  uri: string;
  durationMs: number;
};

export default function AudioMessagePlayer({
  uri,
  durationMs,
}: AudioMessagePlayerProps) {
  const { themeColors } = useAppTheme();
  const styles = createStyles(themeColors);

  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
  return () => {
    releaseAudioPlayer(player);
  };
}, [player]);

  const isPlaying = status.playing;
  const hasFinished = status.didJustFinish;
  const currentTimeMs = status.didJustFinish
    ? 0
    : (status.currentTime ?? 0) * 1000;

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  const handlePlayback = async () => {
  try {
    if (isPlaying) {
      player.pause();
      return;
    }

    if (status.didJustFinish) {
      await player.seekTo(0);
    }

    playExclusiveAudio(player);
  } catch (error) {
    console.error("Audio playback failed:", error);
  }
};

  const progress =
    durationMs > 0 ? Math.min((currentTimeMs / durationMs) * 100, 100) : 0;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handlePlayback}
        style={styles.playButton}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? "Pause audio" : "Play audio"}
      >
        <Text style={styles.playIcon}>
          {isPlaying ? (
            <PauseIcon width={20} height={20} color={"white"} />
          ) : (
            <PlayIcon width={20} height={20} color={"white"} />
          )}
        </Text>
      </Pressable>

      <View style={styles.details}>
        <View style={styles.track}>
          <View style={[styles.progress, { width: `${progress}%` }]} />
        </View>

        <Text style={styles.time}>
          {formatTime(currentTimeMs > 0 ? currentTimeMs : durationMs)}
        </Text>
      </View>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>["themeColors"]) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      minWidth: 200,
    },
    playButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    playIcon: {
      color: colors.buttonText,
      fontSize: 18,
    },
    details: {
      flex: 1,
      gap: 6,
    },
    track: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: "hidden",
    },
    progress: {
      height: "100%",
      backgroundColor: colors.textSecondary,
    },
    time: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });
}
