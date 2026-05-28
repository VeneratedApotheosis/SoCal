// calendar-events-context.tsx
import { useCalendar } from '@/hooks/useCalendar';
import { useCalendarList } from '@/hooks/useCalendarList';
import { useCalendarWrite } from '@/hooks/useCalendarWrite';
import { useProfiles } from '@/hooks/useProfile';
import { processEvent } from '@/utility/eventUtils';
import { CalendarData, calendarObj, EventObj, FamilyProfileObjs, sharedObj } from '@/utility/types';
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from './auth-context';

export interface EventsContextType {
  calendarObjs: calendarObj[] | null;
  setCalendarObj: Dispatch<SetStateAction<calendarObj[] | null>>;
  allEvents: EventObj[];
  familyProfiles: FamilyProfileObjs | null;
  isLoading: boolean;
  deleteEvent: (event: EventObj) => Promise<any>;
  createEvent: (event: EventObj) => Promise<any>;
  editEvent: (event: EventObj) => Promise<any>;
  isWriting: boolean;
  writeError: string | null;
  sharedCalendars: sharedObj[];
  refetchCalendarList: () => Promise<void>;
  refetchCalendar: (jwtToken: string | null, fetchStart: number | null, fetchEnd: number | null) => Promise<void>;
  fetchForward: (fetchEnd: number) => void;
  fetchBackward: (fetchEnd: number) => void;
  uniqueCalendars: CalendarData[];
}

