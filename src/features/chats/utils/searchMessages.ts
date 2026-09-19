import type { ProcessedMessage } from "@/features/chats/utils/processMessages";

export function findMatchingMessageIndices(
  messages: ProcessedMessage[],
  searchQuery: string,
): number[] {
  const query = searchQuery.trim().toLowerCase();

  if (!query) {
    return [];
  }

  return messages.reduce<number[]>((matches, item, index) => {
    if (item.type === "message" && item.text?.toLowerCase().includes(query)) {
      matches.push(index);
    }

    return matches;
  }, []);
}
