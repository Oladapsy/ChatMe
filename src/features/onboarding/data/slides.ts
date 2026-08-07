export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  illustration: string;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: "1",
    title: "Stay connected with your friends and family",
    description:
      "ChatMe is messaging app that will help you to connect with everyone.",
    illustration: "chat",
  },
  {
    id: "2",
    title: "Secure & private messaging experience",
    description:
      "ChatMe keeps your personal messages safe with end-to-end encryption.",
    illustration: "security",
  },
  {
    id: "3",
    title: "Stay organized with smart features",
    description: "ChatMe makes it easy to manage group chats and share files.",
    illustration: "organized",
  },
];
