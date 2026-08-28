import { StarredMessage } from "@/features/chats/components/StarredMsgItem";
import { GroupDetails } from "@/features/chats/types/chat";
import { SharedLinkSection } from "@/features/chats/screen/GroupSharedLinksScreen";


export const MOCK_SHARED_LINK_SECTIONS: SharedLinkSection[] = [
  {
    title: "Today",
    data: [
      {
        id: "1",
        title: "Figma: UI Kit & Design System 2026",
        url: "https://figma.com/file/sample-ui-kit-design-system",
        iconUri: "https://picsum.photos/100/100?random=20",
      },
      {
        id: "2",
        title: "GitHub - React Native Reanimated v3",
        url: "https://github.com/software-mansion/react-native-reanimated",
        iconUri: "https://picsum.photos/100/100?random=21",
      },
    ],
  },
  {
    title: "Yesterday",
    data: [
      {
        id: "3",
        title: "Stripe API Reference - Payment Intents",
        url: "https://stripe.com/docs/api/payment_intents",
        iconUri: "https://picsum.photos/100/100?random=22",
      },
      {
        id: "4",
        title: "Expo Documentation: File System",
        url: "https://docs.expo.dev/versions/latest/sdk/filesystem/",
        iconUri: "https://picsum.photos/100/100?random=23",
      },
      {
        id: "5",
        title: "Tailwind CSS - Rapidly build modern websites",
        url: "https://tailwindcss.com/docs/installation",
        iconUri: "https://picsum.photos/100/100?random=24",
      },
    ],
  },
  {
    title: "26 Oct 2025",
    data: [
      {
        id: "6",
        title: "Notion - Sprint Roadmap & Key Deliverables",
        url: "https://notion.so/workspace/sprint-roadmap-2026",
        iconUri: "https://picsum.photos/100/100?random=25",
      },
      {
        id: "7",
        title: "Linear - Bug Triage & Backlog Items",
        url: "https://linear.app/team/issue/CHAT-102",
        iconUri: "https://picsum.photos/100/100?random=26",
      },
    ],
  },
  {
    title: "25 Oct 2025",
    data: [
      {
        id: "6",
        title: "Notion - Sprint Roadmap & Key Deliverables",
        url: "https://notion.so/workspace/sprint-roadmap-2026",
        iconUri: "https://picsum.photos/100/100?random=25",
      },
      {
        id: "7",
        title: "Linear - Bug Triage & Backlog Items",
        url: "https://linear.app/team/issue/CHAT-102",
        iconUri: "https://picsum.photos/100/100?random=26",
      },
    ],
  },
];

export const MOCK_STARRED_MESSAGES: StarredMessage[] = [
  {
    id: "1",
    senderName: "Arlene McCoy",
    senderAvatar: "https://picsum.photos/100/100?random=1",
    message:
      "Hey team, don't forget to review the updated design mockups before our sync 21/07/2021!",
    timestamp: "10:30",
    dateLabel: "21/07/2021",
  },
  {
    id: "2",
    senderName: "Bessie Cooper",
    senderAvatar: "https://picsum.photos/100/100?random=11",
    message:
      "The server deployment is scheduled for 8 EST. Please make sure all PRs are merged.",
    timestamp: "04:15",
    dateLabel: "22/07/2021",
  },
  {
    id: "3",
    senderName: "Arlene McCoy",
    senderAvatar: "https://picsum.photos/100/100?random=1",
    message: "Here is the link to the sprint roadmap board for Q3 planning.",
    timestamp: "11:05",
    dateLabel: "Aug 12",
  },
  {
    id: "4",
    senderName: "Courtney Henry",
    senderAvatar: "https://picsum.photos/100/100?random=12",
    message:
      "We've updated the API documentation for the authentication endpoints. Please check the latest draft when you get a chance.",
    timestamp: "09:14",
    dateLabel: "Aug 10",
  },
  {
    id: "5",
    senderName: "Darlene Robertson",
    senderAvatar: "https://picsum.photos/100/100?random=13",
    message:
      "Can someone double-check the database migration script before we push to production?",
    timestamp: "02:45",
    dateLabel: "Aug 08",
  },
  {
    id: "6",
    senderName: "Devon Lane",
    senderAvatar: "https://picsum.photos/100/100?random=14",
    message: "Design assets for the onboarding flow are uploaded to Figma.",
    timestamp: "05:20",
    dateLabel: "Aug 05",
  },
  {
    id: "7",
    senderName: "Arlene McCoy",
    senderAvatar: "https://picsum.photos/100/100?random=14",
    message:
      "Reminder: All hands meeting tomorrow at 10. Make sure to submit your status updates beforehand.",
    timestamp: "06:00",
    dateLabel: "Aug 01",
  },
  {
    id: "8",
    senderName: "Eleanor Pena",
    senderAvatar: "https://picsum.photos/100/100?random=15",
    message:
      "The new UI components for the dark mode theme have been approved.",
    timestamp: "11:45",
    dateLabel: "Jul 29",
  },
  {
    id: "9",
    senderName: "Bessie Cooper",
    senderAvatar: "https://picsum.photos/100/100?random=11",
    message: "Bug fix for the chat scroll position has been merged into main.",
    timestamp: "01:10",
    dateLabel: "Jul 25",
  },
  {
    id: "10",
    senderName: "Guy Hawkins",
    senderAvatar: "https://picsum.photos/100/100?random=16",
    message:
      "Please review the performance benchmarks for the image caching layer. Looks promising!",
    timestamp: "03:30",
    dateLabel: "Jul 20",
  },
  {
    id: "11",
    senderName: "Jane Cooper",
    senderAvatar: "https://picsum.photos/100/100?random=17",
    message: "User testing session results are available in the shared folder.",
    timestamp: "08:50",
    dateLabel: "Jul 18",
  },
  {
    id: "12",
    senderName: "Kathryn Murphy",
    senderAvatar: "https://picsum.photos/100/100?random=18",
    message: "Great work on the release 21/07/2021, everyone!",
    timestamp: "07:15",
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
