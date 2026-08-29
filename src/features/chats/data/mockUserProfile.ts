import { UserProfile } from "@/features/chats/types/chat";

export const MOCK_USER_PROFILE: UserProfile = {
  id: "user_arlene",
  name: "Arlene McCoy",
  avatarUri: "https://picsum.photos/400/500?random=100",
  lastSeen: "Last seen 24 minutes ago",
  phone: "+61-123-753-555",
  description: "Busy🔥",
  photoCount: 2238,
  previewPhotos: [
    "https://picsum.photos/200/200?random=1",
    "https://picsum.photos/200/200?random=2",
    "https://picsum.photos/200/200?random=3",
    "https://picsum.photos/200/200?random=4",
    "https://picsum.photos/200/200?random=5",
  ],
  starCount: 43,
  linkCount: 19,
  isMuted: false,
  isBlocked: false,
  qrValue: "https://myapp.com/user/user_arlene",
};
