import { useEventGrouping } from '@/hooks/calendarHooks/useEventGrouping';
import {
  ALL_DAY_HEIGHT,
  BUFFER_INCREMENT,
  DATE_HEADER_HEIGHT,
  HOUR_LABEL_WIDTH,
  PAST_BUFFER,
  WEB_DATE_HEADER_PADDING,
  WEB_DRAWER_WIDTH,
  WEB_MUTED_PADDING,
  WEB_X_PADDING,
  WEB_Y_PADDING,
} from '@/utility/constants';
import { AllDayPool, CalendarView, EventObj, EventWithLayout } from '@/utility/types';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DeviceEventEmitter, Platform, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  ReduceMotion,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDecay,
  withTiming,
} from 'react-native-reanimated';

import { getPositionsFromPointer } from '@/utility/drawerUtil';
import { createEventObj } from '@/utility/eventUtils';
import { getShortTimeZone } from '@/utility/timeZoneUtil';
import { addDays, set } from 'date-fns';
import { scheduleOnRN } from 'react-native-worklets';
import { useCalendarEvents } from '../contexts/calendar-events-context';
import { useCalendarIndex } from '../contexts/calendar-index-context';
import { useCalendarRange } from '../contexts/calendar-range-context';
import { useHourHeightContext } from '../contexts/hour-height-context';
import { useScreenSize } from '../contexts/screen-size-context';
import { useTimeZoneContext } from '../contexts/time-zone-context';
import { useUIContext } from '../contexts/ui-context';
import EventDetails from '../eventDetailsContainer/event-details';
import WebEventDetails, { webEventHeight, webEventWidth } from '../eventDetailsContainer/web-event-details';
import DayContainer from './day-container';
import HourGuide from './hour-guide';
import { getCalendarGridStyles } from './multiDayStyles';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);
const EMPTY_EVENTS: EventWithLayout[] = [];
const EMPTY_ALL_DAY: EventObj[] = [];
const lightStyles = getCalendarGridStyles(false);
const darkStyles = getCalendarGridStyles(true);
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const emptyPool = Array(10).fill({ isActive: false, eventId: '', name: '', color: '', offset: 0, length: 0 });

