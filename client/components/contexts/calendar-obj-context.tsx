// calendar-events-context.tsx
import { useCalendarList } from '@/hooks/APIFetchingHooks/useCalendarList';
import { calendarObj, sharedObj, visibility } from '@/utility/types';
import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useMemo, useState } from 'react';
import { useProfileContext } from './profile-context';

export interface CalendarObjectsContextType {
  calendarObjs: calendarObj[] | null;
  setCalendarObjs: Dispatch<SetStateAction<calendarObj[]>>;
  refetchCalendarList: () => Promise<void>;
  isLoading: boolean;
  hasLoadedList: boolean;
  error: string | null;
  sharedCalendars: sharedObj[];
  loadSharingSettings: () => Promise<void>;
  refreshSharingSettings: (calendarId: string) => Promise<void> | undefined;
  isSharingLoading: boolean;
  hasSharingError: boolean;
  calViewMode: 'default' | 'isolate' | 'transparent';
  setCalViewMode: React.Dispatch<React.SetStateAction<'default' | 'isolate' | 'transparent'>>;
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
  const {
    calendarObjs, setCalendarObjs, sharedObjs, refetch, isLoading, hasLoadedList, error,
    loadSharingSettings, refreshSharingSettings, isSharingLoading, hasSharingError,
  } = useCalendarList();

  const [calViewMode, setCalViewMode] = useState<'default' | 'isolate' | 'transparent'>('default');

  const refetchCalendarList = async () => {
    await refetch();
  };

  // ─── Shared Calendars ───────────────────────────────────────────────────────────

  const sharedCalendars = useMemo(() => {
    if (!sharedObjs || !familyProfiles?.parent?.email) return [];

    const ownerEmail = familyProfiles.parent.email;

    return sharedObjs.map((calendar) => {
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
        isLoading,
        hasLoadedList,
        error,
        sharedCalendars,
        loadSharingSettings,
        refreshSharingSettings,
        isSharingLoading,
        hasSharingError,
        calViewMode,
        setCalViewMode,
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
