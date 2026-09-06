import { calendarGroup, calendarObj, ProfileObj, sharedObj } from './types';

export const demoCalendars: calendarObj[] = [
  {
    calendarName: "Josh's Classes",
    calendarId: 'demo-jordan-schedule@group.calendar.google.com',
    calendarDefaultColor: '#b3dc6c',
    owner: false,
    dataOwner: 'jordan@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default',
    accessRole: 'writer',
  },
  {
    calendarName: 'taylor@example.com',
    calendarId: 'taylor@example.com',
    calendarDefaultColor: '#a31111',
    owner: false,
    dataOwner: 'taylor@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default',
    accessRole: 'writer',
  },
  {
    calendarName: 'Schedule, Taylor',
    calendarId: 'demo-taylor-schedule@group.calendar.google.com',
    calendarDefaultColor: '#9a9cff',
    owner: false,
    dataOwner: 'taylor@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default',
    accessRole: 'writer',
  },
  {
    calendarName: 'Jordan Clubs',
    calendarId: 'demo-jordan-clubs@group.calendar.google.com',
    calendarDefaultColor: '#4986e7',
    owner: true,
    dataOwner: 'jordan@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default',
    accessRole: 'owner',
  },
  {
    calendarName: 'jordan@example.com',
    calendarId: 'jordan@example.com',
    calendarDefaultColor: '#9fe1e7',
    owner: true,
    dataOwner: 'jordan@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default',
    accessRole: 'owner',
  },
  {
    calendarName: 'Schedule, Jordan',
    calendarId: 'demo-jordan-personal-schedule@group.calendar.google.com',
    calendarDefaultColor: '#16a765',
    owner: true,
    dataOwner: 'jordan@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default',
    accessRole: 'owner',
  },
  {
    calendarName: 'Finals, Jordan',
    calendarId: 'demo-jordan-finals@group.calendar.google.com',
    calendarDefaultColor: '#cca6ac',
    owner: true,
    dataOwner: 'jordan@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default',
    accessRole: 'owner',
  },
  {
    calendarName: 'Class Work',
    calendarId: 'demo-class-work@group.calendar.google.com',
    calendarDefaultColor: '#ff7537',
    owner: true,
    dataOwner: 'jordan@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default',
    accessRole: 'owner',
  },
  {
    calendarName: "Taylor's Events",
    calendarId: 'taylor-events@example.com',
    calendarDefaultColor: '#ac725e',
    owner: false,
    dataOwner: 'taylor@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default',
    accessRole: 'reader',
  },
  {
    calendarName: 'University Schedule',
    calendarId: 'demo-university-schedule@group.calendar.google.com',
    calendarDefaultColor: '#7bd148',
    owner: false,
    dataOwner: 'Other',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default',
    accessRole: 'reader',
  },
  {
    calendarName: 'Work & Clubs',
    calendarId: 'demo-work-clubs@group.calendar.google.com',
    calendarDefaultColor: '#f83a22',
    owner: false,
    dataOwner: 'Other',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default',
    accessRole: 'reader',
  },
  {
    calendarName: 'alexander@example.com',
    calendarId: 'alexander@example.com',
    calendarDefaultColor: '#cd74e6',
    owner: false,
    dataOwner: 'alexander@example.com',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default',
    accessRole: 'writer',
  },
  {
    calendarName: 'Formula Racing',
    calendarId: 'demo-formula-racing@group.calendar.google.com',
    calendarDefaultColor: '#a47ae2',
    owner: false,
    dataOwner: 'Other',
    shown: {
      displayed: true,
      suppressed: false,
    },
    visibility: 'default',
    accessRole: 'reader',
  },
];

