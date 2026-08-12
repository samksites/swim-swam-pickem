import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge";
import type {  LoadedData, MeetData } from "@/types/meet";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const MS_IN_DAY = 24 * 60 * 60 * 1000;

const parseIsoDateOnly = (value: string): Date | null => {
  const candidate = String(value ?? '').trim();
  const match = candidate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, monthIndex, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== monthIndex ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
};

export const validateCompetitionDates = (
  entriesCloseDate: string,
  startDate: string,
): { valid: boolean; message: string } => {
  const entriesDate = parseIsoDateOnly(entriesCloseDate);
  if (!entriesDate) {
    return { valid: false, message: 'Competition entries close date must be a valid date (YYYY-MM-DD).' };
  }

  const competitionStartDate = parseIsoDateOnly(startDate);
  if (!competitionStartDate) {
    return { valid: false, message: 'Competition start date must be a valid date (YYYY-MM-DD).' };
  }

  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const earliestEntriesDate = new Date(todayUtc.getTime() + MS_IN_DAY);
  const earliestStartDate = new Date(entriesDate.getTime() + MS_IN_DAY);

  if (entriesDate.getTime() < earliestEntriesDate.getTime()) {
    return { valid: false, message: 'Competition entries close date must be at least 1 day from today.' };
  }

  if (competitionStartDate.getTime() < earliestStartDate.getTime()) {
    return { valid: false, message: 'Competition start date must be at least 1 day after entries close date.' };
  }

  return { valid: true, message: '' };
};

const checkCompetitionForSubmit = (swimMeet: MeetData) => {
  let errorMessage = 'Good';

  if (swimMeet.title.trim() === "") {
    errorMessage = 'Title is required.';
    return { valid: false, message: errorMessage };
  }

  if (swimMeet.type.trim() === "") {
    errorMessage = 'Type is required.';
    return { valid: false, message: errorMessage };
  }

  if (swimMeet.gender.trim() === "") {
    errorMessage = 'Gender is required.';
    return { valid: false, message: errorMessage };
  }

  if (swimMeet.startDate.trim() === "") {
    errorMessage = 'Start date is required.';
    return { valid: false, message: errorMessage };
  }

  if (swimMeet.entriesCloseDate.trim() === "") {
    errorMessage = 'Entries close date is required.';
    return { valid: false, message: errorMessage };
  }

  const dateValidation = validateCompetitionDates(swimMeet.entriesCloseDate, swimMeet.startDate);
  if (!dateValidation.valid) {
    return { valid: false, message: dateValidation.message };
  }

  if (swimMeet.days.length === 0) {
    errorMessage = 'Competition must have at least one day.';
    return { valid: false, message: errorMessage };
  }

  for (let i = 0; i < swimMeet.days.length; i++) {
    if (swimMeet.days[i].title.trim() === "") {
      errorMessage = `Day ${i + 1} title is required.`;
      return { valid: false, message: errorMessage };
    }

    if (swimMeet.days[i].events.length === 0) {
      errorMessage = `Day ${i + 1} has no events.`;
      return { valid: false, message: errorMessage };
    }

    for (let j = 0; j < swimMeet.days[i].events.length; j++) {
      if (swimMeet.days[i].events[j].swimmers.length === 0) {
        errorMessage = `Event "${swimMeet.days[i].events[j].title}" on Day ${i + 1} has no swimmers.`;
        return { valid: false, message: errorMessage };
      }
    }
  }

  return { valid: true, message: errorMessage };
};


export const convertMeetData = (meet: LoadedData) => {
  // Implement the conversion logic here
  const mappedValues: Map<string, boolean> = new Map(Object.entries(meet.allEvents));
  const meetData: MeetData = {
    id: meet.id !== '-1' ? meet.id : "-1",
    daysTitle: meet.daysTitle,
    days: meet.days,
    entriesCloseDate: meet.entriesCloseDate,
    startDate: meet.startDate,
    title: meet.title,
    status: meet.status,
    gender: meet.gender,
    type: meet.type,
    seedTimes: meet.seedTimes,
    allEvents: mappedValues
  };
  return meetData;

}


export default checkCompetitionForSubmit;
