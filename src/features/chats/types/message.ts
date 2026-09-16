export type MessageType = "text" | "image" | "audio" | "document" | "video";
// | "location"
// | "contact";

export interface MessageDocument {
  name: string;
  size: string;
  uri: string;
}

export interface MessageLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface MessageContact {
  name: string;
  phoneNumber: string;
  avatar?: string;
}

// the backend message return type
export interface MessageImageAttachment {
  mediaId: string;
  type: "image";
  contentType: string;
  sizeBytes: number;
  width: number;
  height: number;
  url: string;
}

export interface MessageAudioAttachment {
  mediaId: string;
  type: "audio";
  contentType: string;
  sizeBytes: number;
  durationMs: number;
  url: string;
}

export interface MessageVideoAttachment {
  mediaId: string;
  type: "video";
  contentType: string;
  sizeBytes: number;
  durationMs: number;
  width: number;
  height: number;
  url: string;
}

export interface MessageDocumentAttachment {
  mediaId: string;
  type: "document";
  contentType: string;
  sizeBytes: number;
  filename: string;
  url: string;
}

export type MessageAttachment =
  | MessageImageAttachment
  | MessageAudioAttachment
  | MessageVideoAttachment
  | MessageDocumentAttachment;

export interface MessageReaction {
  userId: string;
  emoji: string;
}

export interface Message {
  id: string;
  conversationId: string;
  clientMessageId: string;
  senderId: string;

  kind: MessageType;

  text: string | null;

  attachments: MessageAttachment[];

  createdAt: string;

  replyToMessageId: string | null;

  editedAt: string | null;

  deletedAt: string | null;

  version: number;

  reactions: MessageReaction[];

  // UI-specific fields
  senderName?: string;
  senderAvatar?: string;
  isMe: boolean;
  showAvatar?: boolean;
  isStarred?: boolean;
}

export interface MessagePageInfo {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface MessageHistoryResponse {
  items: Message[];
  pageInfo: MessagePageInfo;
}