export const sharedCalendars: sharedObj[] = [
  {
    id: 'demo-jordan-clubs@group.calendar.google.com',
    name: 'Jordan Clubs',
    sharedIds: [
      {
        id: 'demo-jordan-clubs@group.calendar.google.com',
        accessRole: 'owner',
      },
      {
        id: 'jordan@example.com',
        accessRole: 'owner',
      },
      {
        id: 'example.com',
        accessRole: 'freeBusyReader',
      },
      {
        id: 'taylor@example.com',
        accessRole: 'reader',
      },
      {
        id: 'alexander@example.com',
        accessRole: 'reader',
      },
    ],
  },

  {
    id: 'jordan@example.com',
    name: 'jordan@example.com',
    sharedIds: [
      {
        id: 'jordan@example.com',
        accessRole: 'owner',
      },
      {
        id: 'example.com',
        accessRole: 'freeBusyReader',
      },
      {
        id: 'taylor@example.com',
        accessRole: 'reader',
      },
      {
        id: 'alexander@example.com',
        accessRole: 'writer',
      },
    ],
  },

  {
    id: 'demo-jordan-personal-schedule@group.calendar.google.com',
    name: 'Schedule, Jordan',
    sharedIds: [
      {
        id: 'demo-jordan-personal-schedule@group.calendar.google.com',
        accessRole: 'owner',
      },
      {
        id: 'jordan@example.com',
        accessRole: 'owner',
      },
      {
        id: 'example.com',
        accessRole: 'freeBusyReader',
      },
      {
        id: 'taylor@example.com',
        accessRole: 'reader',
      },
      {
        id: 'alexander@example.com',
        accessRole: 'writer',
      },
    ],
  },

  {
    id: 'demo-jordan-finals@group.calendar.google.com',
    name: 'Finals, Jordan',
    sharedIds: [
      {
        id: 'demo-jordan-finals@group.calendar.google.com',
        accessRole: 'owner',
      },
      {
        id: 'jordan@example.com',
        accessRole: 'owner',
      },
      {
        id: 'example.com',
        accessRole: 'freeBusyReader',
      },
    ],
  },

  {
    id: 'demo-class-work@group.calendar.google.com',
    name: 'Class Work',
    sharedIds: [
      {
        id: 'demo-class-work@group.calendar.google.com',
        accessRole: 'owner',
      },
      {
        id: 'jordan@example.com',
        accessRole: 'owner',
      },
      {
        id: 'example.com',
        accessRole: 'freeBusyReader',
      },
    ],
  },
];

