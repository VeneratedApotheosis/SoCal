import { WEB_DRAWER_WIDTH, WEB_MUTED_PADDING, WEB_X_PADDING } from '@/utility/constants';
import { EventWithLayout } from '@/utility/types';
import { addDays } from 'date-fns';
import { useLayoutEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useScreenSize } from '../contexts/screen-size-context';
import { useUIContext } from '../contexts/ui-context';
import DayBox from './day-container';

export interface WeekBoxProps {
  events: { day: Date; event: EventWithLayout[] | undefined }[];
  day: Date;
  weekHeight: number;
}

export default function WeekBox({ day, weekHeight, events }: WeekBoxProps) {
  const { theme, sideBar, multiDayInHeader } = useUIContext();
  const { width: SCREEN_WIDTH, isWeb, fixedSidebar } = useScreenSize();
  const dayWidth = useMemo(() => {
    const rawWidth = SCREEN_WIDTH + 1;
    const webPadding = -1 * Number(isWeb) * WEB_X_PADDING;
    const sideBarPadding =
      fixedSidebar * Number(!(sideBar.isSidebarExpanded !== !sideBar.isSidebarLoading)) * (WEB_DRAWER_WIDTH + WEB_MUTED_PADDING);
    return Math.ceil((rawWidth + webPadding - sideBarPadding) / 7);
  }, [sideBar.isSidebarExpanded, sideBar.isSidebarLoading, SCREEN_WIDTH, isWeb]);

  const [daysOfWeek, setDaysOfWeek] = useState<Date[]>([]);

  //create a list of days in the week
  useLayoutEffect(() => {
    const tempDays = [];
    for (let i = 0; i < 7; i++) {
      const tempDay = addDays(day, i);
      tempDays.push(tempDay);
      setDaysOfWeek(tempDays);
    }
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
          <DayBox day={dayItem} weekHeight={weekHeight} dayWidth={dayWidth} event={getEvent(dayItem)} />
        </View>
      ))}
    </>
  );
}
