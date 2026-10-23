import type { AudioPlayer } from "expo-audio";

let activePlayer: AudioPlayer | null = null;

export function playExclusiveAudio(player: AudioPlayer) {
  if (activePlayer && activePlayer !== player) {
    activePlayer.pause();
  }

  activePlayer = player;
  player.play();
}

export function releaseAudioPlayer(player: AudioPlayer) {
  if (activePlayer === player) {
    activePlayer = null;
  }
}