export const demoCalendarGroups: calendarGroup[] = [
  {
    id: 'owner',
    userId: 'demo-user-1234',
    calendars: [
      {
        calendarName: 'jordan@example.com',
        calendarId: 'jordan@example.com',
        calendarDefaultColor: '#9fe1e7',
        owner: true,
        dataOwner: 'jordan@example.com',
        shown: {
          displayed: true,
          suppressed: false,
        },
        visibility: 'default',
        accessRole: 'owner',
        isActive: true,
      },
      {
        calendarName: 'Schedule, Jordan',
        calendarId: 'demo-jordan-personal-schedule@group.calendar.google.com',
        calendarDefaultColor: '#16a765',
        owner: true,
        dataOwner: 'jordan@example.com',
        shown: {
          displayed: true,
          suppressed: false,
        },
        visibility: 'default',
        accessRole: 'owner',
        isActive: true,
      },
      {
        calendarName: 'Finals, Jordan',
        calendarId: 'demo-jordan-finals@group.calendar.google.com',
        calendarDefaultColor: '#cca6ac',
        owner: true,
        dataOwner: 'jordan@example.com',
        shown: {
          displayed: true,
          suppressed: false,
        },
        visibility: 'default',
        accessRole: 'owner',
        isActive: true,
      },
      {
        calendarName: 'Class Work',
        calendarId: 'demo-class-work@group.calendar.google.com',
        calendarDefaultColor: '#ff7537',
        owner: true,
        dataOwner: 'jordan@example.com',
        shown: {
          displayed: true,
          suppressed: false,
        },
        visibility: 'default',
        accessRole: 'owner',
        isActive: true,
      },
      {
        calendarName: 'Jordan Clubs',
        calendarId: 'demo-jordan-clubs@group.calendar.google.com',
        calendarDefaultColor: '#4986e7',
        owner: true,
        dataOwner: 'jordan@example.com',
        shown: {
          displayed: true,
          suppressed: false,
        },
        visibility: 'default',
        accessRole: 'owner',
        isActive: true,
      },
    ],
  },

  {
    id: 'other',
    userId: 'demo-user-1234',
    calendars: [
      {
        calendarName: 'Schedule, Taylor',
        calendarId: 'demo-taylor-schedule@group.calendar.google.com',
        calendarDefaultColor: '#b3dc6c',
        owner: false,
        dataOwner: 'taylor@example.com',
        shown: {
          displayed: true,
          suppressed: false,
        },
        visibility: 'default',
        accessRole: 'writer',
        isActive: true,
      },
      {
        calendarName: "Taylor's Events",
        calendarId: 'taylor-events@example.com',
        calendarDefaultColor: '#ac725e',
        owner: false,
        dataOwner: 'taylor@example.com',
        shown: {
          displayed: true,
          suppressed: false,
        },
        visibility: 'default',
        accessRole: 'reader',
        isActive: true,
      },
      {
        calendarName: 'Work & Clubs',
        calendarId: 'demo-work-clubs@group.calendar.google.com',
        calendarDefaultColor: '#f83a22',
        owner: false,
        dataOwner: 'Other',
        shown: {
          displayed: true,
          suppressed: false,
        },
        visibility: 'default',
        accessRole: 'reader',
        isActive: true,
      },
    ],
  },

  {
    id: 'Taylor',
    userId: 'demo-user-1234',
    calendars: [
      {
        calendarName: 'Schedule, Taylor',
        calendarId: 'demo-taylor-schedule@group.calendar.google.com',
        calendarDefaultColor: '#9a9cff',
        owner: false,
        dataOwner: 'taylor@example.com',
        shown: {
          displayed: true,
          suppressed: false,
        },
        visibility: 'default',
        accessRole: 'writer',
        isActive: true,
      },
      {
        calendarName: 'taylor@example.com',
        calendarId: 'taylor@example.com',
        calendarDefaultColor: '#c2c2c2',
        owner: false,
        dataOwner: 'taylor@example.com',
        shown: {
          displayed: true,
          suppressed: false,
        },
        visibility: 'default',
        accessRole: 'writer',
        isActive: true,
      },
    ],
  },

  {
    id: 'Other',
    userId: 'demo-user-1234',
    calendars: [
      {
        calendarName: 'Formula Racing',
        calendarId: 'demo-formula-racing@group.calendar.google.com',
        calendarDefaultColor: '#a47ae2',
        owner: false,
        dataOwner: 'Other',
        shown: {
          displayed: true,
          suppressed: false,
        },
        visibility: 'default',
        accessRole: 'reader',
        isActive: true,
      },
      {
        calendarName: 'alexander@example.com',
        calendarId: 'alexander@example.com',
        calendarDefaultColor: '#cd74e6',
        owner: false,
        dataOwner: 'alexander@example.com',
        shown: {
          displayed: true,
          suppressed: false,
        },
        visibility: 'default',
        accessRole: 'writer',
        isActive: true,
      },
      {
        calendarName: 'University Schedule',
        calendarId: 'demo-university-schedule@group.calendar.google.com',
        calendarDefaultColor: '#7bd148',
        owner: false,
        dataOwner: 'Other',
        shown: {
          displayed: true,
          suppressed: false,
        },
        visibility: 'default',
        accessRole: 'reader',
        isActive: true,
      },
    ],
  },
];

export const demoProfile: ProfileObj = {
  id: 'demo-user-1234',
  email: 'jordan@example.com',
  name: 'Jordan Lee',
  picture: 'https://i.pravatar.cc/150?img=12',
};
