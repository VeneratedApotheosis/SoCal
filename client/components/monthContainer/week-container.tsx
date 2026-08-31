import { EventObj, EventWithLayout } from '@/utility/types';
import { addDays } from 'date-fns';
import { memo, useMemo } from 'react';
import { View } from 'react-native';
import DayBox from './day-container';

export interface WeekBoxProps {
  events: { day: Date; event: EventWithLayout[] | undefined }[];
  day: Date;
  weekHeight: number;
  handlePress: (event: EventObj | null, newEvent: boolean, e: any) => void;
  newEvent: EventObj | null;
  selectedEventId: string | null;
  dayWidth: number;
}

function WeekBox({ day, weekHeight, events, handlePress, newEvent, selectedEventId, dayWidth }: WeekBoxProps) {
  const daysOfWeek = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(day, i));
  }, [day]);

  const getEvent = (day: Date): EventWithLayout[] => {
    const foundEvents = events.find((e) => e.day.getTime() === day.getTime());
    if (foundEvents && foundEvents.event) return foundEvents.event;
    else return [];
  };

  return (
    <>
      {daysOfWeek.map((dayItem) => (
        <View style={{ height: weekHeight, width: dayWidth }} key={dayItem.toISOString()}>
          <DayBox
            day={dayItem}
            weekHeight={weekHeight}
            dayWidth={dayWidth}
            event={getEvent(dayItem)}
            handlePress={handlePress}
            newEvent={newEvent}
            selectedEventId={selectedEventId}
          />
        </View>
      ))}
    </>
  );
}

export default memo(WeekBox, (prev, next) => {
  return (
    prev.day.getTime() === next.day.getTime() &&
    prev.weekHeight === next.weekHeight &&
    prev.events === next.events &&
    prev.handlePress === next.handlePress &&
    prev.newEvent === next.newEvent &&
    prev.selectedEventId === next.selectedEventId
  );
});
