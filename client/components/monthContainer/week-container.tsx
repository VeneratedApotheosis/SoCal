import { WEB_DRAWER_WIDTH, WEB_MUTED_PADDING, WEB_X_PADDING } from '@/utility/constants';
import { EventObj, EventWithLayout } from '@/utility/types';
import { addDays } from 'date-fns';
import { memo, useMemo } from 'react';
import { View } from 'react-native';
import { useScreenSize } from '../contexts/screen-size-context';
import { useUIContext } from '../contexts/ui-context';
import DayBox from './day-container';

export interface WeekBoxProps {
  events: { day: Date; event: EventWithLayout[] | undefined }[];
  day: Date;
  weekHeight: number;
  handlePress: (event: EventObj | null, newEvent: boolean, e: any) => void;
  newEvent: EventObj | null;
  selectedEventId: string | null;
}

function WeekBox({ day, weekHeight, events, handlePress, newEvent, selectedEventId }: WeekBoxProps) {
  const { sideBar } = useUIContext();
  const { width: SCREEN_WIDTH, isWeb, fixedSidebar } = useScreenSize();
  const dayWidth = useMemo(() => {
    const rawWidth = SCREEN_WIDTH + 1;
    const webPadding = -1 * Number(isWeb) * WEB_X_PADDING;
    const sideBarPadding =
      fixedSidebar * Number(!(sideBar.isSidebarExpanded !== !sideBar.isSidebarLoading)) * (WEB_DRAWER_WIDTH + WEB_MUTED_PADDING);
    return Math.ceil((rawWidth + webPadding - sideBarPadding) / 7);
  }, [sideBar.isSidebarExpanded, sideBar.isSidebarLoading, SCREEN_WIDTH, isWeb]);

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
        <View style={{ flex: 1, height: weekHeight }} key={dayItem.toISOString()}>
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
