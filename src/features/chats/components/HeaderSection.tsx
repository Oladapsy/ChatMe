import React from "react";
import { ChatHeader } from "@/features/chats/components/ChatHeader";
import { SelectionHeader } from "@/features/chats/components/SelectionHeader";

interface HeaderSectionProps {
  selectedCount: number;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onClearSelection: () => void;
  onPin: () => void;
  onMute: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function HeaderSection({
  selectedCount,
  searchQuery,
  onSearchChange,
  onClearSelection,
  onPin,
  onMute,
  onArchive,
  onDelete,
}: HeaderSectionProps) {
  if (selectedCount > 0) {
    return (
      <SelectionHeader
        selectedCount={selectedCount}
        onClearSelection={onClearSelection}
        onPin={onPin}
        onMute={onMute}
        onArchive={onArchive}
        onDelete={onDelete}
      />
    );
  }

  return (
    <ChatHeader searchQuery={searchQuery} onSearchChange={onSearchChange} />
  );
}
