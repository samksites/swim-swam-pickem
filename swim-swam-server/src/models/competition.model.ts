// Data model for competition data
export interface Competition {
  comp_id: number;
  event_name: string;
  starts_on?: Date | null;
  ends_on?: Date | null;
  meet_type?: string | null;
  swim_events?: string[] | null;
  event_swimmer_names?: string[] | null;
  results?: string[] | null;
}