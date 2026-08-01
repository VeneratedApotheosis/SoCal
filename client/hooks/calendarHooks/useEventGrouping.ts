// hooks/useEventGrouping.ts
import { calculateAllDayLayouts, calculateTimedLayouts } from '@/utility/eventGroupingUtil';
import { EventObj } from '@/utility/types';
import { useMemo } from 'react';

export const useEventGrouping = (events: EventObj[], multiDayInHeader: boolean) => {
  return useMemo(() => {
    const timed: Record<string, { event: EventObj; startDate: Date; endDate: Date }[]> = {};
    const rawAllDayEvents: EventObj[] = [];

    // 1. Filter events into timed and allDay
    events.forEach((e) => {
      const isAllDay = e.allDay === true || String(e.allDay) === 'true';
      if (isAllDay) {
        rawAllDayEvents.push(e);
        return;
      }

      const start = new Date(e.startDate);
      let dateKey = start.toDateString();
      const end = e.endDate ? new Date(e.endDate) : new Date(e.startDate);

      if (multiDayInHeader && end.getTime() - start.getTime() > 86400000) {
        rawAllDayEvents.push(e);
        return;
      }

      const refEnd = new Date(end);
      refEnd.setDate(refEnd.getDate() - 1);
      const refStart = new Date(start);
      refStart.setHours(0, 0, 0, 0);

      // Edge Case: events spanning multiple days
      while (refStart.getTime() < refEnd.getTime()) {
        const endOfDay = new Date(start);
        endOfDay.setHours(23, 59, 59, 999);
        dateKey = start.toDateString();

        if (!timed[dateKey]) timed[dateKey] = [];
        timed[dateKey].push({
          event: e,
          startDate: new Date(start),
          endDate: new Date(endOfDay),
        });

        start.setDate(start.getDate() + 1);
        refStart.setDate(refStart.getDate() + 1);
        start.setHours(0, 0, 0, 0);
      }

      dateKey = start.toDateString();

      if (!timed[dateKey]) timed[dateKey] = [];
      timed[dateKey].push({
        event: e,
        startDate: new Date(start),
        endDate: end,
      });
    });

    // 2. Compute Layouts using Abstracted Helpers
    const { allDayWithLayout, extraLongAllday } = calculateAllDayLayouts(rawAllDayEvents);
    const timedWithLayout = calculateTimedLayouts(timed);

    return {
      groupedTimedEvents: timedWithLayout,
      groupedAllDayEvents: allDayWithLayout,
      extraLongAllday,
    };
  }, [events, multiDayInHeader]);
};

export const useWeeklyEventGrouping = (events: EventObj[], multiDayInHeader: boolean) => {
  return useMemo(() => {
    // Since useWeeklyEventGrouping seems to only care about all-day formatting in your original snippet,
    // we just pass all events through the all-day calculator.
    const { allDayWithLayout } = calculateAllDayLayouts(events);

    return { allDayWithLayout };
  }, [events, multiDayInHeader]);
};
