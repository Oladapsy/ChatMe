import React from "react";
import { ChatHeader } from "@/features/chats/components/ChatHeader";
import { SelectionHeader } from "@/features/chats/components/SelectionHeader";

interface HeaderSectionProps {
  selectedCount: number;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onClearSelection: () => void;
}

export function HeaderSection({
  selectedCount,
  searchQuery,
  onSearchChange,
  onClearSelection,
}: HeaderSectionProps) {
  if (selectedCount > 0) {
    return (
      <SelectionHeader
        selectedCount={selectedCount}
        onClearSelection={onClearSelection}
      />
    );
  }

  return (
    <ChatHeader searchQuery={searchQuery} onSearchChange={onSearchChange} />
  );
}
