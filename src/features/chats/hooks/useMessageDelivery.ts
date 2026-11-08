import { useRef, useState, useSyncExternalStore } from "react";
import { Alert } from "react-native";
import * as Crypto from "expo-crypto";
import { useQueryClient } from "@tanstack/react-query";
import { sendMessage, type SendMessagePayload } from "@/features/chats/api/chatApi";
import { uploadChatAudio, uploadChatImage } from "@/features/chats/utils/uploadChatMedia";
import { getSessionGeneration } from "@/services/authStorage";

import type { UploadProgress } from "@/services/mediaUpload";

type Attachment = { uri: string; kind: "image" | "audio"; duration?: number; uploadId: string; mediaId?: string; progress: UploadProgress };
type Operation = { payload: SendMessagePayload; attachments: Attachment[]; generation: number; conversationId: string };

// Retain failures across room navigation for the lifetime of this login.
const outboxes = new Map<string, Operation[]>();
const listeners = new Set<() => void>();
const empty: Operation[] = [];
function updateOutbox(key: string, update: (items: Operation[]) => Operation[]) {
  outboxes.set(key, update(outboxes.get(key) ?? empty));
  listeners.forEach(listener => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

// A failed operation stays here until explicitly retried successfully. Its payload
// and completed media IDs are never reconstructed from the current composer.
export function useMessageDelivery(conversationId: string) {
  const queryClient = useQueryClient();
  const busy = useRef(false);
  const [isSending, setIsSending] = useState(false);
  const key = `${getSessionGeneration()}:${conversationId}`;
  const failed = useSyncExternalStore(subscribe, () => outboxes.get(key) ?? empty, () => empty);
  async function deliver(operation: Operation): Promise<boolean> {
    if (busy.current) return false;
    busy.current = true;
    setIsSending(true);
    const checkSession = () => {
      if (operation.generation !== getSessionGeneration()) throw new Error("Session changed");
    };
    try {
      checkSession();
      for (const attachment of operation.attachments) {
        if (!attachment.mediaId) {
          attachment.mediaId = attachment.kind === "audio"
            ? await uploadChatAudio(attachment.uri, attachment.duration ?? 0, attachment.uploadId, attachment.progress)
            : await uploadChatImage(attachment.uri, attachment.uploadId, attachment.progress);
        }
        checkSession();
      }
      if (operation.attachments.length) {
        operation.payload.attachmentMediaIds = operation.attachments.map(item => item.mediaId!);
      }
      await sendMessage(operation.conversationId, operation.payload);
      checkSession();
      updateOutbox(key, items => items.filter(item => item !== operation));
      void queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      return true;
    } catch (error) {
      if (operation.generation === getSessionGeneration()) {
        updateOutbox(key, items => items.includes(operation) ? items : [...items, operation]);
        const failure = error as { response?: { data?: { message?: string; error?: { message?: string } }; status?: number }; message?: string };
        const reason = failure.response?.data?.error?.message ?? failure.response?.data?.message ?? failure.message ?? "Please check your connection.";
        Alert.alert("Message could not be sent", `${reason}\n\nYour message is available to retry in this chat.`, [
          { text: "Later", style: "cancel" },
          { text: "Retry", onPress: () => { void deliver(operation); } },
        ]);
      }
      return false;
    } finally {
      busy.current = false;
      setIsSending(false);
    }
  }
  function submit(text: string, images: string[], replyToMessageId?: string, audio?: { uri: string; duration: number }) {
    if (busy.current) return Promise.resolve(null);
    const attachments: Attachment[] = audio
      ? [{ ...audio, kind: "audio", uploadId: Crypto.randomUUID(), progress: {} }]
      : images.map(uri => ({ uri, kind: "image", uploadId: Crypto.randomUUID(), progress: {} }));
    return deliver({
      conversationId,
      generation: getSessionGeneration(),
      payload: { clientMessageId: Crypto.randomUUID(), ...(text ? { text } : {}), ...(replyToMessageId ? { replyToMessageId } : {}) },
      attachments,
    });
  }
  return { submit, isSending, failedCount: failed.length, retry: () => failed[0] ? deliver(failed[0]) : Promise.resolve(false) };
}
