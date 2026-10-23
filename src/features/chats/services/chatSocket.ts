import { io, type Socket } from "socket.io-client";
import { getAccessToken } from "@/services/authStorage";

const API_ORIGIN = process.env.EXPO_PUBLIC_API_ORIGIN;

if (!API_ORIGIN) {
  throw new Error("EXPO_PUBLIC_API_ORIGIN is not configured");
}

/**
 * Creates an authenticated socket for the /chat namespace.
 * The auth callback retrieves the latest token whenever Socket.IO connects
 * or reconnects, rather than permanently capturing an old access token.
 */
export function createChatSocket(): Socket {
  return io(`${API_ORIGIN}/chat`, {
    autoConnect: false,
    auth: (callback) => {
      void getAccessToken()
        .then((token) => {
          callback({ token });
        })
        .catch((error) => {
          console.error("SOCKET: unable to retrieve access token", error);
          callback({ token: "" });
        });
    },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });
}
