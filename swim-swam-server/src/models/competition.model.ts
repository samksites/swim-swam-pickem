// Data model for competition data
export interface Swimmer {
  name: string;
  time: string;
}

export interface Event {
  title: string;
  swimmers: Swimmer[];
}

export interface Day {
  title: string;
  order: number;
  events: Event[];
}

export interface CompetitionData {
  id: string;
  eventName: string;
  type: string;
  eventsOpen: string;
  status: number;
  startDate: string;
  gender: string;
  seedTimes: boolean;
  days: Day[];
}
