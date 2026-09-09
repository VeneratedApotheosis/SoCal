// calendar-events-context.tsx
import { useHiddenCalendar } from '@/hooks/useHiddenCalendar';
import { createContext, ReactNode, useContext } from 'react';
import { useCalendarObjects } from './calendar-obj-context';

export interface hiddenCalendarsContextType {
  hiddenCalendarHook: {
    hiddenCalendars: string[];
    toggleCalendar: (id: string) => void;
    hideCalendar: (id: string) => void;
    showCalendar: (id: string) => void;
  };
}

export const hiddenCalendarsContext = createContext<hiddenCalendarsContextType>({} as hiddenCalendarsContextType);

export const HiddenCalendarsProvider = ({ children }: { children: ReactNode }) => {
  const { setCalendarObjs } = useCalendarObjects();

  const hiddenCalendarHook = useHiddenCalendar(setCalendarObjs);

  return (
    <hiddenCalendarsContext.Provider
      value={{
        hiddenCalendarHook,
      }}
    >
      {children}
    </hiddenCalendarsContext.Provider>
  );
};

export function useHiddenCalendarsContext() {
  const ctx = useContext(hiddenCalendarsContext);
  if (!ctx) throw new Error('useColorGroupsContext must be within ColorGroupsProvider');
  return ctx;
}