export const EventsContext = createContext<EventsContextType>({} as EventsContextType);

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const { jwtToken } = useAuthContext();
  const sessionTokenString = jwtToken?.sessionToken ?? null;

  //PROFILE HOOK
  const { familyProfiles } = useProfiles(sessionTokenString);
  //CALENDAR LIST TRACKING HOOK
  const { newCalendarIds, sharedObjs, refetch: refetchCalendarList } = useCalendarList(sessionTokenString);
  //CALENDAR / EVENT TRACKING HOOK
  const { calendars, setCalendars, isLoading, uniqueCalendars, refetch: refetchCalendar } = useCalendar(sessionTokenString);
  //API WRITING HOOK
  const { apiEditEvent, apiCreateEvent, apiDeleteEvent, isWriting, writeError } = useCalendarWrite(sessionTokenString);

  //TRACK STATES
  const [timeZone, setTimeZone] = useState<number>(0);
  const [sharedCalendars, setSharedCalendars] = useState<sharedObj[]>([]);
  const [calendarObjs, setCalendarObj] = useState<calendarObj[] | null>(null);

  useEffect(() => {
    if (newCalendarIds?.length) setCalendarObj(newCalendarIds);
  }, [newCalendarIds]);

  const allEvents = useMemo(() => {
    if (!calendars || !calendarObjs) return [];
    const visibleIds = new Set(calendarObjs.filter((c) => c.shown).map((c) => c.calendarId));

    // Only map parent array, ignore deprecated children
    return (calendars.parent || []).filter((cal) => visibleIds.has(cal.id)).flatMap((cal) => cal.events);
  }, [calendars, calendarObjs]);

  // -------------------------------------------
  // LOCAL AND API MUTATION WRAPPERS
  // -------------------------------------------

  const createEvent = async (event: EventObj) => {
    const rawResponse = await apiCreateEvent(event);

    const googleOwnerEmail = rawResponse?.organizer?.email || rawResponse?.creator?.email;
    const targetCalendarId = event.calendarId || googleOwnerEmail;

    // Pass targetCalendarId instead of event.calendarId
    const newEventObj = processEvent(rawResponse, event.organizer, event.calendar, targetCalendarId);

    if (newEventObj) {
      setCalendars((prev) => {
        if (!prev) return prev;
        console.log('Incoming ID to match:', targetCalendarId);
        console.log(
          'Available IDs in state:',
          prev.parent.map((cal) => cal.id),
        );

        const updatedParent = prev.parent.map((cal) => {
          // Match against the fallback ID
          const isMatch = cal.id === targetCalendarId;

          return isMatch ? { ...cal, events: [...cal.events, newEventObj] } : cal;
        });
        console.log(updatedParent);
        console.log(newEventObj);

        return { ...prev, parent: updatedParent };
      });
    }
    return newEventObj;
  };

  const editEvent = async (event: EventObj) => {
    // Await raw API response
    const rawResponse = await apiEditEvent(event);

    // Resolve targetCalendarId using the exact same chain as createEvent
    const googleOwnerEmail = rawResponse?.organizer?.email || rawResponse?.creator?.email;
    const targetCalendarId = event.calendarId || googleOwnerEmail;

    // Process into EventObj using the resolved targetCalendarId
    const updatedEventObj = processEvent(rawResponse, event.organizer, event.calendar, targetCalendarId);

    if (updatedEventObj) {
      setCalendars((prev) => {
        if (!prev) return prev;

        console.log('Edit Event - Target ID:', targetCalendarId);
        console.log(
          'Edit Event - Available IDs:',
          prev.parent.map((cal) => cal.id),
        );

        const updatedParent = prev.parent.map((cal) =>
          cal.id === targetCalendarId ? { ...cal, events: cal.events.map((e) => (e.id === event.id ? updatedEventObj : e)) } : cal,
        );

        return { ...prev, parent: updatedParent };
      });
    }
    return updatedEventObj;
  };

  const deleteEvent = async (event: EventObj) => {
    // Delete usually returns empty/204, but we catch it just in case it contains user info
    const rawResponse = await apiDeleteEvent(event);

    // Resolve targetCalendarId using the exact same chain
    const googleOwnerEmail = rawResponse?.organizer?.email || rawResponse?.creator?.email;
    const targetCalendarId = event.calendarId || googleOwnerEmail;

    setCalendars((prev) => {
      if (!prev) return prev;

      console.log('Delete Event - Target ID:', targetCalendarId);
      console.log(
        'Delete Event - Available IDs:',
        prev.parent.map((cal) => cal.id),
      );

      const updatedParent = prev.parent.map((cal) =>
        cal.id === targetCalendarId ? { ...cal, events: cal.events.filter((e) => e.id !== event.id) } : cal,
      );

      return { ...prev, parent: updatedParent };
    });
  };

  // -------------------------------------------
  // shared Calendars
  // -------------------------------------------
  useEffect(() => {
    if (!sharedObjs || !familyProfiles?.parent?.email) return;

    const ownerEmail = familyProfiles.parent.email;

    const processedCalendars = sharedObjs.map((calendar) => {
      const filteredSharedIds = calendar.sharedIds.filter((sharedIdObj) => {
        if (sharedIdObj.accessRole === 'freeBusyReader' || sharedIdObj.accessRole === 'freeReader') {
          return false;
        }

        const cleanId = sharedIdObj.id;
        if (cleanId === calendar.id) return false;
        if (cleanId === ownerEmail) return false;

        return true;
      });

      return {
        ...calendar,
        sharedIds: filteredSharedIds,
      };
    });
    setSharedCalendars(processedCalendars);
  }, [sharedObjs, familyProfiles]);

  // -------------------------------------------
  // fetching Calendars
  // -------------------------------------------

  const fetchForward = (fetchEnd: number) => {
    if (!jwtToken) return;
    refetchCalendar(jwtToken?.sessionToken, null, fetchEnd);
  };

  const fetchBackward = (fetchStart: number) => {
    if (!jwtToken) return;
    refetchCalendar(jwtToken?.sessionToken, fetchStart, null);
  };

  return (
    <EventsContext.Provider
      value={{
        calendarObjs,
        setCalendarObj,
        allEvents,
        familyProfiles,
        isLoading,
        deleteEvent,
        createEvent,
        editEvent,
        isWriting,
        writeError,

        sharedCalendars,
        refetchCalendarList,
        refetchCalendar,
        fetchForward,
        fetchBackward,
        uniqueCalendars,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};

export function useCalendarEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useCalendarIndex must be within DateProvider');
  return ctx;
}
