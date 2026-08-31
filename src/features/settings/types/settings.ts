export type AutoDownloadOption = "Off" | "Wi-Fi" | "Wi-Fi and Cellular";

export interface StorageChatItem {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  size: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}