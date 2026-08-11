// useCalendar.ts
import { useAuth } from '@/hooks/useAuth';
import { fetchCalendarList, fetchGivenCalendarRange, fetchMultiGivenCalendarRange } from '@/services/api';
import { storage } from '@/services/storage';
import { BUFFER_INCREMENT } from '@/utility/constants';
import { processCalendar } from '@/utility/eventUtils';
import { getValidAccessToken } from '@/utility/tokenUtils';
import { CalendarData, calendarObj, EventObj, FamilyCalendarState } from '@/utility/types';
import { addDays } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';

export function useCalendar(timeZone: string, isTimeZoneLoaded: boolean) {
  const [calendars, setCalendars] = useState<FamilyCalendarState | null>(null);
  const [uniqueCalendars, setUniqueCalendars] = useState<CalendarData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localTimeZone, setLocalTimeZone] = useState<string | null>(null);
  const { getValidJwt } = useAuth();

  useEffect(() => {
    storage.get('calendar').then((c) => c && setCalendars(c));
  }, []);

  const clearCalendarEvents = () => {
    setCalendars(null);
    setUniqueCalendars([]);
    console.log('Cleared Calendar Events');
  };

  const fetchUserEvents = useCallback(
    async (fetchStart: number | null, fetchEnd: number | null) => {
      const jwtToken = await getValidJwt();
      if (!jwtToken || !isTimeZoneLoaded || !timeZone) {
        clearCalendarEvents();
        return;
      }
      console.log('fetching calendar events');

      //Fetching Start and End Date Calculation
      let fetchStartDate: Date = new Date();
      let fetchEndDate: Date = new Date();
      if (fetchStart && fetchEnd) {
        fetchStartDate = addDays(fetchStartDate, fetchStart);
        fetchEndDate = addDays(fetchEndDate, fetchEnd);
      } else if (!fetchStart && !fetchEnd) {
        //Starting fetch scheme
        fetchStartDate = addDays(fetchStartDate, -2 * BUFFER_INCREMENT);
        fetchEndDate = addDays(fetchEndDate, 2 * BUFFER_INCREMENT);
      } else if (fetchStart) {
        //fetch backward/start
        fetchStartDate = addDays(fetchStartDate, fetchStart - BUFFER_INCREMENT);
        fetchEndDate = addDays(fetchEndDate, fetchStart);
      } else if (fetchEnd) {
        //fetch forward/end
        fetchStartDate = addDays(fetchStartDate, fetchEnd);
        fetchEndDate = addDays(fetchEndDate, fetchEnd + BUFFER_INCREMENT);
      }

      setIsLoading(true);
      setError(null);

      try {
        const tokens = await getValidAccessToken(jwtToken); // get access token to fetch

        // get all calendars (required to fetch events (which calendar to fetch events from?))
        const { items: parentCalendars = [] } = await fetchCalendarList(tokens.parent.accessToken);

        //ranges to fetch (newly loaded in ranges)
        const rfcStart = fetchStartDate.toISOString();
        const rfcEnd = fetchEndDate.toISOString();

        // all fetching logic and calendar reconstruction happens here
        const parentCalendarPromises = parentCalendars.map(async (cal: any) => {
          const newCalendarObj: calendarObj = {
            calendarName: cal.summary,
            calendarId: cal.id,
            calendarDefaultColor: cal.backgroundColor || '#4285F4',
            owner: cal.accessRole === 'owner',
            shown: { displayed: true, suppressed: false },
            visibility: 'default',
            accessRole: cal.accessRole,
            dataOwner: cal.dataOwner,
          };

          const rawEvents = await fetchGivenCalendarRange(tokens.parent.accessToken, cal.id, rfcStart, rfcEnd, timeZone);
          const uniqueEvents = await fetchMultiGivenCalendarRange(tokens.parent.accessToken, cal.id, rfcStart, rfcEnd, timeZone);

          const processedRaw = processCalendar(rawEvents, cal.id, cal.summary, timeZone);
          const proccessedUnique = processCalendar(uniqueEvents, cal.id, cal.summary, timeZone);
          const recurringEvents: EventObj[] = proccessedUnique.filter((event) => event.recurrence != null);

          return {
            normalCal: {
              id: cal.id,
              owner: cal.dataOwner,
              name: cal.summary,
              color: newCalendarObj.calendarDefaultColor,
              events: processedRaw,
            },
            uniqueCal: {
              id: cal.id,
              owner: cal.dataOwner,
              name: cal.summary,
              color: newCalendarObj.calendarDefaultColor,
              events: recurringEvents,
            },
          };
        });
        const results = await Promise.all(parentCalendarPromises);

        const newlyFetchedParentCalendars = results.map((r) => r.normalCal);
        const newlyFetchedUniqueCalendars = results.map((r) => r.uniqueCal);

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

        setUniqueCalendars((prev) => mergeCalendarArrays(prev, newlyFetchedUniqueCalendars));
        setCalendars((prev) => {
          if (!prev) return { parent: newlyFetchedParentCalendars, children: [] };
          return {
            parent: mergeCalendarArrays(prev.parent, newlyFetchedParentCalendars),
            children: prev.children,
          };
        });
      } catch (err: any) {
        setError(err.status || 'UNKOWN');
      } finally {
        setIsLoading(false);
      }
    },
    [isTimeZoneLoaded, timeZone],
  );

  useEffect(() => {
    if (localTimeZone && localTimeZone !== timeZone) {
      clearCalendarEvents();
    }
    setLocalTimeZone(timeZone);
    fetchUserEvents(null, null);
  }, [timeZone, isTimeZoneLoaded, fetchUserEvents]);

  return { calendars, setCalendars, isLoading, error, uniqueCalendars, setUniqueCalendars, refetch: fetchUserEvents };
}
