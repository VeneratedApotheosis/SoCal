// hooks/useEventGrouping.ts
import { EventObj, EventWithLayout } from '@/utility/types';

// ─── All Day Events Layout Manager ───────────────────────────────────────────────────────────

export const calculateAllDayLayouts = (rawAllDayEvents: EventObj[]) => {
  const allDayWithLayout: Record<string, EventWithLayout[]> = {};
  const extraLongAllday: EventObj[] = [];

  // Sort raw All-Day Events
  const sortedAllDayEvents = rawAllDayEvents.sort((a, b) => {
    const startA = new Date(a.startDate).getTime();
    const startB = new Date(b.startDate).getTime();
    const startDiff = startA - startB;

    if (startDiff === 0) {
      const endA = a.endDate ? new Date(a.endDate).getTime() : startA;
      const endB = b.endDate ? new Date(b.endDate).getTime() : startB;
      return endB - endA;
    }
    return startDiff;
  });

  // Helper Variables
  const globalAllDayLayouts: EventWithLayout[] = [];
  let currentAllDayCluster: EventObj[] = [];
  let allDayClusterEnd = 0;

  //Process Cluster, moving longest events to top and adding padding
  const processAllDayCluster = (cluster: EventObj[]) => {
    if (cluster.length === 0) return;

    const clusterLayouts: Omit<EventWithLayout, 'maxOffset'>[] = [];
    let currentMaxOffset = 0;

    cluster.forEach((currentEvent) => {
      const currentStart = new Date(currentEvent.startDate).getTime();
      const currentEnd = currentEvent.endDate ? new Date(currentEvent.endDate).getTime() : currentStart;

      const overlappingEvents = clusterLayouts.filter((placed) => {
        const placedStart = new Date(placed.startDate).getTime();
        const placedEnd = new Date(placed.endDate).getTime();
        return currentStart < placedEnd && currentEnd > placedStart;
      });

      const occupiedOffsets = overlappingEvents.map((e) => e.offset);
      let firstFreeOffset = 0;
      while (occupiedOffsets.includes(firstFreeOffset)) {
        firstFreeOffset++;
      }

      currentMaxOffset = Math.max(currentMaxOffset, firstFreeOffset);

      clusterLayouts.push({
        event: currentEvent,
        offset: firstFreeOffset,
        startDate: currentEvent.startDate,
        endDate: currentEvent.endDate,
        dummy: false,
      });
    });

    clusterLayouts.forEach((layout) => {
      globalAllDayLayouts.push({
        ...layout,
        maxOffset: currentMaxOffset,
      });
    });
  };

  // Create clusters and process
  sortedAllDayEvents.forEach((event) => {
    const start = new Date(event.startDate).getTime();
    const end = event.endDate ? new Date(event.endDate).getTime() : start;

    if (currentAllDayCluster.length === 0) {
      currentAllDayCluster.push(event);
      allDayClusterEnd = end;
    } else if (start < allDayClusterEnd) {
      currentAllDayCluster.push(event);
      allDayClusterEnd = Math.max(allDayClusterEnd, end);
    } else {
      processAllDayCluster(currentAllDayCluster);
      currentAllDayCluster = [event];
      allDayClusterEnd = end;
    }
  });
  processAllDayCluster(currentAllDayCluster);

  // Distribute globally positioned events into daily buckets
  globalAllDayLayouts.forEach((layout) => {
    const start = new Date(layout.startDate);
    let dateKey = start.toDateString();
    const end = layout.endDate ? new Date(layout.endDate) : new Date(layout.startDate);

    const refEnd = new Date(end);
    refEnd.setDate(refEnd.getDate() - 1);
    const refStart = new Date(start);
    refStart.setHours(0, 0, 0, 0);
    let added = false;

    // Distribute event across multiple days
    while (refStart.getTime() < refEnd.getTime()) {
      dateKey = start.toDateString();

      if (!allDayWithLayout[dateKey]) allDayWithLayout[dateKey] = [];
      allDayWithLayout[dateKey].push(layout);

      start.setDate(start.getDate() + 1);
      refStart.setDate(refStart.getDate() + 1);
      start.setHours(0, 0, 0, 0);

      if (!added) {
        extraLongAllday.push(layout.event);
        added = true;
      }
    }

    dateKey = start.toDateString();
    if (!allDayWithLayout[dateKey]) allDayWithLayout[dateKey] = [];
    allDayWithLayout[dateKey].push(layout);
  });

  // Sort by offset and insert dummy events for spacing
  Object.keys(allDayWithLayout).forEach((dateKey) => {
    const dayEvents = allDayWithLayout[dateKey];
    dayEvents.sort((a, b) => a.offset - b.offset);

    if (dayEvents.length === 0) return;

    const highestOffset = dayEvents[dayEvents.length - 1].offset;
    const paddedEvents: EventWithLayout[] = [];
    let eventIndex = 0;

    for (let currentOffset = 0; currentOffset <= highestOffset; currentOffset++) {
      const existingEvent = dayEvents[eventIndex];

      if (existingEvent && existingEvent.offset === currentOffset) {
        paddedEvents.push(existingEvent);
        eventIndex++;
      } else {
        const dummyDate = new Date(dateKey);
        paddedEvents.push({
          event: {} as EventObj,
          startDate: dummyDate,
          endDate: dummyDate,
          offset: currentOffset,
          maxOffset: highestOffset,
          dummy: true,
        });
      }
    }
    allDayWithLayout[dateKey] = paddedEvents;
  });

  return { allDayWithLayout, extraLongAllday };
};

