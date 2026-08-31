import { CallLog } from "@/features/calls/components/CallItem";

interface CallSection {
  title: string;
  data: CallLog[];
}

export const MOCK_CALL_LOGS: CallSection[] = [
  {
    title: "TODAY",
    data: [
      {
        id: "1",
        name: "Annie Miles",
        avatar: "https://i.pravatar.cc/150?img=32",
        type: "incoming",
        time: "10:30 PM",
      },
      {
        id: "2",
        name: "Wade Warren",
        avatar: "https://i.pravatar.cc/150?img=12",
        type: "outgoing",
        time: "10:00 PM",
      },
      {
        id: "3",
        name: "Guy Hawkins",
        avatar: "https://i.pravatar.cc/150?img=60",
        type: "missed",
        time: "08:32 PM",
      },
    ],
  },
  {
    title: "YESTERDAY",
    data: [
      {
        id: "4",
        name: "Robert Fox",
        avatar: "https://i.pravatar.cc/150?img=68",
        type: "outgoing",
        time: "11:11 PM",
      },
      {
        id: "5",
        name: "Savannah Nguyen",
        avatar: "https://i.pravatar.cc/150?img=47",
        type: "incoming",
        time: "10:22 PM",
      },
      {
        id: "6",
        name: "Albet Flores",
        avatar: "https://i.pravatar.cc/150?img=59",
        type: "outgoing",
        time: "10:10 PM",
      },
      {
        id: "7",
        name: "Annette Black",
        avatar: "https://i.pravatar.cc/150?img=26",
        type: "incoming",
        time: "09:31 PM",
      },
      {
        id: "8",
        name: "Floyd Miles",
        avatar: "https://i.pravatar.cc/150?img=20",
        type: "outgoing",
        time: "09:00 PM",
      },
      {
        id: "9",
        name: "Kathryn Murphy",
        avatar: "https://i.pravatar.cc/150?img=49",
        type: "incoming",
        time: "08:21 PM",
      },
    ],
  },
];
