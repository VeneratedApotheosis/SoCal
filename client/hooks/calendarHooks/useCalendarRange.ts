// hooks/calendarHooks/useCalendarRange.ts
import { BUFFER_INCREMENT, FUTURE_BUFFER, PAST_BUFFER } from '@/utility/constants';
import { addDays, startOfDay, subDays } from 'date-fns';
import { useCallback, useState } from 'react';

export const useCalendarRange = () => {
  // 1. init the days array 
  const [days, setDays] = useState<{date: Date}[]>(() => {
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

  //extend Days array by Buffer increment
  const extendFuture = useCallback(() => {
    setDays((prev) => {
      const lastDate = prev[prev.length - 1].date;
      const newDays = [];
      for (let i = 1; i <= BUFFER_INCREMENT; i++) {
        newDays.push({date: addDays(lastDate, i)})
      }
      return [...prev, ...newDays];
    })
  }, []);

  //extend Days array by decreasing buffer increment
  const extendPast = useCallback(() => {
    setDays((prev) => {
      const firstDate = prev[0].date;
      const newDays = [];
      for (let i = BUFFER_INCREMENT; i >= 1; i--) {
        newDays.push({ date: subDays(firstDate, i) });
      }
      return [...newDays, ...prev];
    });
    setPastDaysCount((prev) => prev + BUFFER_INCREMENT);
  }, []);

  return { days, extendFuture, extendPast, pastDaysCount, totalItems: days.length };
};