// ─── Timed Events Layout Manager ───────────────────────────────────────────────────────────

export const calculateTimedLayouts = (timed: Record<string, { event: EventObj; startDate: Date; endDate: Date }[]>) => {
  const timedWithLayout: Record<string, EventWithLayout[]> = {};

  Object.keys(timed).forEach((dateKey) => {
    const dayEvents = timed[dateKey];

    // Sort this specific day's events chronologically
    const sortedDayEvents = dayEvents.sort((a, b) => {
      const startA = new Date(a.startDate).getTime();
      const startB = new Date(b.startDate).getTime();
      const startDiff = startA - startB;

      if (startDiff === 0) {
        const endA = new Date(a.endDate).getTime();
        const endB = new Date(b.endDate).getTime();
        return endB - endA;
      }
      return startDiff;
    });

    const resultsForDay: EventWithLayout[] = [];
    let currentCluster: { event: EventObj; startDate: Date; endDate: Date }[] = [];
    let clusterEnd = 0;

    //process each cluster and calculate the offsets necessary for each event
    const processCluster = (cluster: { event: EventObj; startDate: Date; endDate: Date }[]) => {
      if (cluster.length === 0) return;

      const clusterLayouts: Omit<EventWithLayout, 'maxOffset'>[] = [];
      let currentMaxOffset = 0;

      cluster.forEach((currentEvent) => {
        const overlappingEvents = clusterLayouts.filter((placed) => {
          return (
            new Date(currentEvent.startDate).getTime() < new Date(placed.event.endDate).getTime() &&
            new Date(currentEvent.endDate).getTime() > new Date(placed.event.startDate).getTime()
          );
        });

        const occupiedOffsets = overlappingEvents.map((e) => e.offset);
        let firstFreeOffset = 0;
        while (occupiedOffsets.includes(firstFreeOffset)) {
          firstFreeOffset++;
        }

        currentMaxOffset = Math.max(currentMaxOffset, firstFreeOffset);

        clusterLayouts.push({
          event: currentEvent.event,
          offset: firstFreeOffset,
          startDate: currentEvent.startDate,
          endDate: currentEvent.endDate,
          dummy: false,
        });
      });

      clusterLayouts.forEach((layout) => {
        resultsForDay.push({
          ...layout,
          maxOffset: currentMaxOffset,
        });
      });
    };

    sortedDayEvents.forEach((event) => {
      const start = new Date(event.startDate).getTime();
      const end = new Date(event.endDate).getTime();

      if (currentCluster.length === 0) {
        currentCluster.push(event);
        clusterEnd = end;
      } else if (start < clusterEnd) {
        currentCluster.push(event);
        clusterEnd = Math.max(clusterEnd, end);
      } else {
        processCluster(currentCluster);
        currentCluster = [event];
        clusterEnd = end;
      }
    });

    processCluster(currentCluster);
    timedWithLayout[dateKey] = resultsForDay;
  });

  return timedWithLayout;
};
