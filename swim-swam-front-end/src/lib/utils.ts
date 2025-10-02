import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge";
import type {  MeetData } from "@/types/meet";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const checkCompetitionForSubmit = (swimMeet: MeetData) => {
  // Placeholder function to check if the competition is ready to be submitted
  // Implement actual validation logic as needed

  let errorMessage = 'Good';

  if (swimMeet.title !== "" || swimMeet.type !== "" || swimMeet.gender !== "" || swimMeet.startDate !== "" || swimMeet.entriesCloseDate !== "") {

    if(swimMeet.title === "") {
      errorMessage = 'Title is required.';
    } else if(swimMeet.type === "") {
      errorMessage = 'Type is required.';
    } else if(swimMeet.gender === "") {
      errorMessage = 'Gender is required.';
    } else if(swimMeet.startDate === "") {
      errorMessage = 'Start date is required.';
    } else if(swimMeet.entriesCloseDate === "") {
      errorMessage = 'Entries close date is required.';
    }
    else {
      for (let i = 0; i < swimMeet.days.length; i++) {
        if (swimMeet.days[i].events.length === 0) {
          errorMessage = `Day ${i + 1} has no events.`;
          break;
        } else {
          for (let j = 0; j < swimMeet.days[i].events.length; j++) {
            if (swimMeet.days[i].events[j].swimmers.length === 0) {
              errorMessage = `Event "${swimMeet.days[i].events[j].title}" on Day ${i + 1} has no swimmers.`;
              break;
            }
          }
        }
        if (errorMessage !== '') break;
      }
    }

    return { valid: false, message: errorMessage };
  }

  return { valid: true, message: errorMessage };
};

export default checkCompetitionForSubmit;
