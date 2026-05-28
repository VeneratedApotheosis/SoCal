// calendar-events-context.tsx
import { FUTURE_BUFFER, PAST_BUFFER } from '@/utility/constants';
import { addDays, startOfDay, subDays } from 'date-fns';
import { createContext, ReactNode, useContext, useState } from 'react';

export interface RangeContextType {
  days: { date: Date }[];
  pastDaysCount: number;
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

  const [pastDaysCount, setPastDaysCount] = useState(PAST_BUFFER);

  return (
    <RangeContext.Provider
      value={{
        days,
        pastDaysCount,
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
