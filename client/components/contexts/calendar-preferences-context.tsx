// calendar-events-context.tsx
import { useCalendarPreferences } from '@/hooks/useColorGroups';
import { calendarGroup, colorCache } from '@/utility/types';
import { createContext, ReactNode, useContext } from 'react';

export interface calendarPreferencesContextType {
  paletteData: colorCache[];
  groupsData: calendarGroup[];
  hiddenCalendarsData: string[];
  isLoading: boolean;
  setPaletteData: React.Dispatch<React.SetStateAction<colorCache[]>>;
  setGroupsData: React.Dispatch<React.SetStateAction<calendarGroup[]>>;
  setHiddenCalendarsData: React.Dispatch<React.SetStateAction<string[]>>;
  error: string | null;
  refreshColorGroups: () => Promise<void>;
}

export const CalendarPreferencesContext = createContext<calendarPreferencesContextType>({} as calendarPreferencesContextType);

export const CalendarPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const {
    paletteData,
    groupsData,
    isLoading,
    setPaletteData,
    setGroupsData,
    hiddenCalendarsData,
    setHiddenCalendarsData,
    error,
    refreshColorGroups,
  } = useCalendarPreferences();

  return (
    <CalendarPreferencesContext.Provider
      value={{
        paletteData,
        groupsData,
        hiddenCalendarsData,
        isLoading,
        setPaletteData,
        setGroupsData,
        setHiddenCalendarsData,
        error,
        refreshColorGroups,
      }}
    >
      {children}
    </CalendarPreferencesContext.Provider>
  );
};

export function useCalendarPreferencesContext() {
  const ctx = useContext(CalendarPreferencesContext);
  if (!ctx) throw new Error('useColorGroupsContext must be within ColorGroupsProvider');
  return ctx;
}
