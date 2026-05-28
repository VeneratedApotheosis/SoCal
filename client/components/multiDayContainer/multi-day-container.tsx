import { useEventGrouping } from '@/hooks/calendarHooks/useEventGrouping';
import { usePinchZoom } from '@/hooks/calendarHooks/usePinchZoom';
import {
  ALL_DAY_HEIGHT,
  BUFFER_INCREMENT,
  DATE_HEADER_HEIGHT,
  GRID_COLOR,
  GRID_WIDTH,
  HEADER_HEIGHT,
  HOUR_LABEL_WIDTH,
  PAST_BUFFER,
} from '@/utility/constants';
import { COLORS, FONT_WEIGHTS, SIZES } from '@/utility/theme';
import { CalendarView, EventObj, EventWithOffset } from '@/utility/types';
import { SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  ReduceMotion,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useCalendarIndex } from '../contexts/calendar-index-context';

import EventDetails from '../eventDetailsContainer/event-details';
import DayContainer from './day-container';
import HourGuide from './hour-guide';

import { useCalendarEvents } from '../contexts/calendar-events-context';
import { useCalendarRange } from '../contexts/calendar-range-context';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);
const EMPTY_EVENTS: EventWithOffset[] = [];
const EMPTY_ALL_DAY: EventObj[] = [];

