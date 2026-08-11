// calendar-events-context.tsx
import { useCalendarList } from '@/hooks/APIFetchingHooks/useCalendarList';
import { useHiddenCalendar } from '@/hooks/useHiddenCalendar';
import { calendarObj, sharedObj, visibility } from '@/utility/types';
import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useEffect, useState } from 'react';
import { useProfileContext } from './profile-context';

export interface CalendarObjectsContextType {
  calendarObjs: calendarObj[] | null;
  setCalendarObjs: Dispatch<SetStateAction<calendarObj[]>>;
  refetchCalendarList: () => Promise<void>;
  sharedCalendars: sharedObj[];
  calViewMode: 'default' | 'isolate' | 'transparent';
  setCalViewMode: React.Dispatch<React.SetStateAction<'default' | 'isolate' | 'transparent'>>;
  hiddenCalendarHook: {
    hiddenCalendars: string[];
    toggleCalendar: (id: string) => void;
    hideCalendar: (id: string) => void;
    showCalendar: (id: string) => void;
  };
  toggleTransparent: (id: string) => void;
  toggleIsolate: (id: string) => void;
  resetViewMode: () => void;
  suppressOther: boolean;
  setSuppressOther: Dispatch<SetStateAction<boolean>>;
  toggleSuppress: () => void;
}

export const CalendarObjectsContext = createContext<CalendarObjectsContextType>({} as CalendarObjectsContextType);

export const CalendarObjectsProvider = ({ children }: { children: ReactNode }) => {
  const { familyProfiles } = useProfileContext();
  const { calendarObjs, setCalendarObjs, sharedObjs, refetch, error } = useCalendarList();

  const [sharedCalendars, setSharedCalendars] = useState<sharedObj[]>([]);

  const [calViewMode, setCalViewMode] = useState<'default' | 'isolate' | 'transparent'>('default');

  const refetchCalendarList = async () => {
    await refetch();
  };

  // ─── Shared Calendars ───────────────────────────────────────────────────────────

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

  // ─── Shown Mutators ───────────────────────────────────────────────────────────

  const [suppressOther, setSuppressOther] = useState<boolean>(false);

  const toggleSuppress = useCallback(() => {
    const isEnablingSuppression = !suppressOther;

    setCalendarObjs((prev) =>
      prev.map((cal) => ({
        ...cal,
        shown: {
          ...cal.shown,
          suppressed: isEnablingSuppression ? cal.accessRole !== 'owner' : false,
        },
      })),
    );
    setSuppressOther(isEnablingSuppression);
  }, [suppressOther, setCalendarObjs]);

  const hiddenCalendarHook = useHiddenCalendar(setCalendarObjs);

  // ─── Visiblity Mutators ───────────────────────────────────────────────────────────

  const toggleTransparent = useCallback(
    (id: string) => {
      if (calViewMode !== 'transparent') setCalViewMode('transparent');

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
      if (calViewMode !== 'isolate') setCalViewMode('isolate');

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
    setCalViewMode('default');

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
        calViewMode,
        setCalViewMode,
        hiddenCalendarHook,
        toggleTransparent,
        toggleIsolate,
        resetViewMode,
        suppressOther,
        setSuppressOther,
        toggleSuppress,
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
