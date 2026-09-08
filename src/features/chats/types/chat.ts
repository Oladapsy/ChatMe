// the user details
export interface UserProfile {
  id: string;
  name: string;
  avatarUri?: string;
  lastSeen: string;
  phone: string;
  description: string;
  photoCount: number;
  previewPhotos: string[];
  starCount: number;
  linkCount: number;
  isMuted: boolean;
  isBlocked: boolean;
  qrValue: string;
}

export interface GroupMember {
  id: string;
  name: string;
  avatarUri?: string;
  isOnline?: boolean;
  role?: "admin" | "member";
}

export interface GroupDetails {
  id: string;
  name: string;
  description: string;
  coverImageUri?: string;
  photosCount: number;
  starMessagesCount: number;
  sharedLinksCount: number;
  recentPhotos: string[];
  members: GroupMember[];
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  isPinned?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
  isOnline?: boolean;
  isGroup?: boolean;
  // chaneged this from string[] array of string to array of group members
  members?: GroupMember[];
  // added group details
  // maybe i will add the user details here later
  groupDetails?: GroupDetails;
}



// Backend response for getting Conversations
// last msg in conversation
export interface LatestMessage {
  id: string;
  senderId: string;
  kind: "text"; // i think this might be "text" or "image" or "file" or "link"
  preview: string;
  createdAt: string;
}

// for the conversation participants
export interface ConversationParticipant {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  role?: "owner" | "admin" | "member";
}

// convesration settings used in conversation list return
export interface ConversationSettings {
  archived: boolean;
  muted: boolean;
  pinned: boolean;
  favorited: boolean;
  archivedAt: string | null;
  mutedAt: string | null;
  mutedUntil: string | null;
  pinnedAt: string | null;
  favoritedAt: string | null;
  clearedAt: string | null;
  clearedThroughMessageId: string | null;
}

// the main conversation for direct chat
export interface DirectConversation {
  id: string;
  latestMessage: LatestMessage | null;
  unreadCount: number;
  settings: ConversationSettings;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  type: "direct"; // will do group for groups
  otherParticipant: ConversationParticipant;
}

// the main conversation for group chat
export interface GroupConversation {
  id: string;
  latestMessage: LatestMessage | null;
  unreadCount: number;
  settings: ConversationSettings;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  type: "group";
  name: string;
  avatarUrl: string | null;
  participants: ConversationParticipant[];
  role: "owner" | "admin" | "member";
}

// the head main conversation for the main and group
export type Conversation = DirectConversation | GroupConversation;

export interface ConversationPageInfo {
  nextCursor: string | null;
  hasNextPage: boolean;
}

// the oga pata pata the main main response
export interface ConversationListResponse {
  items: Conversation[];
  pageInfo: ConversationPageInfo;
}