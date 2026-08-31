export interface JwtTokenObj {
  sessionToken: string;
  expiryDate: string;
}
export interface ProfileObj {
  id: string;
  email: string;
  name: string;
  picture: string;
}
export interface AccessTokenObj {
  id: string;
  accessToken: string;
  expiryDate: string;
}
export interface FamilyProfileObjs {
  parent: ProfileObj;
  children: ProfileObj[];
}
export interface FamilyAccessTokenObjs {
  parent: AccessTokenObj;
  children: AccessTokenObj[];
}
export type CalendarView = {
  type: 'D' | 'W';
  dayNum: number;
  weekNum: number;
};
export type visibility = 'default' | 'transparent' | 'isolate';
export type shown = {
  displayed: boolean;
  suppressed: boolean;
}; //note, suppressed is the least visible

export type accessRole = 'none' | 'freeBusyReader' | 'reader' | 'writer' | 'owner';

export interface calendarObj {
  calendarName: string;
  calendarId: string;
  calendarDefaultColor: string;
  owner: boolean;
  accessRole: accessRole;
  shown: shown;
  visibility: visibility;
  dataOwner: string;
}

//Processed calendar data
export interface EventObj {
  //event data
  id: string;
  title: string;
  description: string;
  location: string;
  organizer: string;

  allDay: boolean;
  startDate: Date;
  endDate: Date;
  startTimeZone: string;
  endTimeZone: string;

  eventType: string;

  //recurrence
  recurrence?: string[];
  sequence: number;
  reminders: {
    useDefault: boolean;
    overrides?: { method: string; minutes: number }[];
  };
  recurringEventId?: string;

  //calendar data
  calendarId: string;
}

export interface CalendarData {
  id: string;
  owner: string;
  name: string;
  color: string;
  events: EventObj[];
}

export interface sharedObj {
  id: string;
  name: string;
  sharedIds: { id: string; accessRole: string }[];
}

export interface calendarGroup {
  id: string;
  userId: string;
  calendars: GroupedCalendarObj[];
}

export type GroupedCalendarObj = calendarObj & {
  isActive?: boolean;
};

export interface FamilyCalendarState {
  parent: CalendarData[];
  children: CalendarData[];
}

export interface EventWithLayout {
  event: EventObj;
  offset: number;
  maxOffset: number;
  startDate: Date;
  endDate: Date;
  dummy: boolean;
}

export interface colorCache {
  getCalendarColor(calendarId: string): unknown;
  paletteId: number;
  name: string;
  palette: string[];
  colorMap: Record<string, string>;
}

export interface ParsedRRule {
  FREQ?: string;
  INTERVAL: number; // Defaulting to 1 if missing
  COUNT?: number;
  UNTIL?: string;
  BYDAY?: string[];
  BYMONTH?: string[];
  BYYEARDAY?: string[];
  BYHOUR?: string[];
  // Catch-all for any other rules Google might throw at you
  [key: string]: any;
}

export interface AllDayPool {
  isActive: boolean;
  eventId: string;
  name: string;
  color: string;
  offset: number;
  length: number;
}
