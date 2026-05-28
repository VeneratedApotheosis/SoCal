import { differenceInMinutes, getHours, getMinutes, parseISO } from 'date-fns';
import { EVENT_GAP } from './constants';
import { EventObj, calendarObj, sharedObj } from './types';

export function createEventObj(data: Partial<EventObj>): EventObj {
  return {
    id: data.id ?? '',
    title: data.title ?? '',
    description: data.description ?? '',
    location: data.location ?? '',
    organizer: data.organizer ?? '',
    allDay: data.allDay ?? false,
    startDate: data.startDate ?? new Date(),
    endDate: data.endDate ?? new Date(),
    eventType: data.eventType ?? 'default',
    sequence: data.sequence ?? 0,
    reminders: data.reminders ?? { useDefault: true },
    calendarId: data.calendarId ?? '',
    calendar: data.calendar ?? ({} as calendarObj),
    ...data,
  };
}

export const convertToGoogleEvent = (eventObj: EventObj) => {
  const formatAllDay = (date: Date) => date.toISOString().split('T')[0];

  return {
    summary: eventObj.title,
    description: eventObj.description,
    location: eventObj.location,
    eventType: eventObj.eventType !== 'default' ? eventObj.eventType : undefined,
    start: eventObj.allDay
      ? { date: formatAllDay(eventObj.startDate), dateTime: null }
      : { date: null, dateTime: new Date(eventObj.startDate).toISOString() },
    end: eventObj.allDay
      ? { date: formatAllDay(eventObj.endDate), dateTime: null }
      : { date: null, dateTime: new Date(eventObj.startDate).toISOString() },
    ...(eventObj.recurrence && { recurrence: eventObj.recurrence }),
    sequence: eventObj.sequence,
    reminders: eventObj.reminders,
  };
};

// Parses a date string as LOCAL midnight instead of UTC midnight.
// parseISO("2026-05-27") → UTC midnight → shifts to prev day in negative-offset timezones.
// This fix ensures all-day event dates stay on the correct calendar day regardless of timezone.
function parseDateString(dateStr: string, isAllDay: boolean): Date {
  if (isAllDay) {
    // "2026-05-27" → local midnight: new Date(2026, 4, 27, 0, 0, 0)
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }
  return parseISO(dateStr);
}

export const processEvent = (item: any, owner: string, calendarObj: calendarObj, calendarId: string): EventObj | null => {
  try {
    if (!item || !item.organizer?.email || !item.summary) {
      return null;
    }

    const startDateString = item.start.dateTime || item.start.date;
    const endDateString = item.end.dateTime || item.end.date;
    if (!startDateString || !endDateString) {
      return null;
    }

    const isAllday = !!item.start.date && !item.start.dateTime;

    // Fix: all-day date strings are parsed as local midnight, not UTC midnight
    const formattedStart = parseDateString(startDateString, isAllday);
    const formattedEnd = parseDateString(endDateString, isAllday);

    const formattedDescription = item.description ?? '';

    return {
      id: item.id,
      title: item.summary,
      description: formattedDescription,
      location: item.location ?? '',
      organizer: owner,
      allDay: isAllday,
      startDate: formattedStart,
      endDate: formattedEnd,
      eventType: item.eventType ?? 'default',
      recurrence: item.recurrence ?? null,
      recurringEventId: item.recurringEventId ?? null,
      sequence: item.sequence ?? 0,
      reminders: {
        useDefault: item.reminders?.useDefault ?? true,
        overrides: item.reminders?.overrides ?? [],
      },
      calendar: calendarObj,
      calendarId: calendarId,
    };
  } catch (error) {
    console.warn('Failed to process event: ', item?.id, error);
    return null;
  }
};

export const processCalendar = (calendar: any[], calendarId: string, owner: string, calendarObj: calendarObj): EventObj[] => {
  if (!calendar || !Array.isArray(calendar)) {
    return [];
  }

  return calendar
    .filter((item: any) => {
      const status = item.status?.toLowerCase().trim();
      return status !== 'cancelled';
    })
    .map((item: any) => processEvent(item, owner, calendarObj, calendarId))
    .filter((event: any): event is EventObj => event !== null)
    .sort(compareEvents);
};

export const processSharedCalendar = (item: sharedObj, userEmail: string): sharedObj => {
  return {} as sharedObj;
};

export const compareEvents = (a: EventObj, b: EventObj): number => {
  const startDiff = a.startDate.getTime() - b.startDate.getTime();
  if (startDiff !== 0) return startDiff;
  const endDiff = a.endDate.getTime() - b.endDate.getTime();
  if (endDiff !== 0) return endDiff;
  return a.id.localeCompare(b.id);
};

