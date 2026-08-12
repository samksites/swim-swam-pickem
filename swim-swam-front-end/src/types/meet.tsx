import events from "@/data/events.json";

export type Swimmer = {
  id: string;
  name: string;
  time: string;
  // add other swimmer properties as needed
};


export type EventList = {
  name: string;
  used: boolean;
}

export type Event = {
  id: string;
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
  id: string;
  events: Event[];
  title: string;
};

export type LoadedData = {
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
  allEvents: Record<string, boolean>;
  

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
  allEvents: Map<string, boolean>;
};

export type TestMeetData = {
  allEvents: Map<string, boolean>;
};

export type MeetStore = {
    meetData: MeetData
    deletedData: Map<string, Set<string>>;
    setMeetData: (data: MeetData) => void;
    updateTitle: (title: string) => void;
  updateEntriesCloseDate: (date: string) => void;
  updateStartDate: (date: string) => void;
    updateDistance: (distance: string) => void;
    updateGender: (gender: string) => void;
    updateDayEventAndAllEvents: (dayIndex: number, eventTitle: string) => void;
    updateAllEvents: (eventsName: keyof typeof events) => void;
    deletion: (type: string, id: string) => void;
    deleteDayEvent: (dayIndex: number, eventIndex: number, eventTitle: string) => void;
    updateDayTitle: (dayIndex: number, title: string) => void;
    deleteDay: (dayIndex: number) => void;
    addSwimmer: (dayIndex: number, eventIndex: number) => void;
    addDay: () => void;
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
  onEditClick?: () => void;
    
}

export type EventCompetitionCardProps =  {
    status?: number;
    index?: number;
    clickEvent?: (day: number, event: number) => void;
    handleAddEvent?: (toggle: boolean, index: number) => void;

}

export type CardProps = (EditCompetitionCardProps & EventCompetitionCardProps & SwimmersCardProps) & {
    id?: string;
    title: string;
    type: 'editPage' | 'eventPage' | 'swimmers';
    index?: number;
    clickEvent?: (day: number, event: number) => void;
  onEditCompetition?: (competitionId: string) => void;
};
