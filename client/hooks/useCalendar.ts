// useCalendar.ts
import { fetchCalendarList, fetchGivenCalendarRange, fetchMultiGivenCalendarRange } from "@/services/api";
import { storage } from "@/services/storage";
import { processCalendar } from "@/utility/eventUtils";
import { getValidAccessToken } from "@/utility/tokenUtils";
import { CalendarData, calendarObj, EventObj, FamilyCalendarState } from "@/utility/types";
import { useCallback, useEffect, useRef, useState } from "react";

export function useCalendar(jwtToken: string | null, days: {date: Date}[]) {
  const [calendars, setCalendars] = useState<FamilyCalendarState | null>(null);
  const [calendarIds, setCalendarIds] = useState<calendarObj[]>([]);
  const [uniqueCalendars, setUniqueCalendars] = useState<CalendarData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedBounds = useRef<{ start: Date | null; end: Date | null }>({ start: null, end: null });

  useEffect(() => { storage.get("calendar").then(c => c && setCalendars(c)); }, []);

  const fetchUserEvents = useCallback(async () => {
    if (!jwtToken) return;

    const currentStart = days[0].date;
    const currentEnd = days[days.length - 1].date;

    let fetchStart: Date;
    let fetchEnd: Date;
    let isInitialFetch = !fetchedBounds.current.start || !fetchedBounds.current.end;

    if (isInitialFetch) {
      fetchStart = currentStart;
      fetchEnd = currentEnd;
    } else if (currentEnd > fetchedBounds.current.end!) {
      fetchStart = fetchedBounds.current.end!;
      fetchEnd = currentEnd;
    } else if (currentStart < fetchedBounds.current.start!) {
      fetchStart = currentStart;
      fetchEnd = fetchedBounds.current.start!;
    } else {
      return; // Range already fully loaded. Exit.
    }

    
    setIsLoading(true); setError(null);
    console.log("FETCHING")

    try {
      const tokens = await getValidAccessToken(jwtToken); // get access token to fetch
      // get all calendars (required to fetch events (which calendar to fetch events from?))
      const { items: parentCalendars = [] } = await fetchCalendarList(tokens.parent.accessToken); 
      const parentCalendarObjs: calendarObj[] = [];

      //ranges to fetch (newly loaded in ranges)
      const rfcStart = fetchStart.toISOString();
      const rfcEnd = fetchEnd.toISOString();

      // all fetching logic and calendar reconstruction happens here
      const parentCalendarPromises = parentCalendars.map(async (cal: any) => {
        const newCalendarObj: calendarObj = {
          calendarName: cal.summary, calendarId: cal.id,
          calendarDefaultColor: cal.backgroundColor || "#4285F4",
          calendarCustomColor: cal.backgroundColor || "#4285F4",
          shown: true, owner: cal.accessRole === 'owner'
        };
        parentCalendarObjs.push(newCalendarObj);
      
        const rawEvents = await fetchGivenCalendarRange(tokens.parent.accessToken, cal.id, rfcStart, rfcEnd);
        const uniqueEvents = await fetchMultiGivenCalendarRange(tokens.parent.accessToken, cal.id, rfcStart, rfcEnd);
        const proccessedUniqueEvent = processCalendar(uniqueEvents, cal.id, cal.summary, newCalendarObj);
        const recurringEvents : EventObj[] = proccessedUniqueEvent.filter((event) => {
          if (event.recurrence != null) return event;
        })

        //merges unique calendars
        setUniqueCalendars((prev) => {
          const existingCalIndex = prev.findIndex(p => p.id === cal.id);
          if (existingCalIndex === -1) {
            return [...prev, { id: cal.id, owner: cal.dataOwner, name: cal.summary, color: newCalendarObj.calendarDefaultColor, events: recurringEvents } as CalendarData];
          }
          const updated = [...prev];
          const mergedEventsMap = new Map([...updated[existingCalIndex].events, ...recurringEvents].map(e => [e.id, e]));
          updated[existingCalIndex].events = Array.from(mergedEventsMap.values());
          return updated;
        });

        return { id: cal.id, owner: cal.dataOwner, name: cal.summary, color: newCalendarObj.calendarDefaultColor, events: processCalendar(rawEvents, cal.id, cal.summary, newCalendarObj) };
      });
      const newlyFetchedParentCalendars = await Promise.all(parentCalendarPromises);

      // Merge standard Calendars safely
      setCalendars((prev) => {
        if (!prev) return { parent: newlyFetchedParentCalendars, children: [] };
        
        const mergedParent = prev.parent.map(existingCal => {
          const newCalData = newlyFetchedParentCalendars.find(c => c.id === existingCal.id);
          if (!newCalData) return existingCal;
          
          // Deduplicate events by ID to prevent rendering duplicates on boundaries
          const mergedEventsMap = new Map([...existingCal.events, ...newCalData.events].map(e => [e.id, e]));
          return { ...existingCal, events: Array.from(mergedEventsMap.values()) };
        });

        const newState = { parent: mergedParent, children: prev.children };
        storage.save("calendar", newState);
        return newState;
      });

      setCalendarIds(parentCalendarObjs);

      // Update ref to encompass new boundaries
      fetchedBounds.current = {
        start: isInitialFetch ? currentStart : (currentStart < fetchedBounds.current.start! ? currentStart : fetchedBounds.current.start),
        end: isInitialFetch ? currentEnd : (currentEnd > fetchedBounds.current.end! ? currentEnd : fetchedBounds.current.end)
      };
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [jwtToken, days]); //

  useEffect(() => { fetchUserEvents(); }, [fetchUserEvents]);

  return { calendars, setCalendars, newCalendarIds: calendarIds, isLoading, error, uniqueCalendars, refetch: fetchUserEvents };
}