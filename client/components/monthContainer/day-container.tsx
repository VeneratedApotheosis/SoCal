import { ALL_DAY_HEIGHT } from '@/utility/constants';
import { baseFlexStyles, getBasicThemeStyles, getBasicTypographyStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { EventObj, EventWithLayout } from '@/utility/types';
import React, { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useCalendarIndex } from '../contexts/calendar-index-context';
import { useUIContext } from '../contexts/ui-context';
import AllDayEvents from './all-day-events';

export interface DayBoxProps {
  day: Date;
  weekHeight: number;
  dayWidth: number;
  event: EventWithLayout[];
  handlePress: (event: EventObj | null, newEvent: boolean, e: any) => void;
  newEvent: EventObj | null;
  selectedEventId: string | null;
}

export default function DayBox({ day, weekHeight, dayWidth, event, handlePress, newEvent, selectedEventId }: DayBoxProps) {
  const { theme } = useUIContext();
  const { currentMonthText } = useCalendarIndex();
  const style = getDayStyles(theme.isDark);
  const dayText = day.getDate() === 1 ? day.toLocaleString('default', { month: 'short' }) + ' ' + day.getDate() : day.getDate();

  // # more calculation
  const numEvents = Math.floor(weekHeight / ALL_DAY_HEIGHT) - 1;
  const hasMore = event.length > numEvents;
  const numMore = event.length - numEvents + 1;
  const displayedEvents = event.length > numEvents ? event.slice(0, numEvents - 1) : event;

  // Color difference calculations
  const isElevated = day.getDay() === 0 || day.getDay() === 6;
  const thisMonth = currentMonthText === day.toLocaleString('default', { month: 'long' });

  const handleEventSelect = useCallback(
    (event: EventObj, e: any) => {
      handlePress(event, false, e);
    },
    [handlePress],
  );
  const handleMoreRef = useRef<View>(null);

  const handleMore = () => {
    if (!handleMoreRef || !handleMoreRef.current) return;
    handleMoreRef.current.measure((x, y, width, height, pageX, pageY) => {
      console.log(pageX, pageY);
    });
  };

  return (
    <View
      ref={handleMoreRef}
      style={[
        style.dayContainer,
        day.getDay() === 6 && { borderRightWidth: 1 },
        {
          backgroundColor: theme.isDark
            ? isElevated
              ? COLORS.background.elevatedDark
              : COLORS.background.dark
            : isElevated
              ? COLORS.background.elevatedLight
              : COLORS.background.light,
        },
      ]}
    >
      <View style={style.dateTextContainer}>
        <Text
          style={[
            style.dateText,
            thisMonth && { fontWeight: '500' },
            !thisMonth && { color: theme.isDark ? COLORS.text.subtleDark : COLORS.text.subtleLight },
          ]}
        >
          {dayText}
        </Text>
      </View>
      {displayedEvents.map((event, idx) => {
        const key = event && event.event && event.event.id ? event.event.id + day.toISOString() : idx + day.toISOString();
        return (
          <AllDayEvents
            key={key}
            event={event.event}
            day={day}
            layout={event}
            handlePress={handleEventSelect}
            dayWidth={dayWidth}
            selectedEventId={selectedEventId}
            isDummy={event.dummy}
            idx={idx}
          />
        );
      })}
      {hasMore && (
        <Pressable style={{ paddingLeft: 6, height: ALL_DAY_HEIGHT }} onPress={handleMore}>
          <Text style={style.moreText}>{numMore + ' ' + 'more'}</Text>
        </Pressable>
      )}
    </View>
  );
}

export const getDayStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    dayContainer: {
      borderBottomWidth: 1,
      borderLeftWidth: 1,
      ...baseTheme.border,
      flex: 1,
    },
    dateText: {
      ...baseText.body,
      fontSize: 14,
      textAlign: 'center',
      width: '100%',
      textAlignVertical: 'center',
    },
    dateTextContainer: {
      height: ALL_DAY_HEIGHT,
      ...baseFlexStyles.centerAll,
    },
    moreText: {
      ...baseText.body,
      fontSize: 12,
      fontWeight: '500',
      width: '100%',
      textAlignVertical: 'center',
    },
  });
};
