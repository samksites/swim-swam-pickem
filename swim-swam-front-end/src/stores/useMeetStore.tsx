// useMeetStore.ts
import { create } from "zustand";
import exampleSwimMeet from "../data/exampleSwimMeet.json";

type Swimmer = {
  name: string;
  time: string;
  // add other swimmer properties as needed
};

type Event = {
  title: string;
  swimmers: Swimmer[];
  // add other event properties as needed
};

type Day = {
  events: Event[];
  title: string;
  // add other day properties as needed
};

type MeetData = {
  id: string;
  days: Day[];
  entriesCloseDate: string;
  startDate: string;
  title: string;
  status: number;
  gender: string;
  type: string;
  seedTimes: boolean;
  allEvents: string[];
  // add other meet properties as needed
  
  deleteData: Set<string>;
};

type MeetStore = {
    meetData: typeof exampleSwimMeet;
    setMeetData: (data: typeof exampleSwimMeet) => void;
    updateTitle: (
        title: string,
    ) => void;
};

export const useMeetStore = create<MeetStore>((set) => ({
    meetData: {} as MeetData, // Initialize with an empty object

    setMeetData: (data) => set({ meetData: data }),

    updateTitle: (title: string) =>
        set((state) => {
            const updatedMeet = structuredClone(state.meetData);
            updatedMeet.title = title;
            return { meetData: updatedMeet };
        }),
}));