export default function MultiDayContainer({ calendarType, events }: { calendarType: CalendarView; events: EventObj[] }) {
  // contexts
  const { days } = useCalendarRange();
  const { currentMonthText, setCurrentMonthText, resetDate } = useCalendarIndex();
  const { timeZone } = useTimeZoneContext();
  const { theme, sideBar, multiDayInHeader } = useUIContext();
  const styles = theme.isDark ? darkStyles : lightStyles;

  // ─── Dimensions ───────────────────────────────────────────────────────────

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, isWeb, fixedSidebar, headerHeight } = useScreenSize();

  const GRID_WIDTH = useMemo(() => {
    const rawWidth = SCREEN_WIDTH - HOUR_LABEL_WIDTH + 1;
    const webPadding = -1 * Number(isWeb) * WEB_X_PADDING;
    const sideBarPadding =
      fixedSidebar * Number(!(sideBar.isSidebarExpanded !== !sideBar.isSidebarLoading)) * (WEB_DRAWER_WIDTH + WEB_MUTED_PADDING);
    return rawWidth + webPadding - sideBarPadding;
  }, [sideBar.isSidebarExpanded, sideBar.isSidebarLoading, SCREEN_WIDTH, isWeb]);

  const dividers = calendarType.num || 3;
  const dayWidth = Math.round(GRID_WIDTH / dividers);
  const [initialDayWidth] = useState<number>(dayWidth);
  const sharedDayWidth = useSharedValue(dayWidth);
  useEffect(() => {
    sharedDayWidth.value = dayWidth;
  }, [dayWidth, sharedDayWidth]);

  const { hourHeight } = useHourHeightContext();

  const listRef = useAnimatedRef<FlashListRef<any>>();
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('JUMP_TO_TODAY', () => {
      if (listRef.current) {
        listRef.current.scrollToIndex({
          index: PAST_BUFFER - Math.floor(dividers / 2),
          animated: true,
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [dividers]);

  // ─── Events ───────────────────────────────────────────────────────────

  const [displayedEvents, setDisplayedEvents] = useState<EventObj[]>(events);
  const pendingEventsRef = useRef<EventObj[]>(events);
  const [isScrollingJS, setIsScrollingJS] = useState(false);

  useEffect(() => {
    pendingEventsRef.current = events;
    if (!isScrollingJS) setDisplayedEvents(events);
  }, [events, isScrollingJS]);

  const { groupedTimedEvents, groupedAllDayEvents } = useEventGrouping(displayedEvents, multiDayInHeader);

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
          startDate: addDays(today, Math.floor(scrollX.value / dayWidth + dividers / 2) - PAST_BUFFER),
          endDate: addDays(today, Math.floor(scrollX.value / dayWidth + dividers / 2) - PAST_BUFFER + 1),
          title: '',
          allDay: true,
        },
        timeZone,
      );
      console.log('CREATING EVENT');
      handlePress(draftEvent, true, { x: SCREEN_WIDTH / 2 - webEventWidth / 2, y: SCREEN_HEIGHT / 2 });
    });

    return () => {
      subscription.remove();
    };
  }, [handlePress, SCREEN_WIDTH, SCREEN_HEIGHT, dayWidth, dividers]);

  // ─── Scroll Variables ───────────────────────────────────────────────────────────

  const scrollX = useSharedValue<number>(initialDayWidth * PAST_BUFFER);
  const scrollY = useSharedValue<number>(0);
  const contextY = useSharedValue<number>(0);
  const nativeRef = useRef(Gesture.Native());
  const internalDayIndex = useRef(0);

  const eventPool = useSharedValue<AllDayPool[]>(emptyPool);
  const [widthsDictionary, setWidthsDictionary] = useState<Record<string, number>>({});

  // ─── All Day Heights Logic ───────────────────────────────────────────────────────────

  const allDayHeights = useSharedValue<number[]>([]);
  // Precompute All Day Heights
  useEffect(() => {
    const baseCounts = days.map((day) => (groupedAllDayEvents[day.date.toDateString()]?.length || 0) + 1);
    const rollingMax = baseCounts.map((_, i, arr) => {
      let m = 1;
      for (let j = Math.max(0, i - Math.floor(dividers / 2)); j <= Math.min(arr.length - 1, i + (2 + Math.floor(dividers / 2))); j++) {
        m = Math.max(m, arr[j]);
      }
      return m * ALL_DAY_HEIGHT;
    });
    allDayHeights.value = rollingMax;
  }, [days, groupedAllDayEvents, allDayHeights, calendarType.num]);

  const currentAllDayHeight = useDerivedValue(() => {
    const index = Math.max(0, Math.min(Math.round(scrollX.value / sharedDayWidth.value), allDayHeights.value.length - 1));
    return allDayHeights.value[index] ?? ALL_DAY_HEIGHT;
  });

  // ─── Vertical SCroll ───────────────────────────────────────────────────────────

  const maxScrollLimit = (isWeb: number, hourHeight: number): number => {
    return (
      hourHeight * (isWeb ? 24 : 25) -
      SCREEN_HEIGHT +
      headerHeight +
      DATE_HEADER_HEIGHT +
      isWeb * (WEB_Y_PADDING + WEB_DATE_HEADER_PADDING * 2)
    );
  };

  const webContainerRef = useRef<any>(null);
  useEffect(() => {
    if (Platform.OS !== 'web' || !webContainerRef.current) return;
    const node = webContainerRef.current;

    const handleWheel = (e: WheelEvent) => {
      const isHorizontalScroll = e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (isHorizontalScroll) return;

      const minScroll = -currentAllDayHeight.value;
      const maxScroll = maxScrollLimit(isWeb, hourHeight);
      scrollY.value = Math.max(minScroll, Math.min(scrollY.value + e.deltaY, maxScroll));
    };

    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      node.removeEventListener('wheel', handleWheel);
    };
  }, [hourHeight]);

  const verticalPan = Gesture.Pan()
    .simultaneousWithExternalGesture(nativeRef)
    .shouldCancelWhenOutside(false)
    .activeOffsetY([-15, 15])
    .failOffsetX([-15, 15])
    .onStart(() => {
      cancelAnimation(scrollY);
      contextY.value = scrollY.value;
    })
    .onUpdate((event) => {
      const minScroll = -currentAllDayHeight.value;
      const maxScroll = maxScrollLimit(isWeb, hourHeight);
      scrollY.value = Math.max(minScroll, Math.min(contextY.value - event.translationY, maxScroll));
    })
    .onEnd((event) => {
      const minScroll = -currentAllDayHeight.value;
      const maxScroll = maxScrollLimit(isWeb, hourHeight);
      scrollY.value = withDecay({
        velocity: -event.velocityY,
        clamp: [minScroll, maxScroll],
        deceleration: 0.99,
        reduceMotion: ReduceMotion.Never,
      });
    });

  // ─── Web Click and Drag ───────────────────────────────────────────────────────────

  const isDraggingCreate = useSharedValue<boolean>(false);
  const dragStartDayIdx = useSharedValue<number>(-1);
  const dragStartMins = useSharedValue<number>(0);
  const dragCurrentDayIdx = useSharedValue<number>(-1);
  const dragCurrentMins = useSharedValue<number>(0);

  // Capture final pointer offsets to place the creation menu
  const dragEndPageX = useSharedValue<number>(0);
  const dragEndPageY = useSharedValue<number>(0);

  const createEventGesture = Gesture.Pan()
    .activateAfterLongPress(500) //note, matches press time for day container
    .onStart((e) => {
      if (eventDetailsVisible || webDetailsVisible) return;
      // Calculate Day Index (Horizontal Axis)
      const relativeX = e.x;
      const absoluteGridX = relativeX + scrollX.value;
      const targetDayIdx = Math.floor(absoluteGridX / dayWidth);

      // Calculate Minutes (Vertical Axis)
      const headerOffset = DATE_HEADER_HEIGHT + (isWeb ? WEB_DATE_HEADER_PADDING * 2 : 0);
      const relativeY = e.y - headerOffset;
      const absoluteGridY = relativeY + scrollY.value;
      if (absoluteGridY < 0) return; //not on grid
      const targetMins = (absoluteGridY / hourHeight) * 60;

      // Snap to nearest 15 minutes
      const snappedMins = Math.max(0, Math.min(Math.floor(targetMins / 15) * 15, 24 * 60));

      dragStartDayIdx.value = targetDayIdx;
      dragStartMins.value = snappedMins;
      dragCurrentDayIdx.value = targetDayIdx;
      dragCurrentMins.value = snappedMins;
      isDraggingCreate.value = true;
    })
    .onUpdate((e) => {
      if (!isDraggingCreate.value) return;

      // Horizontal changes (not used; might delete later)
      const relativeX = Math.min(dayWidth * dividers, Math.max(0, e.x - HOUR_LABEL_WIDTH));
      const absoluteGridX = relativeX + scrollX.value;
      const targetDayIdx = Math.floor(absoluteGridX / dayWidth);

      // Vertical changes
      const headerOffset = DATE_HEADER_HEIGHT + (isWeb ? WEB_DATE_HEADER_PADDING * 2 : 0);
      const relativeY = e.y - headerOffset;
      const absoluteGridY = relativeY + scrollY.value;
      const targetMins = (absoluteGridY / hourHeight) * 60;
      const snappedMins = Math.max(0, Math.min(Math.floor(targetMins / 15) * 15, 24 * 60));

      // Constrain inside bounds of the current dataset array length
      dragCurrentDayIdx.value = Math.max(0, targetDayIdx);
      dragCurrentMins.value = snappedMins;

      // Track pointer positions for menu placement
      dragEndPageX.value = e.absoluteX;
      dragEndPageY.value = e.absoluteY;
    })
    .onFinalize((e) => {
      if (!isDraggingCreate.value) return;
      isDraggingCreate.value = false;

      const endX = e.absoluteX;
      const endY = e.absoluteY;

      const baseDate = addDays(new Date(), dragStartDayIdx.value - PAST_BUFFER);
      const startDate = set(baseDate, {
        hours: Math.floor(Math.min(dragStartMins.value, dragCurrentMins.value) / 60),
        minutes: Math.floor(Math.min(dragStartMins.value, dragCurrentMins.value) % 60),
        seconds: 0,
        milliseconds: 0,
      });
      const endDate = set(baseDate, {
        hours: Math.floor(Math.max(dragStartMins.value, dragCurrentMins.value) / 60),
        minutes: Math.floor(Math.max(dragStartMins.value, dragCurrentMins.value) % 60),
        seconds: 0,
        milliseconds: 0,
      });

      const draftEvent = createEventObj(
        {
          startDate: startDate,
          endDate: endDate,
          title: '',
        },
        timeZone,
      );

      scheduleOnRN(() => {
        handlePress(draftEvent, true, { x: endX, y: endY }, true);
      });
    });

  const finalGesture = isWeb ? createEventGesture : verticalPan;

  // ─── Fetching and Month Changing ───────────────────────────────────────────────────────────

  const { fetchForward, fetchBackward } = useCalendarEvents();
  //the limits to what will trigger a fetch. NOT THE SAME AS THE LIMITS FETCHED
  const localFetchStart = useRef(-BUFFER_INCREMENT);
  const localFetchEnd = useRef(BUFFER_INCREMENT);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        const centerItem = viewableItems[Math.floor(viewableItems.length / 2)];
        if (!centerItem) return;

        const physicalX = centerItem.index;
        const currentIndex = Math.floor(physicalX - PAST_BUFFER);

        if (currentIndex !== internalDayIndex.current) {
          internalDayIndex.current = currentIndex;
          const date = new Date();
          date.setHours(12, 0, 0, 0);
          date.setDate(date.getDate() + currentIndex);
          setCurrentMonthText(MONTHS[date.getMonth()]);
        }

        if (currentIndex > localFetchEnd.current) {
          localFetchEnd.current += BUFFER_INCREMENT;
          fetchForward(localFetchEnd.current, 1);
        }
        if (currentIndex < localFetchStart.current) {
          localFetchStart.current -= BUFFER_INCREMENT;
          fetchBackward(localFetchStart.current, 1);
        }
      }
    },
    [currentMonthText, fetchForward, fetchBackward],
  );

  // ─── ScrollX Value Management ───────────────────────────────────────────────────────────

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  // ─── AnimatedStyles, day rendering ───────────────────────────────────────────────────────────

  const animatedHourGuideStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -scrollY.value }] }));
  const animatedAllDayStyle = useAnimatedStyle(() => ({ height: withTiming(currentAllDayHeight.value, { duration: 250 }) }));

  const renderDay = useCallback(
    ({ item }: any) => (
      <DayContainer
        day={item.date}
        dayWidth={dayWidth}
        eventsWithLayout={groupedTimedEvents[item.date.toDateString()] ?? EMPTY_EVENTS}
        allDayEvents={groupedAllDayEvents[item.date.toDateString()] ?? EMPTY_ALL_DAY}
        hourHeight={hourHeight}
        scrollY={scrollY}
        currentAllDayHeight={currentAllDayHeight}
        handlePress={handlePress}
        newEvent={newEvent}
        selectedEventId={selectedEvent?.id ? selectedEvent?.id : null}
        isVisible={eventDetailsVisible || webDetailsVisible}
        dragStartDayIdx={dragStartDayIdx}
        dragStartMin={dragStartMins}
        dragCurrentDayMin={dragCurrentMins}
        isDraggingCreate={isDraggingCreate}
      />
    ),
    [
      dayWidth,
      groupedTimedEvents,
      groupedAllDayEvents,
      hourHeight,
      handlePress,
      scrollY,
      eventDetailsVisible,
      webDetailsVisible,
      selectedEvent,
      currentAllDayHeight,
      newEvent,
    ],
  );

  return (
    <View
      style={[
        styles.container,
        {
          height: SCREEN_HEIGHT - headerHeight - isWeb * WEB_Y_PADDING,
        },
      ]}
    >
      {/* --- FAILED ATTEMPT, WILL TRY LATER --- */}
      {/* {indices.map((__, index) => {
          return <AllDayPoolChip key={index} index={index} eventPool={eventPool} scrollX={scrollX} widthsDictionary={widthsDictionary} />;
        })} */}
      {/* <TextMeasurer extraLongAllday={extraLongAllday} setWidthsDictionary={setWidthsDictionary} widthsDictionary={widthsDictionary} /> */}
      {/* Hour Guide */}
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          overflow: 'hidden',
        }}
      >
        <View style={styles.sideBarContainer}>
          <View style={[styles.timeZone, { height: DATE_HEADER_HEIGHT + isWeb * WEB_DATE_HEADER_PADDING * 2 }]}>
            <Text style={styles.timeZoneText}>{getShortTimeZone(new Date(), timeZone)}</Text>
          </View>
          <Animated.View style={[animatedAllDayStyle, styles.allDay, { top: DATE_HEADER_HEIGHT + isWeb * WEB_DATE_HEADER_PADDING * 2 }]}>
            <Text style={styles.allDayText}>All-Day</Text>
          </Animated.View>
          <Animated.View style={[animatedHourGuideStyle, { zIndex: 8 }]}>
            <HourGuide hourHeight={hourHeight} labelWidth={HOUR_LABEL_WIDTH} />
          </Animated.View>
        </View>
        <GestureDetector gesture={finalGesture}>
          <Animated.View ref={webContainerRef} style={{ flex: 1, overflow: 'visible' }}>
            {/* Flahlist*/}
            <AnimatedFlashList
              ref={listRef}
              data={days}
              horizontal
              scrollEnabled={true}
              onScroll={scrollHandler}
              onScrollBeginDrag={() => setIsScrollingJS(true)}
              onMomentumScrollEnd={() => setIsScrollingJS(false)}
              onViewableItemsChanged={onViewableItemsChanged}
              scrollEventThrottle={16}
              keyExtractor={(item: any) => item.date.toISOString()}
              style={{ width: GRID_WIDTH }}
              initialScrollIndex={internalDayIndex.current + PAST_BUFFER - Math.floor(dividers / 2)}
              renderItem={renderDay}
              showsHorizontalScrollIndicator={false}
              key={`timeline-width-${dayWidth}`}
              snapToAlignment={'start'}
            />
          </Animated.View>
        </GestureDetector>
      </View>
      <EventDetails
        event={selectedEvent}
        isVisible={eventDetailsVisible}
        onClose={() => setEventDetailsVisible(false)}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
      />
      <WebEventDetails
        event={selectedEvent}
        isVisible={webDetailsVisible}
        onClose={closeEventDetails}
        top={menuPos.top}
        left={menuPos.left}
        setNewEvent={setNewEvent}
        newEvent={newEvent}
      />
    </View>
  );
}
