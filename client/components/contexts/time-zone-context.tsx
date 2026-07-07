// calendar-events-context.tsx
import { useTimeZone } from '@/hooks/useTimeZone';
import { createContext, ReactNode, useContext } from 'react';

export interface TimeZoneContextType {
  timeZone: string;
  setTimeZone: React.Dispatch<React.SetStateAction<string>>;
  isStorageLoaded: boolean;
}

export const TimeZoneContext = createContext<TimeZoneContextType>({} as TimeZoneContextType);

export const TimeZoneProvider = ({ children }: { children: ReactNode }) => {
  // TIME ZONE HOOK
  const { timeZone, setTimeZone, isStorageLoaded } = useTimeZone();

  return <TimeZoneContext.Provider value={{ timeZone, setTimeZone, isStorageLoaded }}>{children}</TimeZoneContext.Provider>;
};

export function useTimeZoneContext() {
  const ctx = useContext(TimeZoneContext);
  if (!ctx) throw new Error('useTimeZone must be within TimeZoneProvider');
  return ctx;
}
