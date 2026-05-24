// hooks/useEventGrouping.ts
import { EventObj, EventWithOffset } from '@/utility/types';
import { useMemo } from 'react';

export const useEventGrouping = (events: EventObj[]) => {
  return useMemo(() => {
    const timed: Record<string, EventObj[]> = {};
    const allDay: Record<string, EventObj[]> = {};
    const timedWithLayout: Record<string, EventWithOffset[]> = {};
    
    events.forEach((e) => {
      // Opt for string splitting or lightweight parsing if startDate is ISO string
      const dateKey = new Date(e.startDate).toDateString(); 
      const isAllDay = e.allDay === true || String(e.allDay) === 'true';
    
      if (isAllDay) {
        //all day events added to allDay Record
        if (!allDay[dateKey]) allDay[dateKey] = [];
        allDay[dateKey].push(e);
      } else {
        //timed events added to timedRecord
        const dateKey = new Date(e.startDate).toDateString();
        if (!timed[dateKey]) timed[dateKey] = [];
        timed[dateKey].push(e);
      }
    });

    //gemini magic
    Object.keys(timed).forEach((dateKey) => {
      const dayEvents = timed[dateKey];
      
      // Sort this specific day's events chronologically
      const sortedDayEvents = dayEvents.sort((a, b) => {
        const startA = new Date(a.startDate).getTime();
        const startB = new Date(b.startDate).getTime();
        const startDiff = startA - startB;

        // If the start times are exactly the same...
        if (startDiff === 0) {
          const endA = new Date(a.endDate).getTime();
          const endB = new Date(b.endDate).getTime();
          
          // ...sort by end time in DESCENDING order (longest event goes first)
          return endB - endA; 
        }

        // Otherwise, sort chronologically by start time
        return startDiff;
      });

      const resultsForDay: EventWithOffset[] = [];
      let currentCluster: EventObj[] = [];
      let clusterEnd = 0;

      const processCluster = (cluster: EventObj[]) => {
        if (cluster.length === 0) return;

        const clusterLayouts: Omit<EventWithOffset, 'maxOffset'>[] = [];
        let currentMaxOffset = 0;

        // 1. Calculate offsets just like you were doing before, but scoped to the cluster
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

          // Keep track of the highest offset used in this specific cluster
          currentMaxOffset = Math.max(currentMaxOffset, firstFreeOffset);

          clusterLayouts.push({
            event: currentEvent,
            offset: firstFreeOffset,
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
      // Start the first cluster
      currentCluster.push(event);
      clusterEnd = end;
    } else if (start < clusterEnd) {
      // The event starts before the cluster ends, so it belongs in this cluster
      currentCluster.push(event);
      // Extend the cluster's end time if this event ends later than previous ones
      clusterEnd = Math.max(clusterEnd, end);
    } else {
      // No overlap! The current cluster is completely finished.
      processCluster(currentCluster);
      
      // Start a brand new cluster with this event
      currentCluster = [event];
      clusterEnd = end;
    }
  });

  // Don't forget to process the very last cluster after the loop finishes!
    processCluster(currentCluster);
      timedWithLayout[dateKey] = resultsForDay;
    });

    return { groupedTimedEvents: timedWithLayout, groupedAllDayEvents: allDay };
  }, [events]);
};

