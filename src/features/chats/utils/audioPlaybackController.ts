import type { AudioPlayer } from "expo-audio";

let activePlayer: AudioPlayer | null = null;

export function playExclusiveAudio(player: AudioPlayer) {
  const previousPlayer = activePlayer;

  // Register the new player first.
  activePlayer = player;

  if (previousPlayer && previousPlayer !== player) {
    try {
      previousPlayer.pause();
    } catch (error) {
      console.warn("Could not pause previous audio player:", error);
    }
  }

  player.play();
}

export function releaseAudioPlayer(player: AudioPlayer) {
  if (activePlayer === player) {
    activePlayer = null;
  }
}

export function stopActiveAudio() {
  if (!activePlayer) return;

  try {
    activePlayer.pause();
  } catch (error) {
    console.warn("Could not stop active audio:", error);
  }

  activePlayer = null;
}
