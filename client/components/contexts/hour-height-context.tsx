// calendar-events-context.tsx
import { ALL_DAY_HEIGHT, DATE_HEADER_HEIGHT, DEFAULT_HOUR_HEIGHT, HEADER_HEIGHT, WEB_Y_PADDING } from '@/utility/constants';
import { createContext, ReactNode, useContext, useState } from 'react';
import { useScreenSize } from './screen-size-context';

export interface HourHeightContextType {
  hourHeight: number;
  setHourHeight: React.Dispatch<React.SetStateAction<number>>;
  minHeight: number;
}

export const HourHeightContext = createContext<HourHeightContextType>({} as HourHeightContextType);

export const HourHeightProvider = ({ children }: { children: ReactNode }) => {
  const { height: SCREEN_HEIGHT, isWeb } = useScreenSize();
  const [hourHeight, setHourHeight] = useState<number>(DEFAULT_HOUR_HEIGHT);
  const minHeight = (SCREEN_HEIGHT - HEADER_HEIGHT - isWeb * WEB_Y_PADDING - DATE_HEADER_HEIGHT - ALL_DAY_HEIGHT) / 24;

  return <HourHeightContext.Provider value={{ hourHeight, setHourHeight, minHeight }}>{children}</HourHeightContext.Provider>;
};

export function useHourHeightContext() {
  const ctx = useContext(HourHeightContext);
  if (!ctx) throw new Error('useHourHeight must be within HourHeightProvider');
  return ctx;
}
