export type MessageType =
  | "text"
  | "image"
  | "audio"
  | "document"
  | "location"
  | "contact";

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

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  type: MessageType;
  text?: string;
  imageUris?: string[];
  audioUri?: string;
  audioDuration?: number;
  document?: MessageDocument; // Added missing property
  location?: MessageLocation; // Added missing property
  contact?: MessageContact;   // Added missing property
  createdAt: string;
  isMe: boolean;
  showAvatar?: boolean;
}