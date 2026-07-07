import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface DateContextType {
  curDate: Date;
  setCurDate: (curDate: Date) => void;
  currentMonthText: string;
  setCurrentMonthText: React.Dispatch<React.SetStateAction<string>>;
  resetDate: number;
  setResetDate: React.Dispatch<React.SetStateAction<number>>;
}

export const CalendarIndexContext = createContext<DateContextType>({} as DateContextType);

export const DateProvider = ({ children }: { children: ReactNode }) => {
  const [curDate, setCurDate] = useState<Date>(new Date());
  const [currentMonthText, setCurrentMonthText] = useState<string>(curDate.toLocaleString('default', { month: 'long' }));
  const [resetDate, setResetDate] = useState<number>(0);

  return (
    <CalendarIndexContext.Provider value={{ curDate, setCurDate, currentMonthText, setCurrentMonthText, resetDate, setResetDate }}>
      {children}
    </CalendarIndexContext.Provider>
  );
};

export function useCalendarIndex() {
  const ctx = useContext(CalendarIndexContext);
  if (!ctx) throw new Error('useCalendarIndex must be within DateProvider');
  return ctx;
}