export default function MultiDayContainer({ calendarType, events }: { calendarType: CalendarView; events: EventObj[] }) {
  const dividers = parseInt(calendarType) || 3;
  const dayWidth = Math.round(GRID_WIDTH / dividers);
  const { hourHeight, pinchGesture } = usePinchZoom();

  // calendarIndex
  const listRef = useAnimatedRef<FlashListRef<any>>();
  const { setDayWidth, fetchStart, fetchEnd } = useCalendarIndex();
  useLayoutEffect(() => {
    setDayWidth(dayWidth);
    updateAllDayHeaderHeight(scrollX.value / dayWidth);
  }, [dayWidth, setDayWidth]);

  //Events
  const [displayedEvents, setDisplayedEvents] = useState<EventObj[]>(events);
  const pendingEventsRef = useRef<EventObj[]>(events);
  useEffect(() => {
    pendingEventsRef.current = events;
    if (!isScrolling.value) {
      setDisplayedEvents(events);
    }
  }, [events]);
  const flushPendingEvents = () => {
    setDisplayedEvents(pendingEventsRef.current);
  };
  const { groupedTimedEvents, groupedAllDayEvents } = useEventGrouping(displayedEvents);
  const groupedAllDayEventsRef = useRef(groupedAllDayEvents);
  groupedAllDayEventsRef.current = groupedAllDayEvents;

  //other stuff?
  const { fetchForward, fetchBackward } = useCalendarEvents();
  const { days, pastDaysCount } = useCalendarRange();
  const [maxAllDayEvents, setMaxAllDayEvents] = useState(1);

  const [selectedEvent, setSelectedEvent] = useState<EventObj | null>(null);
  const [eventDetailsVisible, setEventDetailsVisible] = useState(false);

  const handlePress = (event: EventObj | null, newEvent: boolean) => {
    if (eventDetailsVisible) {
      if (newEvent) {
        setSelectedEvent(event);
        setEventDetailsVisible(false);
      } else setSelectedEvent(event);
    } else {
      setSelectedEvent(event);
      setEventDetailsVisible(true);
    }
  };

  const scrollX = useSharedValue<number>(0);
  const contextX = useSharedValue<number>(0);
  const contextY = useSharedValue<number>(0);
  const scrollY = useSharedValue<number>(0);
  const startX = useSharedValue<number>(0);
  const startY = useSharedValue<number>(0);
  const allDayHeight = useSharedValue<number>(1 * ALL_DAY_HEIGHT);
  const nativeRef = useRef(Gesture.Native());
  const prevIndex = useSharedValue(-1);
  const baseOffset = useSharedValue(pastDaysCount * dayWidth);
  const localFetchStart = useSharedValue(fetchStart);
  const localFetchEnd = useSharedValue(fetchEnd);
  const isScrolling = useSharedValue<boolean>(false);

  useLayoutEffect(() => {
    baseOffset.value = pastDaysCount * dayWidth;
  }, [pastDaysCount, dayWidth, baseOffset]);

  const isLoading = useSharedValue(false);

  // Reset the lock whenever the days array length changes
  useLayoutEffect(() => {
    isLoading.value = false;
  }, [days.length]);

  const updateAllDayHeaderHeight = (rawIndex: number): void => {
    const currentIndex = Math.round(rawIndex);
    let maxEvents = 1;
    const today = new Date();
    const todaysDate = today.getDate();

    // Loop through the currently visible days to find the max all-day events
    for (let i = currentIndex - 1; i <= currentIndex + 3; i++) {
      const newDate = new Date(today);
      newDate.setDate(todaysDate + i);
      const date = newDate.toDateString();
      const dayEvents = groupedAllDayEventsRef.current[date];
      if (dayEvents) {
        maxEvents = Math.max(maxEvents, dayEvents.length + 1);
      }
    }
    setMaxAllDayEvents((prevCurrentMax) => {
      if (prevCurrentMax !== maxEvents) {
        return maxEvents;
      }
      return prevCurrentMax;
    });

    const newAllDayHeight = maxEvents * ALL_DAY_HEIGHT;
    allDayHeight.value = newAllDayHeight;

    const minScroll = -newAllDayHeight;
    const maxScroll = hourHeight * 24 - SCREEN_HEIGHT + HEADER_HEIGHT + DATE_HEADER_HEIGHT + newAllDayHeight;

    // If the header shrank and left a gap at the top, smoothly close the gap!
    if (scrollY.value < minScroll) {
      scrollY.value = withTiming(minScroll, { duration: 250 });
    } else if (scrollY.value > maxScroll) {
      scrollY.value = withTiming(maxScroll, { duration: 250 });
    }
  };

  const verticalPan = Gesture.Pan()
    .simultaneousWithExternalGesture(nativeRef)
    .manualActivation(true)
    .shouldCancelWhenOutside(false)
    .onTouchesDown((event) => {
      startX.value = event.allTouches[0].x;
      startY.value = event.allTouches[0].y;
    })
    .onTouchesMove((event, state) => {
      const currentX = event.changedTouches[0].x;
      const currentY = event.changedTouches[0].y;

      const diffX = Math.abs(currentX - startX.value);
      const diffY = Math.abs(currentY - startY.value);

      if (diffY > 10 && diffY > diffX) {
        state.activate();
      } else if (diffX > 10) {
        state.fail();
      }
    })
    .onStart(() => {
      cancelAnimation(scrollY);
      contextY.value = scrollY.value;
      isScrolling.value = true;
    })
    .onUpdate((event) => {
      const nextY = contextY.value - event.translationY;
      const minScroll = -allDayHeight.value;
      const maxScroll = hourHeight * 24 - SCREEN_HEIGHT + HEADER_HEIGHT + DATE_HEADER_HEIGHT + allDayHeight.value;

      scrollY.value = Math.max(minScroll, Math.min(nextY, maxScroll));
    })
    .onEnd((event) => {
      const minScroll = -allDayHeight.value;
      const maxScroll = hourHeight * 24 - SCREEN_HEIGHT + HEADER_HEIGHT + DATE_HEADER_HEIGHT + allDayHeight.value;
      scrollY.value = withDecay(
        {
          velocity: -event.velocityY,
          clamp: [minScroll, maxScroll],
          deceleration: 0.99,
          reduceMotion: ReduceMotion.Never, // forces decay
        },
        (isFinished) => {
          if (isFinished) {
            isScrolling.value = false;
          }
        },
      );
    });

  const horizontalPan = Gesture.Pan()
    .simultaneousWithExternalGesture(nativeRef)
    .manualActivation(true)
    .shouldCancelWhenOutside(false)
    .onTouchesDown((event) => {
      startX.value = event.allTouches[0].x;
      startY.value = event.allTouches[0].y;
    })
    .onTouchesMove((event, state) => {
      const currentX = event.changedTouches[0].x;
      const currentY = event.changedTouches[0].y;

      const diffX = Math.abs(currentX - startX.value);
      const diffY = Math.abs(currentY - startY.value);

      if (diffX > 10 && diffX > diffY) {
        state.activate();
      } else if (diffY > 10) {
        state.fail();
      }
    })
    .onStart(() => {
      cancelAnimation(scrollX);
      contextX.value = scrollX.value;
      isScrolling.value = true;
    })
    .onUpdate((event) => {
      const nextX = contextX.value - event.translationX;
      const minScroll = -baseOffset.value;
      scrollX.value = Math.max(minScroll, nextX); // Clamp to physical 0
    })
    .onEnd((event) => {
      scrollX.value = withDecay(
        {
          velocity: -event.velocityX,
          deceleration: 0.985,
          reduceMotion: ReduceMotion.Never, // forces decay
        },
        (isFinished) => {
          // Fires when the scrolling physically stops
          if (isFinished) {
            isScrolling.value = false;
            scheduleOnRN(() => updateAllDayHeaderHeight(scrollX.value / dayWidth));
          }
        },
      );
    });

  const combined = Gesture.Simultaneous(verticalPan, horizontalPan);

  // Sync FlashList horizontal scrolling programmatically and handle infinite loading
  useAnimatedReaction(
    () => ({ logX: scrollX.value, base: baseOffset.value, loading: isLoading.value }),
    ({ logX, base, loading }) => {
      const physicalX = logX + base;
      scrollTo(listRef, physicalX, 0, false);

      if (loading) return;

      const currentIndex = Math.floor(physicalX / dayWidth - PAST_BUFFER);

      if (currentIndex > localFetchEnd.value) {
        localFetchEnd.value += BUFFER_INCREMENT;
        fetchForward(localFetchEnd.value);
        console.log('FUTURE');
      }
      if (currentIndex < localFetchStart.value) {
        localFetchStart.value -= BUFFER_INCREMENT;
        fetchBackward(localFetchStart.value);
        console.log('PAST');
      }
    },
  );

  // Apply vertical scroll to the HourGuide
  const animatedHourGuideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -scrollY.value }],
  }));

  const animatedAllDayStyle = useAnimatedStyle(() => {
    const targetHeight = maxAllDayEvents * ALL_DAY_HEIGHT;
    return { height: withTiming(targetHeight, { duration: 250 }) };
  });

  const webContainerRef = useRef<any>(null);

  useAnimatedReaction(
    () => isScrolling.value,
    (scrolling, wasScrolling) => {
      // If we WERE scrolling, but now we are NOT...
      if (wasScrolling && !scrolling) {
        // Safely call the JS function to update the React state
        scheduleOnRN(flushPendingEvents);
      }
    },
  );

  useEffect(() => {
    if (Platform.OS !== 'web' || !webContainerRef.current) return;
    const node = webContainerRef.current;
    let scrollEndTimeout: ReturnType<typeof setTimeout>;

    const handleWheel = (e: WheelEvent) => {
      isScrolling.value = true;

      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        scrollX.value = Math.max(-baseOffset.value, scrollX.value + e.deltaX);
        clearTimeout(scrollEndTimeout);
        scrollEndTimeout = setTimeout(() => {
          isScrolling.value = false;
          updateAllDayHeaderHeight(scrollX.value / dayWidth);
        }, 150);
      } else {
        const minScroll = -allDayHeight.value;
        const maxScroll = hourHeight * 24 - SCREEN_HEIGHT + HEADER_HEIGHT + DATE_HEADER_HEIGHT + allDayHeight.value;
        scrollY.value = Math.max(minScroll, Math.min(scrollY.value + e.deltaY, maxScroll));
      }
    };

    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      node.removeEventListener('wheel', handleWheel);
      clearTimeout(scrollEndTimeout);
    };
  }, [hourHeight]); // Re-bind if hourHeight changes

  const renderDay = useCallback(
    ({ item }: any) => (
      <DayContainer
        day={item.date}
        dayWidth={dayWidth}
        eventsWithOffsets={groupedTimedEvents[item.date.toDateString()] ?? EMPTY_EVENTS}
        //eventsWithOffsets={EMPTY_EVENTS}
        // 2. Pass the all-day events down
        allDayEvents={groupedAllDayEvents[item.date.toDateString()] ?? EMPTY_ALL_DAY}
        hourHeight={hourHeight}
        handlePress={handlePress}
        scrollY={scrollY}
        isVisible={eventDetailsVisible}
        selectedEvent={selectedEvent}
        maxAllDayEvents={maxAllDayEvents}
        scrollX={scrollX}
        index={item.index}
      />
    ),
    [dayWidth, groupedTimedEvents, groupedAllDayEvents, hourHeight, handlePress, scrollY, contextY],
  );

  return (
    <View style={styles.container}>
      <GestureDetector gesture={combined}>
        <Animated.View ref={webContainerRef} style={{ flex: 1, overflow: 'hidden', overscrollBehaviorX: 'none' }}>
          {/* HOUR GUIDE */}
          <View style={{ flex: 1, flexDirection: 'row' }}>
            {/* HOUR GUIDE */}
            <View style={{ flexDirection: 'column' }}>
              <View style={[styles.timeZone, { height: hourHeight }]}>
                <Text style={styles.timeZoneText}>PDT</Text>
              </View>
              <Animated.View style={[animatedAllDayStyle, styles.allDay, { top: hourHeight }]}>
                <Text style={{ fontSize: 10, color: '#888' }}>All-Day</Text>
              </Animated.View>
              <Animated.View ref={webContainerRef} style={[animatedHourGuideStyle, { zIndex: 8 }]}>
                <HourGuide hourHeight={hourHeight} labelWidth={HOUR_LABEL_WIDTH} />
              </Animated.View>
            </View>

            {/* MAIN GRID */}
            <AnimatedFlashList
              ref={listRef}
              drawDistance={dayWidth * 7}
              data={days}
              //extraData={events}
              horizontal
              scrollEnabled={false}
              nestedScrollEnabled={true}
              keyExtractor={(item: any) => item.date.toISOString()}
              style={{ width: GRID_WIDTH }}
              initialScrollIndex={PAST_BUFFER}
              renderItem={renderDay}
            />
          </View>
        </Animated.View>
      </GestureDetector>

      <EventDetails event={selectedEvent} isVisible={eventDetailsVisible} onClose={() => setEventDetailsVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: 'white', flex: 1, elevation: 0 },
  timeZone: {
    width: HOUR_LABEL_WIDTH,
    zIndex: 10,
    justifyContent: 'flex-end',
    textAlign: 'center',
    backgroundColor: COLORS.headerBackground,
    padding: 3,
  },
  allDay: {
    width: HOUR_LABEL_WIDTH,
    zIndex: 11,
    justifyContent: 'flex-start',
    textAlign: 'center',
    backgroundColor: COLORS.white,
    padding: 3,
    position: 'absolute',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: GRID_COLOR,
  },
  timeZoneText: {
    fontSize: SIZES.s,
    color: COLORS.text.main,
    fontWeight: FONT_WEIGHTS.light,
    textAlign: 'center',
  },
});
