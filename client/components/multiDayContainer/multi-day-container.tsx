import { useEventGrouping } from '@/hooks/calendarHooks/useEventGrouping';
import { usePinchZoom } from '@/hooks/calendarHooks/usePinchZoom';
import {
  ALL_DAY_HEIGHT,
  BUFFER_INCREMENT,
  DATE_HEADER_HEIGHT,
  FETCH_INITIAL_BUFFER,
  HEADER_HEIGHT,
  HOUR_LABEL_WIDTH,
  PAST_BUFFER,
} from '@/utility/constants';
import { AllDayPool, CalendarView, EventObj, EventWithLayout } from '@/utility/types';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useCallback, useEffect, useRef, useState } from 'react';
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

import { getShortTimeZone } from '@/utility/timeZoneUtil';
import { useCalendarEvents } from '../contexts/calendar-events-context';
import { useCalendarIndex } from '../contexts/calendar-index-context';
import { useCalendarRange } from '../contexts/calendar-range-context';
import { useScreenSize } from '../contexts/screen-size-context';
import { useTimeZoneContext } from '../contexts/time-zone-context';
import { useUIContext } from '../contexts/ui-context';
import EventDetails from '../eventDetailsContainer/event-details';
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
  const { days } = useCalendarRange();
  const { currentMonthText, setCurrentMonthText, resetDate } = useCalendarIndex();
  const { timeZone } = useTimeZoneContext();
  const { theme } = useUIContext();
  const styles = theme.isDark ? darkStyles : lightStyles;

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useScreenSize();
  const GRID_WIDTH = SCREEN_WIDTH - HOUR_LABEL_WIDTH;

  const dividers = calendarType.num || 3;
  const dayWidth = Math.round(GRID_WIDTH / dividers);
  const [initialDayWidth] = useState<number>(dayWidth);
  const sharedDayWidth = useSharedValue(dayWidth);

  useEffect(() => {
    sharedDayWidth.value = dayWidth;
  }, [dayWidth, sharedDayWidth]);

  const { hourHeight } = usePinchZoom();

  const listRef = useAnimatedRef<FlashListRef<any>>();

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('JUMP_TO_TODAY', () => {
      if (listRef.current) {
        listRef.current.scrollToIndex({
          index: PAST_BUFFER - 1,
          animated: true,
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Events & Grouping
  const [displayedEvents, setDisplayedEvents] = useState<EventObj[]>(events);
  const pendingEventsRef = useRef<EventObj[]>(events);
  const [isScrollingJS, setIsScrollingJS] = useState(false);

  useEffect(() => {
    pendingEventsRef.current = events;
    if (!isScrollingJS) setDisplayedEvents(events);
  }, [events, isScrollingJS]);

  const { groupedTimedEvents, groupedAllDayEvents, extraLongAllday } = useEventGrouping(displayedEvents);

  // Event Details Modal
  const [eventDetailsVisible, setEventDetailsVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventObj | null>(null);

  const handlePress = useCallback(
    (event: EventObj | null, newEvent: boolean) => {
      if (eventDetailsVisible) {
        if (newEvent) {
          setSelectedEvent(event);
          setEventDetailsVisible(false);
        } else setSelectedEvent(event);
      } else {
        setSelectedEvent(event);
        setEventDetailsVisible(true);
      }
    },
    [eventDetailsVisible],
  );

  // Scroll Variables
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

  const webContainerRef = useRef<any>(null);
  useEffect(() => {
    if (Platform.OS !== 'web' || !webContainerRef.current) return;
    const node = webContainerRef.current;

    const handleWheel = (e: WheelEvent) => {
      const isHorizontalScroll = e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (isHorizontalScroll) return;

      const minScroll = -currentAllDayHeight.value;
      const maxScroll = hourHeight * 24 - SCREEN_HEIGHT + HEADER_HEIGHT + DATE_HEADER_HEIGHT;
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
      const minScroll = 0;
      const maxScroll = hourHeight * 24 - SCREEN_HEIGHT + HEADER_HEIGHT + DATE_HEADER_HEIGHT;
      scrollY.value = Math.max(minScroll, Math.min(contextY.value - event.translationY, maxScroll));
    })
    .onEnd((event) => {
      const minScroll = -currentAllDayHeight.value;
      const maxScroll = hourHeight * 24 - SCREEN_HEIGHT + HEADER_HEIGHT + DATE_HEADER_HEIGHT + currentAllDayHeight.value;
      scrollY.value = withDecay({
        velocity: -event.velocityY,
        clamp: [minScroll, maxScroll],
        deceleration: 0.99,
        reduceMotion: ReduceMotion.Never,
      });
    });

  // ─── Fetching and Month Changing ───────────────────────────────────────────────────────────

  const { fetchForward, fetchBackward } = useCalendarEvents();
  const localFetchStart = useRef(-FETCH_INITIAL_BUFFER);
  const localFetchEnd = useRef(FETCH_INITIAL_BUFFER);

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
          fetchForward(localFetchEnd.current);
        }
        if (currentIndex < localFetchStart.current) {
          localFetchStart.current -= BUFFER_INCREMENT;
          fetchBackward(localFetchStart.current);
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
        handlePress={handlePress}
        scrollY={scrollY}
        scrollX={scrollX}
        isVisible={eventDetailsVisible}
        selectedEventId={selectedEvent?.id ? selectedEvent?.id : null}
        currentAllDayHeight={currentAllDayHeight}
        eventPool={eventPool}
        widthsDictionary={widthsDictionary}
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
      selectedEvent,
      currentAllDayHeight,
      scrollX,
    ],
  );

  return (
    <View style={styles.container}>
      {/* --- FAILED ATTEMPT, WILL TRY LATER --- */}
      {/* {indices.map((__, index) => {
          return <AllDayPoolChip key={index} index={index} eventPool={eventPool} scrollX={scrollX} widthsDictionary={widthsDictionary} />;
        })} */}
      {/* <TextMeasurer extraLongAllday={extraLongAllday} setWidthsDictionary={setWidthsDictionary} widthsDictionary={widthsDictionary} /> */}
      <GestureDetector gesture={verticalPan}>
        <Animated.View ref={webContainerRef} style={{ flex: 1, overflow: 'visible' }}>
          {/* Hour Guide */}
          <View style={{ flex: 1, flexDirection: 'row', overflow: 'visible' }}>
            <View style={{ flexDirection: 'column' }}>
              <View style={[styles.timeZone, { height: hourHeight }]}>
                <Text style={styles.timeZoneText}>{getShortTimeZone(new Date(), timeZone)}</Text>
              </View>
              <Animated.View style={[animatedAllDayStyle, styles.allDay, { top: hourHeight }]}>
                <Text style={styles.allDayText}>All-Day</Text>
              </Animated.View>
              <Animated.View style={[animatedHourGuideStyle, { zIndex: 8 }]}>
                <HourGuide hourHeight={hourHeight} labelWidth={HOUR_LABEL_WIDTH} />
              </Animated.View>
            </View>
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
            />
          </View>
        </Animated.View>
      </GestureDetector>
      <EventDetails event={selectedEvent} isVisible={eventDetailsVisible} onClose={() => setEventDetailsVisible(false)} />
    </View>
  );
}