export const getEventLayout = (
  event: EventObj,
  offset: number,
  maxOffset: number,
  hourHeight: number,
  dayWidth: number,
  columnWidth: number,
) => {
  const startHour = getHours(event.startDate);
  const startMin = getMinutes(event.startDate);
  const durationInMinutes = differenceInMinutes(event.endDate, event.startDate);

  const pixelsPerMinute = hourHeight / 60;
  const minutesFromMidnight = startHour * 60 + startMin;
  const minimumHeight = pixelsPerMinute * 30;

  let left = ((dayWidth - EVENT_GAP) / (maxOffset + 1)) * offset;
  let width = ((dayWidth - EVENT_GAP) / (maxOffset + 1)) * (maxOffset - offset + 1);

  return {
    top: minutesFromMidnight * pixelsPerMinute,
    height: Math.max(durationInMinutes * pixelsPerMinute, minimumHeight),
    left: left,
    width: width,
  };
};

//creates the time display for event details
export const getEventTimeDisplay = (event: EventObj) => {
  if (!event || !event.startDate || !event.endDate) {
    return { startTime: '', endTime: '', duration: '' };
  }

  let startTime = '';
  let endTime = '';
  let duration = '';
  let startDate = '';
  let endDate = '';

  const start: Date = new Date(event.startDate);
  const end: Date = new Date(event.endDate);

  if (event.allDay) {
    const startMonth = start.toLocaleString('default', { month: 'short' });
    startTime = `${startMonth} ${start.getDate()}`;

    const endMonth = end.toLocaleString('default', { month: 'short' });
    endTime = `${endMonth} ${end.getDate()}`;

    // Google all-day end dates are exclusive (day after last day) — subtract 1 before diffing
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffInDays = Math.round((end.getTime() - start.getTime()) / msPerDay);
    // diffInDays is already the correct count because end is exclusive:
    // start=May27, end=May28 → diff=1 → "1 day" ✓
    // start=May27, end=May29 → diff=2 → "2 days" ✓
    const totalDays = Math.max(diffInDays, 1);
    duration = `${totalDays} ${totalDays === 1 ? 'day' : 'days'}`;
  } else {
    const formatTime = (date: Date) => {
      let hours = date.getHours();
      const AMvsPM = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes} ${AMvsPM}`;
    };

    startTime = formatTime(start);
    endTime = formatTime(end);

    const startMonth = start.toLocaleString('default', { month: 'short' });
    startDate = `${startMonth} ${start.getDate()}`;

    const endMonth = end.toLocaleString('default', { month: 'short' });
    endDate = `${endMonth} ${end.getDate()}`;

    let diffInMs = end.getTime() - start.getTime();
    if (diffInMs < 0) diffInMs += 24 * 60 * 60 * 1000; // overnight
    const totalMinutes = Math.floor(diffInMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    duration = `${hours}:${minutes.toString().padStart(2, '0')}`;
  }

  return { startTime, endTime, duration, startDate, endDate };
};

// Helper: Converts Hex to HSV
const hexToHSV = (hex: string) => {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let d = max - min;
  let h = 0;
  let s = max === 0 ? 0 : (d / max) * 100;
  let v = max * 100;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s, v };
};

// Helper: Converts HSV to Hex
const hsvToHex = (h: number, s: number, v: number): string => {
  s /= 100;
  v /= 100;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r = 0,
    g = 0,
    b = 0;
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  const toHex = (n: number) =>
    Math.round(n * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const lightenColor = (hex: string, type: string): string => {
  let saturationPercentChange = 0;
  let valuePercentChange = 0;

  if (type === 'border') {
    saturationPercentChange = 50;
    valuePercentChange = 20;
  } else if (type === 'text') {
    saturationPercentChange = 40;
    valuePercentChange = -50;
  } else return hex;

  let { h, s, v } = hexToHSV(hex);
  const isGreen = h >= 80 && h <= 150;

  if (isGreen && type == 'border') {
    if (s != 0) {
      s = Math.min(100, s + saturationPercentChange);
      v = Math.min(100, v + valuePercentChange - 40);
    } else {
      v = Math.min(100, v + valuePercentChange - 40);
    }
  } else {
    if (s != 0) {
      s = Math.min(100, s + saturationPercentChange);
      v = Math.min(100, v + valuePercentChange);
    } else {
      v = Math.min(100, v + valuePercentChange - 40);
    }
  }

  return hsvToHex(h, s, v);
};
