import { DATE_HEADER_HEIGHT, HEADER_HEIGHT, PAST_BUFFER, WEB_DATE_HEADER_PADDING, WEB_Y_PADDING } from '@/utility/constants';
import { createEventObj } from '@/utility/eventUtils';
import { COLORS } from '@/utility/theme';
import { AllDayPool, EventObj, EventWithLayout } from '@/utility/types';
import { isSameDay } from 'date-fns';
import React, { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { useScreenSize } from '../contexts/screen-size-context';
import { useTimeZoneContext } from '../contexts/time-zone-context';
import { useUIContext } from '../contexts/ui-context';
import AllDayChip from './allday-chip';
import DateHeader from './date-header';
import EventContainer from './event-container';
import { getDayContainerStyles } from './multiDayStyles';
import TimeIndicator from './time-indicator';

const HourTicks = ({ hourHeight, isDark }: { hourHeight: number; isDark: boolean }) => (
  <Svg height={hourHeight * 24} width="100%" style={StyleSheet.absoluteFill}>
    {Array.from({ length: 24 }).map((_, i) => (
      <Line
        key={i}
        x1="0"
        y1={(i + 1) * hourHeight}
        x2="100%"
        y2={(i + 1) * hourHeight}
        stroke={isDark ? COLORS.border.dark : COLORS.border.light}
        strokeWidth="1"
      />
    ))}
  </Svg>
);

export interface DayContainerProps {
  day: Date;
  dayWidth: number;
  hourHeight: number;
  eventsWithLayout: EventWithLayout[];
  allDayEvents: EventWithLayout[];
  handlePress: (event: EventObj | null, newEvent: boolean, e: any) => void;
  scrollY: SharedValue<number>;
  scrollX: SharedValue<number>;
  isVisible: boolean;
  selectedEventId: string | null;
  currentAllDayHeight: SharedValue<number>;
  eventPool: SharedValue<AllDayPool[]>;
  widthsDictionary: Record<string, number>;
  newEvent: EventObj | null;
}

const lightStyles = getDayContainerStyles(false);
const darkStyles = getDayContainerStyles(true);

export default function DayContainer({
  day,
  dayWidth,
  hourHeight,
  eventsWithLayout: eventsWithOffsets,
  allDayEvents,
  handlePress,
  scrollY,
  scrollX,
  isVisible,
  selectedEventId,
  currentAllDayHeight,
  eventPool,
  widthsDictionary,
  newEvent,
}: DayContainerProps) {
  const isToday = useMemo(() => isSameDay(day, new Date()), [day]);
  const isWeekend = useMemo(() => day.getDay() === 6 || day.getDay() === 0, [day]);
  const { timeZone } = useTimeZoneContext();
  const { theme } = useUIContext();
  const styles = theme.isDark ? darkStyles : lightStyles;
  const { height: SCREEN_HEIGHT, isWeb } = useScreenSize();

  const msPerDay = 86400000;
  const thisDay = new Date(day).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  const index = Math.round((today - thisDay) / msPerDay) + PAST_BUFFER;
  const newEventToday = (() => {
    if (!newEvent) return false;

    const eventTime = newEvent.startDate.getTime();
    const after = eventTime >= thisDay;
    const before = eventTime - thisDay < msPerDay;

    return after && before;
  })();

  const handleEventSelect = useCallback(
    (event: EventObj, e: any) => {
      handlePress(event, false, e);
    },
    [handlePress],
  );

  const getYofEventPress = (event: any) => {
    const locationY = event.nativeEvent.locationY;
    const offsetY = event.nativeEvent.offsetY;
    return locationY ?? offsetY;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -scrollY.value }],
  }));
  const animatedAllDayStyle = useAnimatedStyle(() => ({ height: withTiming(currentAllDayHeight.value, { duration: 250 }) }));

  return (
    <View
      style={[
        styles.rootContainer,
        {
          width: dayWidth,
          zIndex: index,
          backgroundColor: theme.isDark
            ? isWeekend
              ? COLORS.background.elevatedDark
              : COLORS.background.dark
            : isWeekend
              ? COLORS.background.elevatedLight
              : COLORS.background.light,
          height: SCREEN_HEIGHT - HEADER_HEIGHT - isWeb * WEB_Y_PADDING,
        },
      ]}
    >
      {/* ALL DAY GRID */}
      <View style={{ overflow: 'visible', zIndex: 4 }}>
        <DateHeader key={day.toISOString()} day={day} dayWidth={dayWidth} />
        <Animated.View
          style={[
            styles.allDayContainer,
            {
              width: dayWidth,
              backgroundColor: theme.isDark
                ? isWeekend
                  ? COLORS.background.elevatedDark
                  : COLORS.background.dark
                : isWeekend
                  ? COLORS.background.elevatedLight
                  : COLORS.background.light,
              top: DATE_HEADER_HEIGHT + isWeb * WEB_DATE_HEADER_PADDING * 2,
            },
            animatedAllDayStyle,
          ]}
        >
          {allDayEvents.map((event) => {
            return (
              <AllDayChip
                key={event.event.id + day.toISOString}
                event={event.event}
                day={day}
                layout={event}
                handlePress={handleEventSelect}
                dayWidth={dayWidth}
                isVisible={isVisible}
                selectedEventId={selectedEventId}
                isDummy={event.dummy}
                scrollX={scrollX}
                eventPool={eventPool}
                widthsDictionary={widthsDictionary}
              />
            );
          })}
        </Animated.View>
      </View>

      {/* SCROLLABLE HOUR GRID */}
      <Animated.View
        key={day.toLocaleDateString()}
        style={[
          styles.dayContainer,
          animatedStyle,
          {
            width: dayWidth,
            height: hourHeight * 24,
          },
        ]}
        pointerEvents="box-none"
      >
        <HourTicks hourHeight={hourHeight} isDark={theme.isDark} />
        <TimeIndicator hourHeight={hourHeight} isToday={isToday} />
        {eventsWithOffsets.map((item) => (
          <EventContainer
            key={item.event.id}
            eventWithOffset={item}
            dayWidth={dayWidth}
            hourHeight={hourHeight}
            onSelect={handleEventSelect}
            isVisible={isVisible}
            selectedEventId={selectedEventId}
            newEvent={false}
          />
        ))}
        {newEventToday && newEvent && (
          <EventContainer
            key={newEvent.id}
            eventWithOffset={{
              event: newEvent,
              offset: 0,
              maxOffset: 0,
              startDate: newEvent.startDate,
              endDate: newEvent.endDate,
              dummy: false,
            }}
            dayWidth={dayWidth}
            hourHeight={hourHeight}
            onSelect={() => {}}
            isVisible={false}
            selectedEventId={null}
            newEvent={newEventToday}
          />
        )}

        <Pressable
          onPress={(event) => {
            const y = getYofEventPress(event);
            const hour = Math.floor(y / hourHeight);
            const clickedTime = new Date(day);
            clickedTime.setHours(hour, 0, 0, 0);
            const draftEvent = createEventObj(
              {
                startDate: clickedTime,
                endDate: new Date(clickedTime.getTime() + 60 * 60 * 1000),
                title: '',
              },
              timeZone,
            );

            handlePress(draftEvent, true, event);
          }}
          style={[StyleSheet.absoluteFill, styles.newEventButton, { height: hourHeight * 24 }]}
        />
      </Animated.View>
    </View>
  );
}
