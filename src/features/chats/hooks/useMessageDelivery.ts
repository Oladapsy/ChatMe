import { retainAttachment } from "@/features/chats/utils/retainAttachment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Alert } from "react-native";
import * as Crypto from "expo-crypto";
import { useQueryClient } from "@tanstack/react-query";
import { sendMessage, type SendMessagePayload } from "@/features/chats/api/chatApi";
import { uploadChatAudio, uploadChatImage } from "@/features/chats/utils/uploadChatMedia";
import { getSessionGeneration } from "@/services/authStorage";

import type { Message, MessageHistoryResponse } from "@/features/chats/types/message";
import type { InfiniteData } from "@tanstack/react-query";
import type { UploadProgress } from "@/services/mediaUpload";

type Attachment = { uri: string; kind: "image" | "audio"; duration?: number; uploadId: string; mediaId?: string; progress: UploadProgress };
type Operation = { payload: SendMessagePayload; attachments: Attachment[]; generation: number; conversationId: string; state?: "pending" | "failed"; createdAt?: string; error?: string; confirmed?: boolean };

// Persist pending and failed operations across navigation and app restarts.
const outboxes = new Map<string, Operation[]>();
const storageWrites = new Map<string, Promise<unknown>>();
const listeners = new Set<() => void>();
const empty: Operation[] = [];
function updateOutbox(key: string, update: (items: Operation[]) => Operation[]) {
  outboxes.set(key, update(outboxes.get(key) ?? empty));
  const snapshot = JSON.stringify(outboxes.get(key));
  const write = (storageWrites.get(key) ?? Promise.resolve()).catch(() => {}).then(() => AsyncStorage.setItem(`chatme.outbox:${key}`, snapshot));
  storageWrites.set(key, write);
  void write.catch(() => {});
  listeners.forEach(listener => listener());
  return write;
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
  const user = queryClient.getQueryData<{ id: string }>(["me"]);
  const generation = getSessionGeneration();
  const key = `${user?.id ?? "unavailable"}:${conversationId}`;
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    let disposed = false;
    setRestored(false);
    if (!user?.id) return;
    void (storageWrites.get(key) ?? Promise.resolve()).then(() => AsyncStorage.getItem(`chatme.outbox:${key}`)).then(saved => {
      if (disposed || generation !== getSessionGeneration()) return;
      const operations: Operation[] = saved ? JSON.parse(saved) : [];
      outboxes.set(key, operations.map(operation => ({ ...operation, generation, state: "failed", createdAt: operation.createdAt ?? new Date().toISOString(), attachments: operation.attachments.map(attachment => ({ ...attachment, progress: { ...attachment.progress, generation } })) })));
      listeners.forEach(listener => listener());
      setRestored(true);
    }).catch(() => { Alert.alert("Recovery unavailable", "Saved messages couldn't be loaded. Please reopen this chat to retry."); });
    return () => { disposed = true; };
  }, [key, generation, user?.id]);
  const failed = useSyncExternalStore(subscribe, () => outboxes.get(key) ?? empty, () => empty);
  async function deliver(operation: Operation, onQueued?: () => void): Promise<boolean> {
    if (busy.current) return false;
    busy.current = true;
    setIsSending(true);
    const checkSession = () => {
      if (operation.generation !== getSessionGeneration()) throw new Error("Session changed");
    };
    try {
      checkSession();
      operation.state = "pending";
      operation.error = undefined;
      for (const attachment of operation.attachments) {
        if (!attachment.mediaId) attachment.uri = retainAttachment(attachment.uri);
      }
      await updateOutbox(key, items => items.includes(operation) ? [...items] : [...items, operation]);
      checkSession();
      onQueued?.();
      for (const attachment of operation.attachments) {
        if (!attachment.mediaId) {
          attachment.mediaId = attachment.kind === "audio"
            ? await uploadChatAudio(attachment.uri, attachment.duration ?? 0, attachment.uploadId, attachment.progress)
            : await uploadChatImage(attachment.uri, attachment.uploadId, attachment.progress);
        }
        checkSession();
        await updateOutbox(key, items => [...items]);
      }
      if (operation.attachments.length) {
        operation.payload.attachmentMediaIds = operation.attachments.map(item => item.mediaId!);
      }
      const confirmed = await sendMessage(operation.conversationId, operation.payload, operation.generation);
      checkSession();
      if (confirmed?.id) queryClient.setQueryData<InfiniteData<MessageHistoryResponse>>(["messages", conversationId], current => {
        if (!current?.pages.length) return { pages: [{ items: [confirmed], pageInfo: { hasNextPage: false, nextCursor: null } }], pageParams: [undefined] };
        if (current.pages.some(page => page.items.some(message => message.id === confirmed.id))) return current;
        return { ...current, pages: current.pages.map((page, index) => index === 0 ? { ...page, items: [confirmed, ...page.items] } : page) };
      });
      updateOutbox(key, items => items.filter(item => item !== operation));
      void queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      return true;
    } catch (error) {
      if (operation.confirmed) return true;
      if (operation.generation === getSessionGeneration()) {
        const failure = error as { response?: { data?: { message?: string; error?: { message?: string } } }; message?: string };
        operation.state = "failed";
        operation.error = failure.response?.data?.error?.message ?? failure.response?.data?.message ?? failure.message ?? "Check your connection and retry.";
        updateOutbox(key, items => items.includes(operation) ? [...items] : [...items, operation]);
      }
      return false;
    } finally {
      busy.current = false;
      setIsSending(false);
    }
  }
  function submit(text: string, images: string[], replyToMessageId?: string, audio?: { uri: string; duration: number }, onQueued?: () => void) {
    if (busy.current || !restored) return Promise.resolve(null);
    const attachments: Attachment[] = audio
      ? [{ ...audio, kind: "audio", uploadId: Crypto.randomUUID(), progress: {} }]
      : images.map(uri => ({ uri, kind: "image", uploadId: Crypto.randomUUID(), progress: {} }));
    return deliver({
      conversationId,
      createdAt: new Date().toISOString(),
      state: "pending",
      generation: getSessionGeneration(),
      payload: { clientMessageId: Crypto.randomUUID(), ...(text ? { text } : {}), ...(replyToMessageId ? { replyToMessageId } : {}) },
      attachments,
    }, onQueued);
  }
  const pendingMessages = useMemo<Message[]>(() => failed.map(operation => ({
    id: `local:${operation.payload.clientMessageId}`, clientMessageId: operation.payload.clientMessageId,
    senderId: user?.id ?? "", conversationId, text: operation.payload.text ?? null,
    createdAt: operation.createdAt ?? new Date().toISOString(), kind: operation.attachments[0]?.kind ?? "text",
    editedAt: null, deletedAt: null, replyToMessageId: operation.payload.replyToMessageId ?? null, version: 0, reactions: [],
    localDelivery: operation.state ?? "failed", failureReason: operation.error,
    attachments: operation.attachments.map(attachment => attachment.kind === "audio"
      ? { type: "audio", mediaId: attachment.mediaId ?? attachment.uploadId, contentType: "audio/mp4", sizeBytes: 0, durationMs: (attachment.duration ?? 0) * 1000, url: attachment.uri }
      : { type: "image", mediaId: attachment.mediaId ?? attachment.uploadId, contentType: "image/*", sizeBytes: 0, width: 0, height: 0, url: attachment.uri }),
  })), [failed, user?.id, conversationId]);
  const confirmMessages = (messages: Message[]) => {
    const items = outboxes.get(key) ?? empty;
    const remaining = items.filter(operation => {
      if (!messages.some(message => message.senderId === user?.id && message.clientMessageId === operation.payload.clientMessageId)) return true;
      operation.confirmed = true;
      return false;
    });
    if (remaining.length !== items.length) void updateOutbox(key, () => remaining);
  };
  return { submit, pendingMessages, confirmMessages, isSending: isSending || !restored, failedCount: failed.filter(operation => operation.state === "failed").length,
    retry: (clientMessageId?: string) => {
      const operation = failed.find(item => item.state === "failed" && (!clientMessageId || item.payload.clientMessageId === clientMessageId));
      return operation ? deliver(operation) : Promise.resolve(false);
    } };

}
