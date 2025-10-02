import exampleSwimMeet from "../data/exampleSwimMeet.json";

export type Swimmer = {
  name: string;
  time: string;
  // add other swimmer properties as needed
};

export type EventList = {
  "name": string;
  "used": boolean;
}

export type Event = {
  title: string;
  swimmers: Swimmer[];
  swimmerCount?: number;
  dayNumber?: number; // Which day the event is
  index?: number; // what order the event is in
  numberOfEvents?: number; // optional number of events for the day
  clickEvent?: (day: number, event: number) => void;
  moveEvent?: (index: number, direction: 'up' | 'down') => void; // function to move the event up or down
  // add other event properties as needed

};

export type Day = {
  events: Event[];
  title: string;
  // add other day properties as needed
};

export type MeetData = {
  id: string;
  daysTitle: string[];
  days: Day[];
  entriesCloseDate: string;
  startDate: string;
  title: string;
  status: number;
  gender: string;
  type: string;
  seedTimes: boolean;
  allEvents: EventList[];
  // add other meet properties as needed
};

export type MeetStore = {
    meetData: typeof exampleSwimMeet;
    setMeetData: (data: typeof exampleSwimMeet) => void;
    updateTitle: (title: string) => void;
    updateDistance: (distance: string) => void;
    updateGender: (gender: string) => void;
    updateDayEventAndAllEvents: (dayIndex: number, eventTitle: string) => void;
    deleteDayEvent: (dayIndex: number, eventIndex: number, eventTitle: string) => void;
    updateDayTitle: (dayIndex: number, title: string) => void;
    deleteDay: (dayIndex: number) => void;
    addSwimmer: (dayIndex: number, eventIndex: number) => void;
    updateSwimmerName: (dayIndex: number, eventIndex: number, swimmerIndex: number, name: string) => void;
    updateSwimmerTime: (dayIndex: number, eventIndex: number, swimmerIndex: number, time: string) => void;
    sortSwimmersByTime: (dayIndex: number, eventIndex: number) => void;
    deleteSwimmer: (dayIndex: number, eventIndex: number, swimmerIndex: number) => void;
};


export type SwimmersCardProps = {
    swimmers?: Array<string>;
    dayIndex?: number;
    eventIndex?: number;
}

export type EditCompetitionCardProps =  {
    status?: number;
    dates?: Array<Array<string>>;
    editable?: boolean;
    
}

export type EventCompetitionCardProps =  {
    status?: number;
    index?: number;
    clickEvent?: (day: number, event: number) => void;
    handleAddEvent?: (toggle: boolean, index: number) => void;

}

export type CardProps = (EditCompetitionCardProps & EventCompetitionCardProps & SwimmersCardProps) & {
    title: string;
    type: 'editPage' | 'eventPage' | 'swimmers';
    index?: number;
    clickEvent?: (day: number, event: number) => void;
};
