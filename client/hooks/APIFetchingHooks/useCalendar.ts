// useCalendar.ts
import { useCalendarObjects } from '@/components/contexts/calendar-obj-context';
import { useAuth } from '@/hooks/useAuth';
import { fetchGivenCalendarRange, fetchMultiGivenCalendarRange } from '@/services/api';
import { BUFFER_INCREMENT, DEMO_JWT } from '@/utility/constants';
import { demoEvents } from '@/utility/demoEvents/demoEvents0';
import { processCalendar } from '@/utility/eventUtils';
import { getValidAccessToken } from '@/utility/tokenUtils';
import { CalendarData, calendarObj, CalendarView, EventObj, FamilyCalendarState } from '@/utility/types';
import { addDays } from 'date-fns';
import { useCallback, useEffect, useRef, useState } from 'react';

const mergeCalendarArrays = (existing: CalendarData[], incoming: CalendarData[]) => {
  const incomingMap = new Map(incoming.map((c) => [c.id, c]));

  const merged = existing.map((existingCal) => {
    const incomingCal = incomingMap.get(existingCal.id);
    if (!incomingCal) return existingCal;

    incomingMap.delete(existingCal.id);

    // High performance event deduplication using Hash Map
    const eventMap = new Map(existingCal.events.map((e) => [e.id, e]));
    incomingCal.events.forEach((e) => eventMap.set(e.id, e));

    return { ...existingCal, events: Array.from(eventMap.values()) };
  });

  // Append any brand new calendars that weren't in state yet
  return [...merged, ...incomingMap.values()];
};

export function useCalendar(timeZone: string, isTimeZoneLoaded: boolean, calendarType: CalendarView) {
  const [calendars, setCalendars] = useState<FamilyCalendarState | null>(null);
  const [uniqueCalendars, setUniqueCalendars] = useState<CalendarData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localTimeZone, setLocalTimeZone] = useState<string | null>(null);
  const { getValidJwt } = useAuth();
  const { calendarObjs } = useCalendarObjects();

  const hasProcessedC = useRef(false);

  const clearCalendarEvents = () => {
    setCalendars(null);
    setUniqueCalendars([]);
    console.log('Cleared Calendar Events');
  };

  const fetchUserEvents = useCallback(
    async (fetchStart: number, fetchEnd: number) => {
      const jwtToken = await getValidJwt();
      if (!jwtToken || !isTimeZoneLoaded || !timeZone) {
        clearCalendarEvents();
        return;
      }
      if (jwtToken == DEMO_JWT) {
        setCalendars({
          parent: demoEvents,
          children: [],
        });
      }
      if (!calendarObjs) return;

      //Fetching Start and End Date Calculation
      let fetchStartDate: Date = new Date();
      let fetchEndDate: Date = new Date();
      fetchStartDate = addDays(fetchStartDate, fetchStart);
      fetchEndDate = addDays(fetchEndDate, fetchEnd);
      console.log('[FETCH] calendar events', fetchStart, fetchEnd);

      setIsLoading(true);
      setError(null);

      try {
        const tokens = await getValidAccessToken(); // get access token to fetch

        //ranges to fetch (newly loaded in ranges)
        const rfcStart = fetchStartDate.toISOString();
        const rfcEnd = fetchEndDate.toISOString();

        // fetching logic and calendar reconstruction for single events
        const parentCalendarPromises = calendarObjs.map(async (cal: calendarObj) => {
          const rawEvents = await fetchGivenCalendarRange(tokens.accessToken, cal.calendarId, rfcStart, rfcEnd, timeZone);

          const processedRaw = processCalendar(rawEvents, cal.calendarId, cal.calendarName, timeZone);

          return {
            id: cal.calendarId,
            owner: cal.dataOwner,
            name: cal.calendarName,
            color: cal.calendarDefaultColor,
            events: processedRaw,
          };
        });

        const results = await Promise.all(parentCalendarPromises);
        setCalendars((prev) => {
          if (!prev) return { parent: results, children: [] };
          return {
            parent: mergeCalendarArrays(prev.parent, results),
            children: prev.children,
          };
        });

        setIsLoading(false);
        await new Promise<void>((resolve) => setTimeout(resolve, 0));

        // fetching logic and calendar reconstruction for UNIQUE events
        const uniqueParentCalendarPromises = calendarObjs.map(async (cal: calendarObj) => {
          const uniqueEvents = await fetchMultiGivenCalendarRange(tokens.accessToken, cal.calendarId, rfcStart, rfcEnd, timeZone);

          const proccessedUnique = processCalendar(uniqueEvents, cal.calendarId, cal.calendarName, timeZone);
          const recurringEvents: EventObj[] = proccessedUnique.filter((event) => event.recurrence != null);

          return {
            id: cal.calendarId,
            owner: cal.dataOwner,
            name: cal.calendarName,
            color: cal.calendarDefaultColor,
            events: recurringEvents,
          };
        });

        const uniqueResults = await Promise.all(uniqueParentCalendarPromises);
        setUniqueCalendars((prev) => mergeCalendarArrays(prev, uniqueResults));
      } catch (err: any) {
        setError(err.status || 'UNKOWN');
      } finally {
        setIsLoading(false);
      }
    },
    [isTimeZoneLoaded, timeZone, calendarObjs],
  );

  const checkThenFetch = () => {
    if (localTimeZone && localTimeZone !== timeZone) {
      clearCalendarEvents();
    }
    setLocalTimeZone(timeZone);
    //Initial Fetch Bounds
    if (calendarType.type === 'W') {
      fetchUserEvents(-1 * (calendarType.weekNum + 8) * 7, (calendarType.weekNum + 8) * 7);
    } else {
      fetchUserEvents(-2 * BUFFER_INCREMENT, 2 * BUFFER_INCREMENT);
    }
  };

  //triggers fetching
  useEffect(() => {
    checkThenFetch();
  }, [timeZone, isTimeZoneLoaded, fetchUserEvents, calendarObjs]);

  useEffect(() => {
    if (!calendarObjs || calendarObjs.length === 0 || hasProcessedC.current === true) {
      return;
    }
    hasProcessedC.current = true;
    checkThenFetch();
  }, [calendarObjs]);

  return { calendars, setCalendars, isLoading, error, uniqueCalendars, setUniqueCalendars, refetch: fetchUserEvents };
}
