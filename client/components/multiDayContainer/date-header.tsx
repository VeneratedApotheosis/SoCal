import { DATE_HEADER_HEIGHT } from '@/utility/constants';
import { COLORS, FONT_WEIGHTS, SIZES } from '@/utility/theme';
import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useUIContext } from '../contexts/ui-context';

const DateHeader = ({ day, dayWidth }: { day: Date; dayWidth: number }) => {
  const { now } = useUIContext();

  const isToday = useMemo(() => {
    if (!now || !day) return false;
    return now.toDateString() === day.toDateString();
  }, [now, day]);

  return (
    <View style={[styles.date, { width: dayWidth }]}>
      <Text style={[styles.dateText, isToday && styles.todayText]}>
        {day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
      </Text>
      <Text style={[styles.dateNumber, isToday && styles.todayNumber]}>{day.toLocaleDateString('en-US', { day: 'numeric' })}</Text>
    </View>
  );
};

export default memo(DateHeader);

const styles = StyleSheet.create({
  date: {
    justifyContent: 'center',
    backgroundColor: COLORS.headerBackground,
    height: DATE_HEADER_HEIGHT,
    alignItems: 'center',
  },
  dateText: {
    fontSize: SIZES.xs,
    color: COLORS.text.main,
    fontWeight: FONT_WEIGHTS.light,
  },
  dateNumber: {
    fontSize: SIZES.l,
    color: COLORS.text.main,
    fontWeight: FONT_WEIGHTS.medium,
  },
  todayText: { color: COLORS.primary },
  todayNumber: { color: COLORS.primary, fontWeight: FONT_WEIGHTS.medium },
});
