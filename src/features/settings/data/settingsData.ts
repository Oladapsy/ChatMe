import { FaqItem, StorageChatItem } from "@/features/settings/types/settings";

export const MOCK_STORAGE_CHATS: StorageChatItem[] = [
  {
    id: "1",
    name: "Esther Howard",
    phone: "+61-827-680-673",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
    size: "120,3 MB",
  },
  {
    id: "2",
    name: "Guy Hawkins",
    phone: "+61-664-234-133",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
    size: "431,6 MB",
  },
  {
    id: "3",
    name: "Robert Fox",
    phone: "+61-324-773-113",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200",
    size: "183,11 MB",
  },
  {
    id: "4",
    name: "Jacob Jones",
    phone: "+61-664-121-997",
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200",
    size: "623,3 MB",
  },
  {
    id: "5",
    name: "Floyd Miles",
    phone: "+61-333-444-211",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200",
    size: "325,67 MB",
  },
  {
    id: "6",
    name: "Dianne Russell",
    phone: "+61-531-996-421",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200",
    size: "123,3 MB",
  },
];

export const MOCK_FAQS: FaqItem[] = [
  {
    id: "1",
    question: "How can i use this app?",
    answer:
      'You can download it in the play store/app store, then type in the search menu with the name "ChatMe" then press download to be able to communicate easily.',
  },
  {
    id: "2",
    question: "Is this app paid?",
    answer: "No, ChatMe is completely free to download and use.",
  },
  {
    id: "3",
    question: "How to send messages and videos?",
    answer:
      "Open any chat conversation, tap the input field to type a message, or tap the attachment icon to select and send photos and videos.",
  },
  {
    id: "4",
    question: "Are there any special requirements for using this application?",
    answer:
      "You only need an active internet connection (Wi-Fi or cellular data) and a compatible iOS or Android device.",
  },
  {
    id: "5",
    question: "How to send files?",
    answer:
      "In any chat, tap the '+' attachment icon next to the message field and select 'Document' to pick files from your device storage.",
  },
];
