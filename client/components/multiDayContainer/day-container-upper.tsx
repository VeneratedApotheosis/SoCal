import { PAST_BUFFER } from '@/utility/constants';
import { COLORS } from '@/utility/theme';
import { AllDayPool, EventObj, EventWithLayout } from '@/utility/types';
import { isSameDay } from 'date-fns';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { useTimeZoneContext } from '../contexts/time-zone-context';
import { useUIContext } from '../contexts/ui-context';
import AllDayChip from './allday-chip';
import DateHeader from './date-header';
import { getDayContainerStyles } from './multiDayStyles';

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
  handlePress: (event: EventObj | null, newEvent: boolean) => void;
  scrollY: SharedValue<number>;
  scrollX: SharedValue<number>;
  isVisible: boolean;
  selectedEventId: string | null;
  currentAllDayHeight: SharedValue<number>;
  eventPool: SharedValue<AllDayPool[]>;
  widthsDictionary: Record<string, number>;
}

const lightStyles = getDayContainerStyles(false);
const darkStyles = getDayContainerStyles(true);

export default function DayContainerUpper({
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
}: DayContainerProps) {
  const isToday = useMemo(() => isSameDay(day, new Date()), [day]);
  const isWeekend = useMemo(() => day.getDay() === 6 || day.getDay() === 0, [day]);
  const { timeZone } = useTimeZoneContext();
  const { theme } = useUIContext();
  const styles = theme.isDark ? darkStyles : lightStyles;

  const msPerDay = 86400000;
  const thisDay = new Date(day).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  const index = Math.round((today - thisDay) / msPerDay) + PAST_BUFFER;

  const handleEventSelect = useCallback(
    (event: EventObj) => {
      handlePress(event, false);
    },
    [handlePress],
  );

  const getYofEventPress = (event: any) => {
    const locationY = event.nativeEvent.locationY;
    const offsetY = event.nativeEvent.offsetY;
    return locationY ?? offsetY;
  };

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -scrollY.value }] }));
  const animatedAllDayStyle = useAnimatedStyle(() => ({ height: withTiming(currentAllDayHeight.value, { duration: 250 }) }));

  return (
    <View style={{ overflow: 'visible', width: dayWidth, zIndex: index }}>
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
    </View>
  );
}
