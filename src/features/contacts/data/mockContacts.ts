export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar: string;
}

export interface ContactSection {
  title: string;
  data: Contact[];
}

export const MOCK_CONTACTS: Contact[] = [
  {
    id: "1",
    name: "Annette Black",
    phone: "+61-827-680-673",
    avatar: "https://i.pravatar.cc/100?img=1",
  },
  {
    id: "2",
    name: "Arlene McCoy",
    phone: "+61-827-680-673",
    avatar: "https://i.pravatar.cc/100?img=2",
  },
  {
    id: "3",
    name: "Annie Miles",
    phone: "+61-827-680-673",
    avatar: "https://i.pravatar.cc/100?img=3",
  },
  {
    id: "4",
    name: "Bourtney Henry",
    phone: "+61-827-680-673",
    avatar: "https://i.pravatar.cc/100?img=4",
  },
  {
    id: "5",
    name: "Bianne Russell",
    phone: "+61-827-680-673",
    avatar: "https://i.pravatar.cc/100?img=5",
  },
  {
    id: "6",
    name: "Bessie Cooper",
    phone: "+61-827-680-673",
    avatar: "https://i.pravatar.cc/100?img=6",
  },
  {
    id: "7",
    name: "Braif Fatari",
    phone: "+61-827-680-673",
    avatar: "https://i.pravatar.cc/100?img=7",
  },
  {
    id: "8",
    name: "Keanu Murphy",
    phone: "+61-827-680-673",
    avatar: "https://i.pravatar.cc/100?img=8",
  },
  {
    id: "9",
    name: "Kemal Pahlevi",
    phone: "+61-827-680-673",
    avatar: "https://i.pravatar.cc/100?img=9",
  },
  {
    id: "10",
    name: "Yemal Pahlevi",
    phone: "+1-555-522-8243",
    avatar: "https://i.pravatar.cc/100?img=10",
  },
  {
    id: "11",
    name: "Zemal Pahlevi",
    phone: "+1-555-522-8243",
    avatar: "https://i.pravatar.cc/100?img=11",
  },
];
