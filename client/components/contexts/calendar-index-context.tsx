import React, { createContext, ReactNode, useContext, useState } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

export interface DateContextType {
  curDate: Date;
  setCurDate: (curDate: Date) => void;
  currentMonthText: SharedValue<string>;
}

export const DateContext = createContext<DateContextType>({} as DateContextType);

export const DateProvider = ({ children }: { children: ReactNode }) => {
  const [curDate, setCurDate] = useState<Date>(new Date());
  const currentMonthText = useSharedValue<string>(curDate.toLocaleString('default', { month: 'long' }));

  return <DateContext.Provider value={{ curDate, setCurDate, currentMonthText }}>{children}</DateContext.Provider>;
};

export function useCalendarIndex() {
  const ctx = useContext(DateContext);
  if (!ctx) throw new Error('useCalendarIndex must be within DateProvider');
  return ctx;
}
