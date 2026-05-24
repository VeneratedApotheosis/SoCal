// calendar-events-context.tsx
import { useCalendarRange } from '@/hooks/calendarHooks/useCalendarRange'; // Add import
import { useCalendar } from '@/hooks/useCalendar';
import { useCalendarList } from '@/hooks/useCalendarList';
import { useCalendarWrite } from '@/hooks/useCalendarWrite';
import { useProfiles } from '@/hooks/useProfile';
import { CalendarData, calendarObj, EventObj, FamilyProfileObjs, sharedObj } from '@/utility/types';
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from './auth-context';

export interface EventsContextType {
  calendarObjs: calendarObj[] | null;
  allEvents: EventObj[];
  familyProfiles: FamilyProfileObjs | null;
  isLoading: boolean;
  groupedCalendars: { id: string; calendars: calendarObj[] }[];
  setCalendarObj: Dispatch<SetStateAction<calendarObj[] | null>>;
  updateSingleGroup: (groupId: string, newCalendars: calendarObj[]) => void;
  updateMultipleGroups: (updates: { groupId: string; newCalendars: calendarObj[] }[]) => void;
  deleteEvent: (event: EventObj) => Promise<any>;
  createEvent: (event: EventObj) => Promise<any>;
  editEvent: (event: EventObj) => Promise<any>;
  isWriting: boolean;
  writeError: string | null;
  sharedCalendars: sharedObj[];
  refetchCalendarList: () => Promise<void>;
  uniqueCalendars: CalendarData[];
  days: { date: Date }[];
  extendFuture: () => void;
  extendPast: () => void;
  pastDaysCount: number;
}

export const EventsContext = createContext<EventsContextType>({} as EventsContextType);

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const { jwtToken } = useAuthContext();
  const sessionTokenString = jwtToken?.sessionToken ?? null;

  // 1. Init range state here
  const { days, extendFuture, extendPast, pastDaysCount } = useCalendarRange(); 
  // 2. Pass days to useCalendar

  const { familyProfiles } = useProfiles(sessionTokenString);
  const { newCalendarIds, sharedObjs, refetch: refetchCalendarList } = useCalendarList(sessionTokenString);
  const { calendars, isLoading, uniqueCalendars } = useCalendar(sessionTokenString, days);
  const { editEvent, createEvent, deleteEvent, loading: isWriting, error: writeError } = useCalendarWrite(sessionTokenString);
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
  // calendar groups
  // -------------------------------------------
  const [groupedCalendars, setGroupedCalendars] = useState<{ id: string; calendars: calendarObj[] }[]>([]);

  //add new calendarObjs to either "owner" or "other" group
  useEffect(() => {
    if (!calendarObjs) return;

    const initialGroups = calendarObjs.reduce(
      (groups, cal) => {
        const type = cal.owner ? 'owner' : 'other';
        let group = groups.find((g) => g.id === type);

        if (!group) {
          group = { id: type, calendars: [] };
          groups.push(group);
        }

        group.calendars.push(cal);
        return groups;
      },
      [] as { id: string; calendars: calendarObj[] }[],
    );

    setGroupedCalendars(initialGroups);
  }, [calendarObjs]);

  const updateSingleGroup = (groupId: string, newCalendars: calendarObj[]) => {
    setGroupedCalendars((prev) => prev.map((group) => (group.id === groupId ? { ...group, calendars: newCalendars } : group)));
  };

  const updateMultipleGroups = (updates: { groupId: string; newCalendars: calendarObj[] }[]) => {
    setGroupedCalendars((prev) => {
      const updatesMap = new Map(updates.map((u) => [u.groupId, u.newCalendars]));

      return prev.map((group) => (updatesMap.has(group.id) ? { ...group, calendars: updatesMap.get(group.id)! } : group));
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

  return (
    <EventsContext.Provider
      value={{
        calendarObjs,
        setCalendarObj,
        allEvents,
        familyProfiles,
        isLoading,
        groupedCalendars,
        updateSingleGroup,
        updateMultipleGroups,
        deleteEvent,
        createEvent,
        editEvent,
        isWriting,
        writeError,
        sharedCalendars,
        refetchCalendarList,
        uniqueCalendars,
        days,
        extendFuture,
        extendPast,
        pastDaysCount,
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
