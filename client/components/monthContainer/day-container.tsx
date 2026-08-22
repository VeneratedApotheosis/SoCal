import { ALL_DAY_HEIGHT } from '@/utility/constants';
import { baseFlexStyles, getBasicThemeStyles, getBasicTypographyStyles } from '@/utility/globalStyles';
import { EventWithLayout } from '@/utility/types';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useUIContext } from '../contexts/ui-context';
import AllDayEvents from './all-day-events';

export interface DayBoxProps {
  day: Date;
  weekHeight: number;
  dayWidth: number;
  event: EventWithLayout[];
}

export default function DayBox({ day, weekHeight, dayWidth, event }: DayBoxProps) {
  const { theme } = useUIContext();
  const style = getDayStyles(theme.isDark);
  const dayText = day.getDate() === 1 ? day.toLocaleString('default', { month: 'short' }) + ' ' + day.getDate() : day.getDate();

  const numEvents = Math.floor(weekHeight / ALL_DAY_HEIGHT) - 1;
  const hasMore = event.length > numEvents;
  const numMore = event.length - numEvents + 1;
  const displayedEvents = event.length > numEvents ? event.slice(0, numEvents - 1) : event;

  return (
    <View style={[style.dayContainer, day.getDay() === 6 && { borderRightWidth: 1 }]}>
      <View style={style.dateTextContainer}>
        <Text style={style.dateText}>{dayText}</Text>
      </View>
      {displayedEvents.map((event, idx) => {
        const key = event && event.event && event.event.id ? event.event.id + day.toISOString() : idx + day.toISOString();
        return (
          <AllDayEvents
            key={key}
            event={event.event}
            day={day}
            layout={event}
            handlePress={() => {}}
            dayWidth={dayWidth}
            isVisible={false}
            selectedEventId={'selectedEventId'}
            isDummy={event.dummy}
            idx={idx}
          />
        );
      })}
      {hasMore && (
        <Pressable style={{ paddingLeft: 6, height: ALL_DAY_HEIGHT }}>
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
      ...baseTheme.background,
      borderBottomWidth: 1,
      borderLeftWidth: 1,
      ...baseTheme.border,
      flex: 1,
    },
    dateText: {
      ...baseText.body,
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
      fontWeight: '500',
      width: '100%',
      textAlignVertical: 'center',
    },
  });
};
