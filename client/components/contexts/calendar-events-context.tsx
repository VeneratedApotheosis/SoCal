// calendar-events-context.tsx
import { useCalendar } from '@/hooks/APIFetchingHooks/useCalendar';
import { useCalendarWrite } from '@/hooks/useCalendarWrite';
import { useMutateEvent } from '@/hooks/useMutateEvent';
import { BUFFER_INCREMENT } from '@/utility/constants';
import { CalendarData, EventObj } from '@/utility/types';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
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
  refetchCalendar: (fetchStart: number | null, fetchEnd: number | null) => Promise<void>;
  fetchForward: (fetchEnd: number) => void;
  fetchBackward: (fetchEnd: number) => void;
  reloadCalendar: () => void;
  uniqueCalendars: CalendarData[];
  setUniqueCalendars: React.Dispatch<React.SetStateAction<CalendarData[]>>;
}

export const EventsContext = createContext<EventsContextType>({} as EventsContextType);

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const { calendarType } = useAuthContext();
  const [localCalType, setLocalCalType] = useState<'D' | 'W'>('D');

  // API WRITING HOOK
  const { isWriting, writeError } = useCalendarWrite();

  // TIME ZONE HOOK
  const { timeZone, setTimeZone, isStorageLoaded: isTimeZoneLoaded } = useTimeZoneContext();

  // ─── Calendar Object and Events Hooks ───────────────────────────────────────────────────────────

  // Calendar Object Hook
  const { hiddenCalendarHook: hiddenCalendar, calendarObjs, calViewMode, suppressOther } = useCalendarObjects();
  // Calendar Event Hook
  const {
    calendars,
    setCalendars,
    isLoading,
    error,
    uniqueCalendars,
    setUniqueCalendars,
    refetch: refetchCalendar,
  } = useCalendar(timeZone, isTimeZoneLoaded);

  const isDisplayed = (calendarId: string) => {
    return !hiddenCalendar.hiddenCalendars.includes(calendarId || '');
  };

  // Visible Events
  const allEvents = useMemo(() => {
    if (!calendars || !calendarObjs) return [];
    if (calViewMode === 'default') {
      const visibleIds = new Set(calendarObjs.filter((c) => isDisplayed(c.calendarId) && !c.shown.suppressed).map((c) => c.calendarId));
      return (calendars.parent || []).filter((cal) => visibleIds.has(cal.id)).flatMap((cal) => cal.events);
    } else if (calViewMode === 'isolate') {
      const visibleIds = new Set(
        calendarObjs
          .filter((c) => c.visibility === 'isolate' || (isDisplayed(c.calendarId) && !c.shown.suppressed))
          .map((c) => c.calendarId),
      );
      return (calendars.parent || []).filter((cal) => visibleIds.has(cal.id)).flatMap((cal) => cal.events);
    }

    const visibleIds = new Set(calendarObjs.filter((c) => isDisplayed(c.calendarId) && !c.shown.suppressed).map((c) => c.calendarId));
    return (calendars.parent || []).filter((cal) => visibleIds.has(cal.id)).flatMap((cal) => cal.events);
  }, [calendars, calendarObjs, calViewMode, suppressOther]);

  // ─── Event Mutation Hook ───────────────────────────────────────────────────────────

  const [fetchEnd, setFetchEnd] = useState<number>(2 * BUFFER_INCREMENT);
  const [fetchStart, setFetchStart] = useState<number>(-2 * BUFFER_INCREMENT);
  const mutateEvent = useMutateEvent(uniqueCalendars, setCalendars, setUniqueCalendars, fetchStart, fetchEnd);

  // ─── Fetching ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (calendarType.type !== localCalType) {
      if (calendarType.type === 'W') {
        refetchCalendar(-8 * BUFFER_INCREMENT, 8 * BUFFER_INCREMENT);
      }
      setLocalCalType(calendarType.type);
      setFetchEnd(Math.max(6 * BUFFER_INCREMENT, fetchEnd));
      setFetchStart(Math.max(-6 * BUFFER_INCREMENT, fetchEnd));
    }
  }, [calendarType]);

  const fetchForward = (fetchEnd: number) => {
    refetchCalendar(null, fetchEnd);
    setFetchEnd(fetchEnd);
  };

  const fetchBackward = (fetchStart: number) => {
    refetchCalendar(fetchStart, null);
    setFetchStart(fetchStart);
  };

  const reloadCalendar = () => {
    refetchCalendar(fetchStart, fetchEnd);
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
        reloadCalendar,
        uniqueCalendars,
        setUniqueCalendars,
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
