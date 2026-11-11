import { retainAttachment } from "@/features/chats/utils/retainAttachment";
import { Alert } from "react-native";
import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSessionGeneration } from "@/services/authStorage";

type Draft = { text: string; images: string[] };
const empty: Draft = { text: "", images: [] };
const writes = new Map<string, Promise<unknown>>();
export function useComposerDraft(userId: string | undefined, conversationId: string) {
  const key = userId && conversationId ? `chatme.draft:${userId}:${conversationId}` : null;
  const [record, setRecord] = useState<{ key: string | null; draft: Draft }>({ key: null, draft: empty });
  const [readyKey, setReadyKey] = useState<string | null>(null);
  const version = useRef(0);
  const current = useRef(record);
  current.current = record;
  const draft = record.key === key ? record.draft : empty;
  useEffect(() => {
    let disposed = false;
    const revision = version.current;
    const generation = getSessionGeneration();
    if (!key) return;
    void (writes.get(key) ?? Promise.resolve()).then(() => AsyncStorage.getItem(key)).then(saved => {
      if (disposed || generation !== getSessionGeneration()) return;
      if (revision === version.current) {
        const parsed = saved ? JSON.parse(saved) as Draft : empty;
        if (typeof parsed.text !== "string" || !Array.isArray(parsed.images) || !parsed.images.every(uri => typeof uri === "string")) throw new Error("Invalid draft");
        setRecord({ key, draft: parsed });
      }
      setReadyKey(key);
    }).catch(() => {
      if (!disposed) Alert.alert("Draft recovery unavailable", "Your saved draft couldn't be read. Reopen this chat to retry.");
    });
    return () => { disposed = true; };
  }, [key]);
  useEffect(() => {
    if (!key || readyKey !== key || record.key !== key) return;
    const snapshot = JSON.stringify(record.draft);
    const next = (writes.get(key) ?? Promise.resolve()).catch(() => {}).then(() => AsyncStorage.setItem(key, snapshot));
    writes.set(key, next);
    void next.catch(() => Alert.alert("Draft not saved", "Storage is unavailable. Keep this chat open until you can send your message."));
  }, [record, key, readyKey]);
  function update(next: Draft) {
    version.current++;
    current.current = { key, draft: next };
    setRecord(current.current);
  }
  const latest = () => current.current.key === key ? current.current.draft : empty;
  const setText = (value: string | ((current: string) => string)) => {
    const previous = latest();
    update({ ...previous, text: typeof value === "function" ? value(previous.text) : value });
  };
  const setImages = (value: string[] | ((current: string[]) => string[])) => {
    const previous = latest();
    try {
      const images = (typeof value === "function" ? value(previous.images) : value).map(retainAttachment);
      update({ ...previous, images });
    } catch (error) {
      Alert.alert("Attachment unavailable", error instanceof Error ? error.message : "Please select the file again.");
    }
  };
  return { text: draft.text, images: draft.images, setText, setImages, ready: !!key && readyKey === key };
}
