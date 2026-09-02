import { FlashList, FlashListRef } from '@shopify/flash-list';
import { addDays } from 'date-fns';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, DeviceEventEmitter, Platform, StyleSheet, Text, View } from 'react-native';
import { useAnimatedRef, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

import { useCalendarEvents } from '../contexts/calendar-events-context';
import { useCalendarIndex } from '../contexts/calendar-index-context';
import { useCalendarRange } from '../contexts/calendar-range-context';
import { useScreenSize } from '../contexts/screen-size-context';
import { useTimeZoneContext } from '../contexts/time-zone-context';
import { useUIContext } from '../contexts/ui-context';

import { BUFFER_INCREMENT, PAST_BUFFER, WEB_DRAWER_WIDTH, WEB_MUTED_PADDING, WEB_X_PADDING, WEB_Y_PADDING } from '@/utility/constants';
import { getPositionsFromPointer } from '@/utility/drawerUtil';
import { createEventObj } from '@/utility/eventUtils';
import { baseFlexStyles, getBasicThemeStyles, getBasicTypographyStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { CalendarView, EventObj } from '@/utility/types';

import { useWeeklyEventGrouping } from '@/hooks/calendarHooks/useEventGrouping';
import EventDetails from '../eventDetailsContainer/event-details';
import WebEventDetails, { webEventHeight, webEventWidth } from '../eventDetailsContainer/web-event-details';
import WeekBox from './week-container';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];

export default function MonthContainer({ calendarType, events }: { calendarType: CalendarView; events: EventObj[] }) {
  const { sundays } = useCalendarRange();
  const { currentMonthText, setCurrentMonthText, setCurrentYear } = useCalendarIndex();
  const { timeZone } = useTimeZoneContext();
  const { theme, sideBar, multiDayInHeader } = useUIContext();
  const styles = monthstyles(theme.isDark);
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, isWeb, headerHeight, fixedSidebar } = useScreenSize();

  // ─── Dimensions ───────────────────────────────────────────────────────────

  const GRID_HEIGHT = useMemo(() => {
    const rawHeight = SCREEN_HEIGHT - headerHeight;
    const webPadding = -1 * Number(isWeb) * WEB_Y_PADDING;
    return rawHeight + webPadding;
  }, [isWeb, SCREEN_WIDTH]);

  const rowNum = calendarType.weekNum || 5;
  const weekHeight = Math.floor(GRID_HEIGHT / rowNum);
  const sharedWeekHeight = useSharedValue(weekHeight);
  useEffect(() => {
    sharedWeekHeight.value = weekHeight;
  }, [weekHeight, sharedWeekHeight]);

  const listRef = useAnimatedRef<FlashListRef<any>>();
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('JUMP_TO_TODAY', () => {
      if (listRef.current) {
        listRef.current.scrollToIndex({
          index: Math.floor(PAST_BUFFER / 7 - rowNum / 2),
          animated: true,
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const dayWidth = useMemo(() => {
    const rawWidth = SCREEN_WIDTH;
    const webPadding = -1 * Number(isWeb) * WEB_X_PADDING;
    const sideBarPadding =
      fixedSidebar * Number(!(sideBar.isSidebarExpanded !== !sideBar.isSidebarLoading)) * (WEB_DRAWER_WIDTH + WEB_MUTED_PADDING);
    const output = Math.floor((rawWidth + webPadding - sideBarPadding) / 7);
    return output;
  }, [sideBar.isSidebarExpanded, sideBar.isSidebarLoading, SCREEN_WIDTH, isWeb]);

  // ─── Events ───────────────────────────────────────────────────────────

  const [displayedEvents, setDisplayedEvents] = useState<EventObj[]>(events);
  const pendingEventsRef = useRef<EventObj[]>(events);
  const [isScrollingJS, setIsScrollingJS] = useState(false);

  useEffect(() => {
    pendingEventsRef.current = events;
    if (!isScrollingJS) setDisplayedEvents(events);
  }, [events, isScrollingJS]);

  const { allDayWithLayout } = useWeeklyEventGrouping(displayedEvents, multiDayInHeader);

  // ─── Event Details Modal ───────────────────────────────────────────────────────────

  const [eventDetailsVisible, setEventDetailsVisible] = useState(false);
  const [webDetailsVisible, setWebDetailsVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventObj | null>(null);
  const [newEvent, setNewEvent] = useState<EventObj | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const handlePress = useCallback(
    (event: EventObj | null, newEvent: boolean, coords: { x: number; y: number } | { e: any }, dragCreate: boolean = false) => {
      if (eventDetailsVisible || webDetailsVisible) {
        if (newEvent) {
          setSelectedEvent(event);
          setEventDetailsVisible(false);
          setWebDetailsVisible(false);
          setNewEvent(null);
        } else {
          setSelectedEvent(event);
          setNewEvent(null);
          handleWebPress(coords);
        }
      } else {
        setSelectedEvent(event);
        if (isWeb) {
          setWebDetailsVisible(true);
          handleWebPress(coords);
          if (newEvent) setNewEvent(event);
          else setNewEvent(null);
        } else {
          setEventDetailsVisible(true);
          if (newEvent) setNewEvent(event);
          else setNewEvent(null);
        }
      }
    },
    [eventDetailsVisible, webDetailsVisible, isWeb],
  );

  useEffect(() => {
    if (!eventDetailsVisible && !webDetailsVisible) {
      setNewEvent(null);
    }
  }, [eventDetailsVisible, webDetailsVisible]);

  const handleWebPress = (coords: { x: number; y: number } | any) => {
    let { pageX, pageY } = { pageX: 0, pageY: 0 };
    if (coords && 'x' in coords) {
      pageX = coords.x;
      pageY = coords.y;
    } else {
      pageX = coords.nativeEvent.pageX;
      pageY = coords.nativeEvent.pageY;
    }

    getPositionsFromPointer(pageX, pageY, setMenuPos, webEventHeight, webEventWidth, SCREEN_WIDTH, SCREEN_HEIGHT);
  };

  const closeEventDetails = () => {
    setSelectedEvent(null);
    setEventDetailsVisible(false);
    setWebDetailsVisible(false);
    setNewEvent(null);
  };

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('CREATE_EVENT', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const draftEvent = createEventObj(
        {
          startDate: today,
          endDate: addDays(today, 1),
          title: '',
          allDay: true,
        },
        timeZone,
      );
      handlePress(draftEvent, true, { x: SCREEN_WIDTH / 2 - webEventWidth / 2, y: SCREEN_HEIGHT / 2 });
    });

    return () => {
      subscription.remove();
    };
  }, [handlePress, SCREEN_WIDTH, SCREEN_HEIGHT]);

  // ─── Scroll Variables ───────────────────────────────────────────────────────────

  const scrollY = useSharedValue<number>(Math.floor(PAST_BUFFER / 7 - rowNum / 2) * weekHeight); //fix to 13923.1015625
  const internalDayIndex = useRef(0);

  // ─── ScrollX Value Management ───────────────────────────────────────────────────────────

  useEffect(() => {
    scrollY.value = Math.floor(PAST_BUFFER / 7 - rowNum / 2) * weekHeight;
  }, [weekHeight]);

  //rmk: different from horizontal bc of some react compiler issue
  const scrollHandler =
    Platform.OS === 'web'
      ? (event: any) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }
      : useAnimatedScrollHandler({
          onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
          },
        });

  // ─── Fetch Foward and Backward ───────────────────────────────────────────────────────────

  const { fetchForward, fetchBackward } = useCalendarEvents();
  const localFetchStart = useRef(-1 * calendarType.weekNum * 7);
  const localFetchEnd = useRef(calendarType.weekNum * 7);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        const centerItem = viewableItems[Math.floor(viewableItems.length / 2)];
        if (!centerItem) return;

        const physicalY = centerItem.index;
        const currentIndex = Math.floor(physicalY - Math.floor(PAST_BUFFER / 7));

        if (currentIndex !== internalDayIndex.current) {
          internalDayIndex.current = currentIndex;
          const date = new Date();
          date.setHours(12, 0, 0, 0);
          date.setDate(date.getDate() + currentIndex * 7 + 3);
          setCurrentMonthText(MONTHS[date.getMonth()]);
          setCurrentYear(date.getFullYear());
        }

        if (currentIndex * 7 > localFetchEnd.current) {
          localFetchEnd.current += BUFFER_INCREMENT * 4;
          fetchForward(localFetchEnd.current, 4);
        }
        if (currentIndex * 7 < localFetchStart.current) {
          localFetchStart.current -= BUFFER_INCREMENT * 4;
          fetchBackward(localFetchStart.current, 4);
        }
      }
    },
    [currentMonthText, fetchForward, fetchBackward, rowNum],
  );

  // ─── Render Item ───────────────────────────────────────────────────────────

  const renderWeek = useCallback(
    ({ item }: any) => {
      const sundayDay: Date = item.date;

      const weekEvents = Array.from({ length: 7 }, (_, i) => {
        const tempDay = addDays(sundayDay, i);

        return {
          day: tempDay,
          event: allDayWithLayout[tempDay.toDateString()],
        };
      });

      let selectedId: string | null = null;

      if (selectedEvent) {
        for (const { event } of weekEvents) {
          if (event?.some((e) => e.event.id === selectedEvent.id)) {
            selectedId = selectedEvent.id;
            break;
          }
        }
      }

      return (
        <View style={{ flex: 1, flexDirection: 'row', height: weekHeight }}>
          <WeekBox
            day={sundayDay}
            weekHeight={weekHeight}
            events={weekEvents}
            handlePress={handlePress}
            newEvent={newEvent}
            selectedEventId={selectedId}
            dayWidth={dayWidth}
          />
        </View>
      );
    },
    [weekHeight, allDayWithLayout, handlePress, selectedEvent, newEvent, dayWidth],
  );

  return (
    <Animated.View style={{ flex: 1 }}>
      <View style={{ height: 24, flexDirection: 'row' }}>
        {DAYS_OF_WEEK.map((day, idx) => (
          <View
            key={idx}
            style={[
              styles.dateContainer,
              day === 'Sat' && [{ borderRightWidth: 1 }, styles.elevatedBackground],
              day === 'Sun' && styles.elevatedBackground,
              { width: dayWidth },
            ]}
          >
            <Text style={styles.dateText}>{day}</Text>
          </View>
        ))}
      </View>
      <AnimatedFlashList
        ref={listRef}
        onScroll={scrollHandler}
        style={styles.monthContainer}
        data={sundays}
        renderItem={renderWeek}
        onViewableItemsChanged={onViewableItemsChanged}
        keyExtractor={(item: any) => item.date.toISOString()}
        initialScrollIndex={internalDayIndex.current + Math.floor(PAST_BUFFER / 7 - rowNum / 2)}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        key={`timeline-width-${weekHeight}`}
      />
      <EventDetails event={selectedEvent} isVisible={eventDetailsVisible} onClose={() => setEventDetailsVisible(false)} />
      <WebEventDetails
        event={selectedEvent}
        isVisible={webDetailsVisible}
        onClose={closeEventDetails}
        top={menuPos.top}
        left={menuPos.left}
        setNewEvent={setNewEvent}
        newEvent={newEvent}
      />
    </Animated.View>
  );
}

const monthstyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    monthContainer: {
      flexDirection: 'column',
      ...baseTheme.background,
      flex: 1,
    },
    dateContainer: {
      borderLeftWidth: 1,
      ...baseTheme.border,
      ...baseFlexStyles.centerAll,
    },
    elevatedBackground: {
      backgroundColor: isDark ? COLORS.background.elevatedDark : COLORS.background.elevatedLight,
    },
    dateText: {
      ...baseText.body,
    },
  });
};
