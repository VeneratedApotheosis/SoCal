import { ALL_DAY_HEIGHT, DATE_HEADER_HEIGHT, PAST_BUFFER, WEB_DATE_HEADER_PADDING, WEB_Y_PADDING } from '@/utility/constants';
import { createEventObj } from '@/utility/eventUtils';
import { COLORS } from '@/utility/theme';
import { AllDayPool, EventObj, EventWithLayout } from '@/utility/types';
import { addHours, isSameDay } from 'date-fns';
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
import { getDayContainerStyles, getEventCardStyles } from './multiDayStyles';
import TimeIndicator from './time-indicator';

interface EventDayBounds {
  newEventToday: boolean;
  newEventAllDay: boolean;
  newEventStartDate: Date;
  newEventEndDate: Date;
}

export const getEventDayBounds = (newEvent: EventObj | null | undefined, day: Date): EventDayBounds => {
  if (!newEvent) {
    return {
      newEventToday: false,
      newEventAllDay: false,
      newEventStartDate: new Date(),
      newEventEndDate: new Date(),
    };
  }

  const msPerDay = 86400000;

  const startOfDay = new Date(day);
  startOfDay.setHours(0, 0, 0, 0);
  const thisDay = startOfDay.getTime(); // Replaces external dependency

  const endOfDay = new Date(day);
  endOfDay.setHours(23, 59, 59, 999);

  const eventStartTime = newEvent.startDate.getTime();
  const eventEndTime = newEvent.endDate.getTime();

  const startsToday = eventStartTime >= thisDay && eventStartTime < thisDay + msPerDay;
  const startsBeforeToday = eventStartTime < thisDay;
  const endsToday = eventEndTime >= thisDay && eventEndTime < thisDay + msPerDay;
  const endsTodayOrLater = eventEndTime >= thisDay;
  const endsAfterToday = eventEndTime > thisDay;

  return {
    newEventToday: startsToday || (startsBeforeToday && endsTodayOrLater),
    newEventAllDay: Boolean(newEvent.allDay && (startsToday || (startsBeforeToday && endsAfterToday))),
    newEventStartDate: startsToday ? newEvent.startDate : startOfDay,
    newEventEndDate: endsToday ? newEvent.endDate : endOfDay,
  };
};

