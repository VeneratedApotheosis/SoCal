import { PAST_BUFFER } from '@/utility/constants';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

export interface DateContextType {
  curDate: Date;
  setCurDate: (curDate: Date) => void;
  setDayWidth: React.Dispatch<React.SetStateAction<number>>;
  scrollX: SharedValue<number>;
}

export const DateContext = createContext<DateContextType>({} as DateContextType);

export const DateProvider = ({ children }: { children: ReactNode }) => {
  const [curDate, setCurDate] = useState<Date>(new Date());
  const [dayWidth, setDayWidth] = useState<number>(0);
  const scrollX = useSharedValue(PAST_BUFFER * dayWidth);

  return <DateContext.Provider value={{ curDate, setCurDate, setDayWidth, scrollX }}>{children}</DateContext.Provider>;
};

export function useCalendarIndex() {
  const ctx = useContext(DateContext);
  if (!ctx) throw new Error('useCalendarIndex must be within DateProvider');
  return ctx;
}
