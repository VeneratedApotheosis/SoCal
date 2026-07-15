// calendar-events-context.tsx
import { FUTURE_BUFFER, PAST_BUFFER } from '@/utility/constants';
import { addDays, setDate, startOfDay, startOfWeek, subDays } from 'date-fns';
import { createContext, ReactNode, useContext, useState } from 'react';

export interface RangeContextType {
  days: { date: Date }[];
  pastDaysCount: number;
  sundays: { date: Date }[];
}

export const RangeContext = createContext<RangeContextType>({} as RangeContextType);

export const RangeProvider = ({ children }: { children: ReactNode }) => {
  const [days, setDays] = useState<{ date: Date }[]>(() => {
    const today = startOfDay(new Date());
    const start = subDays(today, PAST_BUFFER);
    const end = addDays(today, FUTURE_BUFFER);
    const range = [];
    let current = start;
    while (current.getTime() <= end.getTime()) {
      range.push({ date: current });
      current = addDays(current, 1);
    }
    return range;
  });

  const [sundays, setSundays] = useState<{ date: Date }[]>(() => {
    const today = startOfDay(new Date());

    // 15th of the current month
    const fifteenthOfMonth = setDate(today, 15);
    const middleSunday = startOfWeek(fifteenthOfMonth, { weekStartsOn: 0 });

    const weeksPast = Math.floor(PAST_BUFFER / 7);
    const weeksFuture = Math.floor(FUTURE_BUFFER / 7);

    const start = subDays(middleSunday, weeksPast * 7);
    const end = addDays(middleSunday, weeksFuture * 7);

    const range = [];
    let current = start;
    while (current.getTime() <= end.getTime()) {
      range.push({ date: current });
      current = addDays(current, 7);
    }

    return range;
  });

  const [pastDaysCount, setPastDaysCount] = useState(PAST_BUFFER);

  return (
    <RangeContext.Provider
      value={{
        days,
        pastDaysCount,
        sundays,
      }}
    >
      {children}
    </RangeContext.Provider>
  );
};

export function useCalendarRange() {
  const ctx = useContext(RangeContext);
  if (!ctx) throw new Error('useCalendarRange must be within DateProvider');
  return ctx;
}
