import { differenceInMinutes, getHours, getMinutes, parseISO } from 'date-fns';
import { EVENT_GAP } from './constants';
import { EventObj, EventWithLayout, calendarObj } from './types';

export function createEventObj(data: Partial<EventObj>, timeZone: string): EventObj {
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
    endTimeZone: data.endTimeZone ?? timeZone,
    startTimeZone: data.startTimeZone ?? timeZone,
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
      : { date: null, dateTime: new Date(eventObj.startDate).toISOString(), timeZone: eventObj.startTimeZone },
    end: eventObj.allDay
      ? { date: formatAllDay(eventObj.endDate), dateTime: null }
      : { date: null, dateTime: new Date(eventObj.endDate).toISOString(), timeZone: eventObj.endTimeZone },
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

export const processEvent = (item: any, owner: string, calendarId: string): EventObj | null => {
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
      startTimeZone: item.start.timeZone,
      endDate: formattedEnd,
      endTimeZone: item.end.timeZone,
      eventType: item.eventType ?? 'default',
      recurrence: item.recurrence ?? null,
      recurringEventId: item.recurringEventId ?? null,
      sequence: item.sequence ?? 0,
      reminders: {
        useDefault: item.reminders?.useDefault ?? true,
        overrides: item.reminders?.overrides ?? [],
      },
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
    .map((item: any) => processEvent(item, owner, calendarId))
    .filter((event: any): event is EventObj => event !== null)
    .sort(compareEvents);
};

export const compareEvents = (a: EventObj, b: EventObj): number => {
  const startDiff = a.startDate.getTime() - b.startDate.getTime();
  if (startDiff !== 0) return startDiff;
  const endDiff = a.endDate.getTime() - b.endDate.getTime();
  if (endDiff !== 0) return endDiff;
  return a.id.localeCompare(b.id);
};

export const getEventLayout = (event: EventWithLayout, offset: number, maxOffset: number, hourHeight: number, dayWidth: number) => {
  const startHour = getHours(event.startDate);
  const startMin = getMinutes(event.startDate);
  const durationInMinutes = differenceInMinutes(event.endDate, event.startDate);

  const pixelsPerMinute = hourHeight / 60;
  const minutesFromMidnight = startHour * 60 + startMin;
  const minimumHeight = pixelsPerMinute * 15;

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

  // Helper to format date with year
  const formatDateStr = (date: Date) => {
    const month = date.toLocaleString('default', { month: 'short' });
    return `${month} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // Helper to format time (12-hour clock)
  const formatTimeStr = (date: Date) => {
    let hours = date.getHours();
    const AMvsPM = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} ${AMvsPM}`;
  };

  if (event.allDay) {
    startTime = formatDateStr(start);
    endTime = formatDateStr(end);

    const msPerDay = 1000 * 60 * 60 * 24;
    const diffInDays = Math.round((end.getTime() - start.getTime()) / msPerDay);
    // diffInDays is already the correct count because end is exclusive:
    // start=May27, end=May28 → diff=1 → "1 day" ✓
    // start=May27, end=May29 → diff=2 → "2 days" ✓
    const totalDays = Math.max(diffInDays, 1);

    duration = `${totalDays} ${totalDays === 1 ? 'day' : 'days'}`;
  } else {
    startTime = formatTimeStr(start);
    endTime = formatTimeStr(end);

    startDate = formatDateStr(start);
    endDate = formatDateStr(end);

    let diffInMs = end.getTime() - start.getTime();

    if (diffInMs < 0) diffInMs += 24 * 60 * 60 * 1000; // overnight
    const totalMinutes = Math.floor(diffInMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    duration = `${hours}:${minutes.toString().padStart(2, '0')}`;
  }

  return { startTime, endTime, duration, startDate, endDate };
};
