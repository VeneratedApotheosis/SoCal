import { DEFAULT_COLORS } from './constants';
import { accessRole, calendarGroup, calendarObj, ProfileObj, sharedObj, visibility } from './types';

export const demoCalendars = [
  {
    calendarName: 'joe@example.com',
    calendarId: 'joe@example.com',
    calendarDefaultColor: DEFAULT_COLORS[0],
    owner: true,
    dataOwner: 'joe@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default' as visibility,
    accessRole: 'writer' as accessRole,
    isActive: true,
  },
  {
    calendarName: "Joe's Work",
    calendarId: 'demo-joe-schedule-1@example.com',
    calendarDefaultColor: DEFAULT_COLORS[1],
    owner: true,
    dataOwner: 'joe@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default' as visibility,
    accessRole: 'writer' as accessRole,
    isActive: true,
  },
  {
    calendarName: 'Gym, Joe',
    calendarId: 'demo-joe-schedule-2@example.com',
    calendarDefaultColor: DEFAULT_COLORS[2],
    owner: true,
    dataOwner: 'joe@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default' as visibility,
    accessRole: 'writer' as accessRole,
    isActive: true,
  },
  {
    calendarName: 'Meetings, Joe',
    calendarId: 'demo-joe-schedule-3@example.com',
    calendarDefaultColor: DEFAULT_COLORS[3],
    owner: true,
    dataOwner: 'joe@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default' as visibility,
    accessRole: 'writer' as accessRole,
    isActive: true,
  },
  {
    calendarName: 'james1234567891011121314151617181920@gmail.com',
    calendarId: 'james1234567891011121314151617181920@example.com',
    calendarDefaultColor: DEFAULT_COLORS[4],
    owner: false,
    dataOwner: 'james1234567891011121314151617181920@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default' as visibility,
    accessRole: 'writer' as accessRole,
    isActive: true,
  },
  {
    calendarName: 'Classes, James',
    calendarId: 'james1234567891011121314151617181920-1@example.com',
    calendarDefaultColor: DEFAULT_COLORS[5],
    owner: false,
    dataOwner: 'james1234567891011121314151617181920@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default' as visibility,
    accessRole: 'reader' as accessRole,
    isActive: true,
  },
  {
    calendarName: 'James Goes Running',
    calendarId: 'james1234567891011121314151617181920-2@example.com',
    calendarDefaultColor: DEFAULT_COLORS[6],
    owner: false,
    dataOwner: 'james1234567891011121314151617181920@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default' as visibility,
    accessRole: 'reader' as accessRole,
    isActive: true,
  },
  {
    calendarName: "John's Fun Events",
    calendarId: 'johnjohnjohn34@example.com',
    calendarDefaultColor: DEFAULT_COLORS[7],
    owner: false,
    dataOwner: 'johnjohnjohn34@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default' as visibility,
    accessRole: 'reader' as accessRole,
    isActive: true,
  },
  {
    calendarName: "John's Part Time Job",
    calendarId: 'johnjohnjohn34-1@example.com',
    calendarDefaultColor: DEFAULT_COLORS[8],
    owner: false,
    dataOwner: 'johnjohnjohn34@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default' as visibility,
    accessRole: 'reader' as accessRole,
    isActive: true,
  },
  {
    calendarName: 'Gambling',
    calendarId: 'johnjohnjohn34-2@example.com',
    calendarDefaultColor: DEFAULT_COLORS[9],
    owner: false,
    dataOwner: 'johnjohnjohn34@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default' as visibility,
    accessRole: 'reader' as accessRole,
    isActive: true,
  },
  {
    calendarName: 'RunClubLA123456790@gmail.com',
    calendarId: 'RunClubLA123456790@example.com',
    calendarDefaultColor: DEFAULT_COLORS[10],
    owner: false,
    dataOwner: 'RunClubLA123456790@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default' as visibility,
    accessRole: 'reader' as accessRole,
    isActive: true,
  },
  {
    calendarName: 'alt.joe@gmail.com',
    calendarId: 'alt.joe@example.com',
    calendarDefaultColor: DEFAULT_COLORS[11],
    owner: false,
    dataOwner: 'alt.joe@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default' as visibility,
    accessRole: 'writer' as accessRole,
    isActive: true,
  },
  {
    calendarName: 'Peptide Dealer Meetups',
    calendarId: 'alt.joe-1@example.com',
    calendarDefaultColor: DEFAULT_COLORS[12],
    owner: false,
    dataOwner: 'alt.joe@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default' as visibility,
    accessRole: 'writer' as accessRole,
    isActive: true,
  },
];

export const demoCalendarObjs: calendarObj[] = demoCalendars as calendarObj[];
export const demoHiddenCalendars = [demoCalendarObjs[3].calendarId, demoCalendarObjs[8].calendarId, demoCalendarObjs[12].calendarId];

export const sharedCalendars: sharedObj[] = [
  {
    id: 'joe@example.com',
    name: 'joe@example.com',
    sharedIds: [
      {
        id: 'james1234567891011121314151617181920@example.com',
        accessRole: 'reader',
      },
      {
        id: 'alt.joe@example.com',
        accessRole: 'writer',
      },
      {
        id: 'johnjohnjohn34@example.com',
        accessRole: 'reader',
      },
    ],
  },

  {
    id: 'demo-joe-schedule-1@example.com',
    name: "Joe's Work",
    sharedIds: [
      {
        id: 'alt.joe@example.com',
        accessRole: 'writer',
      },
      {
        id: 'johnjohnjohn34@example.com',
        accessRole: 'writer',
      },
    ],
  },

  {
    id: 'demo-joe-schedule-2@example.com',
    name: 'Gym, Joe',
    sharedIds: [
      {
        id: 'james1234567891011121314151617181920@example.com',
        accessRole: 'writer',
      },
      {
        id: 'alt.joe@example.com',
        accessRole: 'writer',
      },
    ],
  },

  {
    id: 'demo-joe-schedule-3@example.com',
    name: 'Meetings, Joe',
    sharedIds: [
      {
        id: 'alt.joe@example.com',
        accessRole: 'writer',
      },
      {
        id: 'joes_coworker@example.com',
        accessRole: 'writer',
      },
    ],
  },
];

export const demoCalendarGroups: calendarGroup[] = [
  {
    id: 'owner',
    userId: 'demo-user-1234',
    calendars: demoCalendars.slice(0, 4),
  },

  {
    id: 'James',
    userId: 'demo-user-1234',
    calendars: demoCalendars.slice(4, 7),
  },

  {
    id: 'John',
    userId: 'demo-user-1234',
    calendars: demoCalendars.slice(7, 10),
  },

  {
    id: 'Other',
    userId: 'demo-user-1234',
    calendars: demoCalendars.slice(10, 14),
  },
];

export const demoProfile: ProfileObj = {
  id: 'joe@example.com',
  email: 'joe@example.com',
  name: 'Demo User',
  picture: 'https://api.dicebear.com/10.x/initials/svg?seed=D&backgroundColor=4f46e5&borderRadius=50',
};
