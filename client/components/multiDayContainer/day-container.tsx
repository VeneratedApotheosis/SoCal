import { isSameDay } from 'date-fns';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import DateHeader from './date-header';

import { ALL_DAY_HEIGHT, GRID_COLOR, HOUR_HEIGHT, SCREEN_WIDTH } from '@/utility/constants';
import { createEventObj } from '@/utility/eventUtils';
import { COLORS } from '@/utility/theme';
import { EventObj, EventWithOffset } from '@/utility/types';
import AllDayChip from './allday-chip'; // <-- Import the chip
import EventContainer from './event-container';
import TimeIndicator from './time-indicator';

const HourTicks = ({ hourHeight }: { hourHeight: number }) => (
  <Svg height={hourHeight * 24} width="100%" style={StyleSheet.absoluteFill}>
    {Array.from({ length: 24 }).map((_, i) => (
      <Line key={i} x1="0" y1={(i + 1) * hourHeight} x2="100%" y2={(i + 1) * hourHeight} stroke={GRID_COLOR} strokeWidth="1" />
    ))}
  </Svg>
);

export interface DayContainerProps {
  day: Date;
  dayWidth: number;
  hourHeight: number;
  eventsWithOffsets: EventWithOffset[];
  allDayEvents: EventObj[]; // <-- Add type
  handlePress: (event: EventObj | null, newEvent: boolean) => void;
  scrollY: SharedValue<number>;
  scrollX: SharedValue<number>;
  index: number;
  isVisible: boolean;
  selectedEvent: EventObj | null;
  maxAllDayEvents: number;
}

export default function DayContainer({
  day,
  dayWidth,
  hourHeight,
  eventsWithOffsets,
  allDayEvents, // <-- Add to props
  handlePress,
  scrollY,
  scrollX,
  index,
  isVisible,
  selectedEvent,
  maxAllDayEvents,
}: DayContainerProps) {
  const isToday = useMemo(() => isSameDay(day, new Date()), [day]);

  const handleEventSelect = (event: EventObj) => {
    handlePress(event, false);
  };

  const getYofEventPress = (event: any) => {
    const locationY = event.nativeEvent.locationY;
    const offsetY = event.nativeEvent.offsetY;
    return locationY ?? offsetY;
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: -scrollY.value }],
    };
  });

  const animatedEventStyle = useAnimatedStyle(() => {
    // 1. Calculate where this specific day physically lives on the X axis
    const thisDaysPosition = index * dayWidth;

    // 2. Interpolate the opacity based on the scroll position!
    const opacity = interpolate(
      scrollX.value,
      [
        thisDaysPosition - SCREEN_WIDTH, // When the day is off-screen to the right
        thisDaysPosition - SCREEN_WIDTH + dayWidth, // Fading in as it enters the screen
        thisDaysPosition, // Fully visible
        thisDaysPosition + dayWidth, // Fading out as it leaves the left side
      ],
      [0, 1, 1, 0], // The opacity values matching the array above
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      // Keep your vertical translation here if this is inside DayContainer
      transform: [{ translateY: -scrollY.value }],
    };
  });

  const animatedAllDayStyle = useAnimatedStyle(() => {
    const targetHeight = maxAllDayEvents * ALL_DAY_HEIGHT;
    return { height: withTiming(targetHeight, { duration: 250 }) };
  }, [maxAllDayEvents]);

  return (
    <View style={{ width: dayWidth }}>
      {/* HEADER & ALL-DAY SECTION (Pinned) */}
      <View style={{ zIndex: 4, backgroundColor: 'white' }}>
        <DateHeader key={day.toISOString()} day={day} dayWidth={dayWidth} />
        {/* All Day Container */}
        <Animated.View style={[styles.allDayContainer, { width: dayWidth }, animatedAllDayStyle]}>
          {allDayEvents.map((event) => (
            <AllDayChip
              key={event.id}
              event={event}
              handlePress={handleEventSelect}
              dayWidth={dayWidth}
              isVisible={isVisible}
              selectedEvent={selectedEvent}
            />
          ))}
        </Animated.View>
      </View>

      {/* SCROLLABLE HOUR GRID */}
      <Animated.View
        key={day.toLocaleDateString()}
        style={[styles.dayContainer, animatedStyle, { width: dayWidth }]}
        pointerEvents="box-none"
      >
        <HourTicks hourHeight={hourHeight} />
        <TimeIndicator hourHeight={hourHeight} isToday={isToday} />
        {eventsWithOffsets.map((item) => (
          <EventContainer
            key={item.event.id}
            eventWithOffset={item}
            dayWidth={dayWidth}
            hourHeight={hourHeight}
            onSelect={handleEventSelect}
            isVisible={isVisible}
            selectedEvent={selectedEvent}
          />
        ))}
        <Pressable
          onPress={(event) => {
            const y = getYofEventPress(event);
            const hour = Math.floor(y / hourHeight);

            const clickedTime = new Date(day);
            clickedTime.setHours(hour, 0, 0, 0);

            const draftEvent = createEventObj({
              startDate: clickedTime,
              endDate: new Date(clickedTime.getTime() + 60 * 60 * 1000),
              title: 'New Event',
            });
            handlePress(draftEvent, true);
          }}
          style={[StyleSheet.absoluteFill, { zIndex: 0, backgroundColor: 'transparent' }]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  allDayContainer: {
    flexDirection: 'column',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderColor: GRID_COLOR,
    paddingTop: 2,
    backgroundColor: COLORS.white,
    position: 'absolute',
    top: HOUR_HEIGHT,
  },
  dayContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 3,
  },
});
