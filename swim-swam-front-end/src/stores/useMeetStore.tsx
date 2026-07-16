// useMeetStore.ts
import { create } from "zustand";
import { produce, enableMapSet } from "immer";

// Enable Map/Set support for Immer
enableMapSet();

// Import events


import type { MeetStore, MeetData } from "@/types/meet";
import events from "@/data/events.json";


export const useMeetStore = create<MeetStore>((set) => ({

  meetData: {} as MeetData, // Initialize with empty object cast to MeetData type
  // Initialize deleted data as a Map with String keys and Set<string> values


  deletedData: new Map<string, Set<string>>([
    ["swimmer", new Set<string>()],
    ["event", new Set<string>()],
    ["day", new Set<string>()]
    ]),

  // Set the meet data from the example JSON
  setMeetData: (data) => {
    set(
      produce((state: MeetStore) => {
        state.meetData = data;
        })
    );
  },

  // Update the meet title
  updateTitle: (title: string) =>
    set(
      produce((state: MeetStore) => {
        state.meetData.title = title;
      })
    ),

  updateEntriesCloseDate: (date: string) =>
    set(
      produce((state: MeetStore) => {
        state.meetData.entriesCloseDate = date;
      })
    ),

  updateStartDate: (date: string) =>
    set(
      produce((state: MeetStore) => {
        state.meetData.startDate = date;
      })
    ),

  // Update the meet type (distance)
  updateDistance: (distance: string) =>
    set(
      produce((state: MeetStore) => {

        if(state.meetData.type !== distance){
          if(state.meetData.type === 'lcm' && distance === 'scm'){
            console.log("add 100IM")
          } else if(state.meetData.type === 'scm' && distance === 'lcm'){
            console.log("remove 100IM")
          } else{
            console.log("remove it all");
          }

        }



      })
    ),
  
  // Update the gender type of the meet
  updateGender: (gender: string) =>
    set(
      produce((state: MeetStore) => {
        
        state.meetData.gender = gender;
        if(gender !== 'c'){
          const remove = gender === 'w' ? 'mens' : 'womens';
          const get = gender === 'w' ? 'womens' : 'mens';
          type EventsKey = keyof typeof events;
          const removeKey = (remove + state.meetData.type) as EventsKey;
          const getKey = (get + state.meetData.type) as EventsKey;
          const removeEvents = new Set(Object.keys(events[removeKey]));
          // Call the helper function

          state.meetData.allEvents = new Map(
          Object.keys(events[getKey]).map((eventTitle) => [eventTitle, true])
          );

          removeEvents.forEach((eventTitle: string) => {
          if (state.meetData.allEvents.has(eventTitle)) {
            state.meetData.allEvents.delete(eventTitle);
          }
        });

        // Remove matching events from each day
        state.meetData.days.forEach((day,dayIndex) => {
            for (let eventIndex = day.events.length - 1; eventIndex >= 0; eventIndex--) {
            if (removeEvents.has(day.events[eventIndex].title)) {
              
              state.meetData.days[dayIndex].events.splice(eventIndex, 1);
            }
            }
        });
        }
          
      })
    ),
  // Update the title of a given day
  updateDayTitle: (dayIndex: number, title: string) =>
    set(
      produce((state: MeetStore) => {
        state.meetData.daysTitle[dayIndex] = title;
      })
    ),

  // Define EventsKey type as the keys of the events object
  updateAllEvents: (eventsName: keyof typeof events) =>
    set(
      produce((state: MeetStore) => {
        // Implementation for updating all events
        state.meetData.allEvents = new Map(
          Object.keys(events[eventsName]).map((eventTitle) => [eventTitle, false])
        );
      })
    ),
  deletion: (type: string, id: string) => set(
    produce((state: MeetStore) => {
      if (id !== "-1") {
        state.deletedData.get(type)!.add(id);
      }
    })
  ),
  deleteDayEvent: (dayIndex: number, eventIndex: number, eventTitle: string) =>
    set(
      produce((state: MeetStore) => {
        state.meetData.days[dayIndex].events.splice(eventIndex, 1);

        const allEventsMap = state.meetData.allEvents as Map<string, boolean>;
        allEventsMap.set(eventTitle, true);
      })
    ),
  deleteDay: (dayIndex: number) =>
    set(
      produce((state: MeetStore) => {
        const allEventsMap = state.meetData.allEvents as Map<string, boolean>;
        for (let i = 0; i < state.meetData.days[dayIndex].events.length; i++) {
          const eventTitle = state.meetData.days[dayIndex].events[i].title;

           allEventsMap.set(eventTitle, false);
          }
        state.meetData.days.splice(dayIndex, 1);
      
      })
    ),

  addDay: () => 
    set(
      produce((state: MeetStore) => {
        state.meetData.days.push({ id: "-1", title: "", events: [] });
      })
    ),

  addSwimmer: (dayIndex: number, eventIndex: number) =>
    set(
      produce((state: MeetStore) => {
        state.meetData.days[dayIndex].events[eventIndex].swimmers.push({ id: "-1", name: "", time: "" });
      })
    ),

  updateSwimmerName: (dayIndex: number, eventIndex: number, swimmerIndex: number, name: string) =>
    set(
      produce((state: MeetStore) => {
        state.meetData.days[dayIndex].events[eventIndex].swimmers[swimmerIndex].name = name;
      })
    ),
  updateSwimmerTime: (dayIndex: number, eventIndex: number, swimmerIndex: number, time: string) =>
    set(
      produce((state: MeetStore) => {
        state.meetData.days[dayIndex].events[eventIndex].swimmers[swimmerIndex].time = time;
      })
    ),
  deleteSwimmer: (dayIndex: number, eventIndex: number, swimmerIndex: number) =>
    set(
      produce((state: MeetStore) => {
        state.meetData.days[dayIndex].events[eventIndex].swimmers.splice(swimmerIndex, 1);
      })
    ),
  sortSwimmersByTime: (dayIndex: number, eventIndex: number) => {
    set(
      produce((state: MeetStore) => {
        state.meetData.days[dayIndex].events[eventIndex].swimmers.sort((a, b) => {
          const cleanTime = (time: string) => {
            const cleaned = time.replace(/[^0-9.]/g, "");
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? Infinity : Math.floor(parsed);
          };
          const timeA = cleanTime(a.time);
          const timeB = cleanTime(b.time);
          return timeA - timeB;
        });
      })
    );
  },


  updateDayEventAndAllEvents: (dayIndex: number, eventTitle: string) =>
    set(
      produce((state: MeetStore) => {
        const newEvent = { id: '-1', title: eventTitle, swimmers: [] };
        state.meetData.days[dayIndex].events.push(newEvent);
        state.meetData.allEvents.set(eventTitle, false);
      })
    ),

}));