const HourTicks = ({ hourHeight, isWeb, isDark }: { hourHeight: number; isWeb: number; isDark: boolean }) => (
  <Svg height={hourHeight * (isWeb ? 24 : 25)} width="100%" style={StyleSheet.absoluteFill}>
    {Array.from({ length: isWeb ? 24 : 25 }).map((_, i) => (
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
  isVisible: boolean;
  selectedEventId: string | null;
  currentAllDayHeight: SharedValue<number>;
  eventPool: SharedValue<AllDayPool[]>;
  widthsDictionary: Record<string, number>;
  newEvent: EventObj | null;
  dragStartDayIdx: SharedValue<number>;
  dragStartMin: SharedValue<number>;
  dragCurrentDayMin: SharedValue<number>;
  isDraggingCreate: SharedValue<boolean>;
}

const lightStyles = getDayContainerStyles(false);
const darkStyles = getDayContainerStyles(true);
const lightEventStyles = getEventCardStyles(false);
const darkEventStyles = getEventCardStyles(true);

export default function DayContainer({
  day,
  dayWidth,
  hourHeight,
  eventsWithLayout,
  allDayEvents,
  handlePress,
  scrollY,
  isVisible,
  selectedEventId,
  currentAllDayHeight,
  eventPool,
  widthsDictionary,
  newEvent,
  dragStartDayIdx,
  dragStartMin,
  dragCurrentDayMin,
  isDraggingCreate,
}: DayContainerProps) {
  const isToday = useMemo(() => isSameDay(day, new Date()), [day]);
  const isWeekend = useMemo(() => day.getDay() === 6 || day.getDay() === 0, [day]);
  const { timeZone } = useTimeZoneContext();
  const { theme } = useUIContext();
  const styles = theme.isDark ? darkStyles : lightStyles;
  const eventStyles = theme.isDark ? darkEventStyles : lightEventStyles;
  const { height: SCREEN_HEIGHT, isWeb, headerHeight } = useScreenSize();

  const msPerDay = 86400000;
  const thisDay = new Date(day).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  const index = Math.round((thisDay - today) / msPerDay) + PAST_BUFFER;
  const reversedIndex = Math.round((today - thisDay) / msPerDay) + PAST_BUFFER;
  const { newEventToday, newEventAllDay, newEventStartDate, newEventEndDate } = getEventDayBounds(newEvent, day);

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

  const animatedDragEvent = useAnimatedStyle(() => {
    if (dragStartDayIdx.value !== index || !isDraggingCreate.value) return { opacity: 0, height: 0, position: 'absolute', top: 0 };
    return {
      opacity: 0.5,
      height: (hourHeight / 60.0) * Math.max(15, Math.abs(dragStartMin.value - dragCurrentDayMin.value)),
      position: 'absolute',
      top: (hourHeight / 60.0) * Math.min(dragStartMin.value, dragCurrentDayMin.value),
    };
  });

  const newAllDayAnimatedStyle = useAnimatedStyle(() => ({ top: currentAllDayHeight.value - ALL_DAY_HEIGHT * (1 + allDayEvents.length) }));

  return (
    <View
      style={[
        styles.rootContainer,
        {
          width: dayWidth,
          zIndex: reversedIndex,
          backgroundColor: theme.isDark
            ? isWeekend
              ? COLORS.background.elevatedDark
              : COLORS.background.dark
            : isWeekend
              ? COLORS.background.elevatedLight
              : COLORS.background.light,
          height: SCREEN_HEIGHT - headerHeight - isWeb * WEB_Y_PADDING,
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
              />
            );
          })}
          {newEvent && newEventAllDay && (
            <Animated.View style={[newAllDayAnimatedStyle]}>
              <AllDayChip
                key={newEvent.id + day.toISOString}
                event={newEvent}
                day={day}
                layout={{
                  event: newEvent,
                  maxOffset: allDayEvents.length + 1,
                  offset: allDayEvents.length + 1,
                  startDate: newEvent.startDate,
                  endDate: newEvent.endDate,
                  dummy: false,
                }}
                handlePress={handleEventSelect}
                dayWidth={dayWidth}
                isVisible={isVisible}
                selectedEventId={selectedEventId}
                isDummy={false}
                newEvent={true}
              />
            </Animated.View>
          )}

          <Pressable
            onPress={(event) => {
              const startTime = new Date(day);
              startTime.setHours(0, 0, 0);
              const endTime = addHours(startTime, isWeb ? 24 : 25);
              const draftEvent = createEventObj(
                {
                  startDate: startTime,
                  endDate: endTime,
                  title: '',
                  allDay: true,
                },
                timeZone,
              );

              handlePress(draftEvent, true, event);
            }}
            onLongPress={() => {}}
            style={[styles.newEventButton, { flex: 1 }]}
          />
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
            height: hourHeight * (isWeb ? 24 : 25),
          },
        ]}
        pointerEvents="box-none"
      >
        <HourTicks hourHeight={hourHeight} isDark={theme.isDark} isWeb={isWeb} />
        <TimeIndicator hourHeight={hourHeight} isToday={isToday} />
        {eventsWithLayout.map((item) => (
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
        {/* new Event */}
        {newEventToday && newEvent && !newEventAllDay && !newEvent.allDay && (
          <EventContainer
            key={newEvent.id}
            eventWithOffset={{
              event: newEvent,
              offset: 0,
              maxOffset: 0,
              startDate: newEventStartDate,
              endDate: newEventEndDate,
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
        <Animated.View
          style={[
            eventStyles.newEvent,
            animatedDragEvent,
            {
              zIndex: 2000,
              width: dayWidth,
            },
          ]}
        ></Animated.View>

        <Pressable
          onPress={(event) => {
            const y = getYofEventPress(event);
            const minutes = Math.floor((y / hourHeight) * 4) * 15;
            const clickedTime = new Date(day);
            clickedTime.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
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
          onLongPress={() => {}}
          style={[StyleSheet.absoluteFill, styles.newEventButton, { height: hourHeight * 24 }]}
        />
      </Animated.View>
    </View>
  );
}
