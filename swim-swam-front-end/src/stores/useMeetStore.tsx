// useMeetStore.ts
import { create } from "zustand";
import { produce } from "immer";
import meetJson from "../data/exampleSwimMeet.json";

import type { MeetStore, MeetData } from "@/types/meet";


export const useMeetStore = create<MeetStore>((set) => ({
    meetData: meetJson as MeetData, // Initialize with data from meetJson

    // Set the meet data from the example JSON
    setMeetData: (data) => {
        set({ meetData: data });
    },

    // Update the meet title
    updateTitle: (title: string) =>
        set(
            produce((state: MeetStore) => {
                state.meetData.title = title;
            })
        ),

    // Update the meet type (distance)
    updateDistance: (distance: string) =>
        set(
            produce((state: MeetStore) => {
                state.meetData.type = distance;
            })
        ),
    
    // Update the gender type of the meet
    updateGender: (gender: string) =>
        set(
            produce((state: MeetStore) => {
                state.meetData.gender = gender;
            })
        ),
    // Update the title of a given day
    updateDayTitle: (dayIndex: number, title: string) =>
        set(
            produce((state: MeetStore) => {
                state.meetData.daysTitle[dayIndex] = title;
            })
        ),

    // Update the events for a specific day and mark the event as used in allEvents
    updateDayEventAndAllEvents: (dayIndex: number, eventTitle:string) =>
        set(
            produce((state: MeetStore) => {
                const newEvent = {"title": eventTitle, "swimmers":[]}
                state.meetData.days[dayIndex].events.push(newEvent);
                
                for (let i = 0; i < state.meetData.allEvents.length; i++) {
                    if (state.meetData.allEvents[i].name === eventTitle) {
                        
                        state.meetData.allEvents[i].used = true;
                    }
                }
            })
        ),
    deleteDayEvent: (dayIndex: number, eventIndex: number, eventTitle: string) =>
        set(
            produce((state: MeetStore) => {
                state.meetData.days[dayIndex].events.splice(eventIndex, 1);
                 for (let i = 0; i < state.meetData.allEvents.length; i++) {
                    if (state.meetData.allEvents[i].name === eventTitle) {
                        state.meetData.allEvents[i].used = false;
                    }
                 }
            })
        ),
    deleteDay: (dayIndex: number) =>
        set(
            produce((state: MeetStore) => {
                for (let i = 0; i < state.meetData.days[dayIndex].events.length; i++) {
                    const eventTitle = state.meetData.days[dayIndex].events[i].title;
                    for (let j = 0; j < state.meetData.allEvents.length; j++) {
                        if (state.meetData.allEvents[j].name === eventTitle) {
                            state.meetData.allEvents[j].used = false;
                        }
                    }
                }
                state.meetData.days.splice(dayIndex, 1);
            
            })
        ),

    addSwimmer: (dayIndex: number, eventIndex: number) =>
        set(
            produce((state: MeetStore) => {
                state.meetData.days[dayIndex].events[eventIndex].swimmers.push({ name: "", time: "" });
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
    }

}));