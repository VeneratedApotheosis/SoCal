// calendar-events-context.tsx
import { useCalendarList } from '@/hooks/useCalendarList';
import { calendarObj, sharedObj, visibility } from '@/utility/types';
import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useEffect, useState } from 'react';
import { useAuthContext } from './auth-context';

export interface CalendarObjectsContextType {
  calendarObjs: calendarObj[] | null;
  setCalendarObjs: Dispatch<SetStateAction<calendarObj[]>>;
  refetchCalendarList: () => Promise<void>;
  sharedCalendars: sharedObj[];
  viewMode: 'default' | 'isolate' | 'transparent';
  setViewMode: React.Dispatch<React.SetStateAction<'default' | 'isolate' | 'transparent'>>;
  toggleCalendar: (id: string) => void;
  toggleTransparent: (id: string) => void;
  toggleIsolate: (id: string) => void;
  resetViewMode: () => void;
}

export const CalendarObjectsContext = createContext<CalendarObjectsContextType>({} as CalendarObjectsContextType);

export const CalendarObjectsProvider = ({ children }: { children: ReactNode }) => {
  const { jwtToken, familyProfiles } = useAuthContext();
  const sessionTokenString = jwtToken?.sessionToken ?? null;

  const { calendarObjs, setCalendarObjs, sharedObjs, refetch, error } = useCalendarList(sessionTokenString);

  const [sharedCalendars, setSharedCalendars] = useState<sharedObj[]>([]);

  const [viewMode, setViewMode] = useState<'default' | 'isolate' | 'transparent'>('default');

  const refetchCalendarList = async () => {
    await refetch(sessionTokenString);
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

  const toggleCalendar = useCallback(
    (id: string) => {
      setCalendarObjs((prev) => {
        const next = prev.map((cal) =>
          cal.calendarId === id
            ? {
                ...cal,
                shown: !cal.shown,
              }
            : cal,
        );
        return next;
      });
    },
    [setCalendarObjs],
  );

  const toggleTransparent = useCallback(
    (id: string) => {
      if (viewMode !== 'transparent') setViewMode('transparent');

      setCalendarObjs((prev) => {
        const next = prev.map((cal) =>
          cal.calendarId === id
            ? {
                ...cal,
                visibility: (cal.visibility === 'transparent' ? 'default' : 'transparent') as visibility,
              }
            : cal,
        );
        return next;
      });
    },
    [setCalendarObjs],
  );

  const toggleIsolate = useCallback(
    (id: string) => {
      if (viewMode !== 'isolate') setViewMode('isolate');

      setCalendarObjs((prev) => {
        const next = prev.map((cal) =>
          cal.calendarId === id
            ? {
                ...cal,
                visibility: (cal.visibility === 'isolate' ? 'default' : 'isolate') as visibility,
              }
            : cal,
        );
        return next;
      });
    },
    [setCalendarObjs],
  );

  const resetViewMode = useCallback(() => {
    setViewMode('default');

    setCalendarObjs((prev) =>
      prev.map((cal) => ({
        ...cal,
        visibility: 'default',
      })),
    );
  }, [setCalendarObjs]);

  return (
    <CalendarObjectsContext.Provider
      value={{
        calendarObjs,
        refetchCalendarList,
        setCalendarObjs,
        sharedCalendars,
        viewMode,
        setViewMode,
        toggleCalendar,
        toggleTransparent,
        toggleIsolate,
        resetViewMode,
      }}
    >
      {children}
    </CalendarObjectsContext.Provider>
  );
};

export function useCalendarObjects() {
  const ctx = useContext(CalendarObjectsContext);
  if (!ctx) throw new Error('useCalendarIndex must be within DateProvider');
  return ctx;
}
