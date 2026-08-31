export interface BlockedContact {
  id: string;
  name: string;
  phone: string;
  avatarUrl: string;
}

export const BLOCKED_CONTACTS: BlockedContact[] = [
  {
    id: "1",
    name: "Annette Black",
    phone: "+61-827-680-673",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  },
  {
    id: "2",
    name: "Arlene McCoy",
    phone: "+61-827-680-673",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
  },
  {
    id: "3",
    name: "Annie Miles",
    phone: "+61-827-680-673",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
  },
];