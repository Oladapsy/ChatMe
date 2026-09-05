import { create } from "zustand";

type ChatState = {
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
};

create<ChatState>((set) => ({
  selectedConversationId: null,
  setSelectedConversationId: (id) => set({ selectedConversationId: id }),
}));
