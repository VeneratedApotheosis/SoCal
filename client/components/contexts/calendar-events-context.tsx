// calendar-events-context.tsx
import { useCalendar } from '@/hooks/useCalendar';
import { useCalendarWrite } from '@/hooks/useCalendarWrite';
import { useMutateEvent } from '@/hooks/useMutateEvent';
import { FETCH_INITIAL_BUFFER } from '@/utility/constants';
import { CalendarData, EventObj } from '@/utility/types';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useAuthContext } from './auth-context';
import { useCalendarObjects } from './calendar-obj-context';
import { useTimeZoneContext } from './time-zone-context';

export interface EventsContextType {
  allEvents: EventObj[];
  isLoading: boolean;
  error: string | null;
  mutateEvent: {
    deleteSingleEvent: (event: EventObj) => Promise<any>;
    createEvent: (event: EventObj) => Promise<any>;
    editEvent: (event: EventObj) => Promise<any>;
    editAllRecurringEvents: (event: EventObj) => Promise<EventObj | null | undefined>;
    deleteAllRecurringEvents: (event: EventObj) => Promise<void>;
    deleteThisAndFollowingEvents: (event: EventObj) => Promise<void>;
    editThisAndFollowingEvents: (event: EventObj) => Promise<EventObj | null | undefined>;
  };
  isWriting: boolean;
  writeError: string | null;
  refetchCalendar: (jwtToken: string | null, fetchStart: number | null, fetchEnd: number | null) => Promise<void>;
  fetchForward: (fetchEnd: number) => void;
  fetchBackward: (fetchEnd: number) => void;
  uniqueCalendars: CalendarData[];
  setUniqueCalendars: React.Dispatch<React.SetStateAction<CalendarData[]>>;
  viewMode: 'default' | 'isolate' | 'transparent';
  setViewMode: React.Dispatch<React.SetStateAction<'default' | 'isolate' | 'transparent'>>;
}

export const EventsContext = createContext<EventsContextType>({} as EventsContextType);

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const { jwtToken } = useAuthContext();
  const sessionTokenString = jwtToken?.sessionToken ?? null;

  // TRACK STATES
  const [viewMode, setViewMode] = useState<'default' | 'isolate' | 'transparent'>('default');

  // API WRITING HOOK
  const { isWriting, writeError } = useCalendarWrite(sessionTokenString);

  // TIME ZONE HOOK
  const { timeZone, setTimeZone, isStorageLoaded: isTimeZoneLoaded } = useTimeZoneContext();

  // ─── Calendar Object and Events Hooks ───────────────────────────────────────────────────────────

  // Calendar Object Hook
  const { calendarObjs } = useCalendarObjects();
  // Calendar Event Hook
  const {
    calendars,
    setCalendars,
    isLoading,
    error,
    uniqueCalendars,
    setUniqueCalendars,
    refetch: refetchCalendar,
  } = useCalendar(sessionTokenString, timeZone, isTimeZoneLoaded);

  // Visible Events
  const allEvents = useMemo(() => {
    if (!calendars || !calendarObjs) return [];
    const visibleIds = new Set(calendarObjs.filter((c) => c.shown).map((c) => c.calendarId));

    return (calendars.parent || []).filter((cal) => visibleIds.has(cal.id)).flatMap((cal) => cal.events);
  }, [calendars, calendarObjs]);

  // ─── Event Mutation Hook ───────────────────────────────────────────────────────────

  const [fetchEnd, setFetchEnd] = useState<number>(3 * FETCH_INITIAL_BUFFER);
  const [fetchStart, setFetchStart] = useState<number>(-3 * FETCH_INITIAL_BUFFER);
  const mutateEvent = useMutateEvent(sessionTokenString, uniqueCalendars, setCalendars, setUniqueCalendars, fetchStart, fetchEnd);

  // ─── Fetching ───────────────────────────────────────────────────────────

  const fetchForward = (fetchEnd: number) => {
    if (!jwtToken) return;
    refetchCalendar(jwtToken?.sessionToken, null, fetchEnd);
    setFetchEnd(fetchEnd);
  };

  const fetchBackward = (fetchStart: number) => {
    if (!jwtToken) return;
    refetchCalendar(jwtToken?.sessionToken, fetchStart, null);
    setFetchStart(fetchStart);
  };

  return (
    <EventsContext.Provider
      value={{
        allEvents,
        isLoading,
        error,
        mutateEvent,
        isWriting,
        writeError,
        refetchCalendar,
        fetchForward,
        fetchBackward,
        uniqueCalendars,
        setUniqueCalendars,
        viewMode,
        setViewMode,
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
