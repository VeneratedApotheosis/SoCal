// calendar-events-context.tsx
import { useCalendarList } from '@/hooks/useCalendarList';
import { calendarObj, sharedObj } from '@/utility/types';
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from 'react';
import { useAuthContext } from './auth-context';

export interface CalendarObjectsContextType {
  calendarObjs: calendarObj[] | null;
  setCalendarObj: Dispatch<SetStateAction<calendarObj[]>>;
  refetchCalendarList: () => Promise<void>;
  sharedCalendars: sharedObj[];
}

export const CalendarObjectsContext = createContext<CalendarObjectsContextType>({} as CalendarObjectsContextType);

export const CalendarObjectsProvider = ({ children }: { children: ReactNode }) => {
  const { jwtToken, familyProfiles } = useAuthContext();
  const sessionTokenString = jwtToken?.sessionToken ?? null;

  const { calendarObjs, setCalendarIds, sharedObjs, refetch: refetchCalendarList } = useCalendarList(sessionTokenString);
  const [sharedCalendars, setSharedCalendars] = useState<sharedObj[]>([]);

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
    <CalendarObjectsContext.Provider
      value={{
        calendarObjs,
        refetchCalendarList,
        setCalendarObj: setCalendarIds,
        sharedCalendars,
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
