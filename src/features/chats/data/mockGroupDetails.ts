import { StarredMessage } from "@/features/chats/components/StarredMsgItem";
import { GroupDetails } from "@/features/chats/types/chat";

export const MOCK_STARRED_MESSAGES: StarredMessage[] = [
  {
    id: "1",
    senderName: "Arlene McCoy",
    senderAvatar: "https://picsum.photos/100/100?random=10",
    message:
      "Hey team, don't forget to review the updated design mockups before our sync today!",
    timestamp: "10:30 AM",
    dateLabel: "Today",
  },
  {
    id: "2",
    senderName: "Bessie Cooper",
    senderAvatar: "https://picsum.photos/100/100?random=11",
    message:
      "The server deployment is scheduled for 8 PM EST. Please make sure all PRs are merged.",
    timestamp: "04:15 PM",
    dateLabel: "Yesterday",
  },
  {
    id: "3",
    senderName: "Arlene McCoy",
    senderAvatar: "https://picsum.photos/100/100?random=10",
    message: "Here is the link to the sprint roadmap board for Q3 planning.",
    timestamp: "11:05 AM",
    dateLabel: "Aug 12",
  },
  {
    id: "4",
    senderName: "Courtney Henry",
    senderAvatar: "https://picsum.photos/100/100?random=12",
    message:
      "We've updated the API documentation for the authentication endpoints. Please check the latest draft when you get a chance.",
    timestamp: "09:14 AM",
    dateLabel: "Aug 10",
  },
  {
    id: "5",
    senderName: "Darlene Robertson",
    senderAvatar: "https://picsum.photos/100/100?random=13",
    message:
      "Can someone double-check the database migration script before we push to production?",
    timestamp: "02:45 PM",
    dateLabel: "Aug 08",
  },
  {
    id: "6",
    senderName: "Devon Lane",
    senderAvatar: "https://picsum.photos/100/100?random=14",
    message: "Design assets for the onboarding flow are uploaded to Figma.",
    timestamp: "05:20 PM",
    dateLabel: "Aug 05",
  },
  {
    id: "7",
    senderName: "Arlene McCoy",
    senderAvatar: "https://picsum.photos/100/100?random=10",
    message:
      "Reminder: All hands meeting tomorrow at 10 AM. Make sure to submit your status updates beforehand.",
    timestamp: "06:00 PM",
    dateLabel: "Aug 01",
  },
  {
    id: "8",
    senderName: "Eleanor Pena",
    senderAvatar: "https://picsum.photos/100/100?random=15",
    message:
      "The new UI components for the dark mode theme have been approved.",
    timestamp: "11:45 AM",
    dateLabel: "Jul 29",
  },
  {
    id: "9",
    senderName: "Bessie Cooper",
    senderAvatar: "https://picsum.photos/100/100?random=11",
    message: "Bug fix for the chat scroll position has been merged into main.",
    timestamp: "01:10 PM",
    dateLabel: "Jul 25",
  },
  {
    id: "10",
    senderName: "Guy Hawkins",
    senderAvatar: "https://picsum.photos/100/100?random=16",
    message:
      "Please review the performance benchmarks for the image caching layer. Looks promising!",
    timestamp: "03:30 PM",
    dateLabel: "Jul 20",
  },
  {
    id: "11",
    senderName: "Jane Cooper",
    senderAvatar: "https://picsum.photos/100/100?random=17",
    message: "User testing session results are available in the shared folder.",
    timestamp: "08:50 AM",
    dateLabel: "Jul 18",
  },
  {
    id: "12",
    senderName: "Kathryn Murphy",
    senderAvatar: "https://picsum.photos/100/100?random=18",
    message: "Great work on the release today, everyone!",
    timestamp: "07:15 PM",
    dateLabel: "Jul 15",
  },
];

export const getMockGroupDetails = (id?: string): GroupDetails => ({
  id: id || "1",
  name: "Work Team",
  description:
    "Massa massa, ultrices morbi tortor et in cursus ultrices sem dignissim nunc, tortor aenean aliquet faucibus habitasse risee Massa massa, ultrices morbi tortor et in cursus ultrices sem dignissim nunc, tortor aenean aliquet faucibus habitasse",
  coverImageUri: "https://picsum.photos/800/600",
  photosCount: 2238,
  starMessagesCount: 43,
  sharedLinksCount: 19,
  recentPhotos: [
    "https://picsum.photos/300/300?random=1",
    "https://picsum.photos/300/300?random=2",
    "https://picsum.photos/300/300?random=3",
    "https://picsum.photos/300/300?random=4",
    "https://picsum.photos/300/300?random=5",
    "https://picsum.photos/300/300?random=6",
    "https://picsum.photos/300/300?random=7",
    "https://picsum.photos/300/300?random=8",
    "https://picsum.photos/300/300?random=9",
  ],
  members: [
    { id: "1", name: "Arlene McCoy", isOnline: true },
    { id: "2", name: "Bessie Cooper", isOnline: false },
    { id: "3", name: "Arlene McCoy", isOnline: true },
    { id: "4", name: "Bessie Cooper", isOnline: false },
    { id: "5", name: "Arlene McCoy", isOnline: true },
    { id: "6", name: "Bessie Cooper", isOnline: false },
    { id: "7", name: "Arlene McCoy", isOnline: true },
    { id: "8", name: "Bessie Cooper", isOnline: false },
    { id: "9", name: "Arlene McCoy", isOnline: true },
    { id: "10", name: "Bessie Cooper", isOnline: false },
  ],
});
