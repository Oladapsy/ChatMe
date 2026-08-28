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
