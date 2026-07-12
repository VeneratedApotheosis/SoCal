import { getDateHeaderStyles } from '@/components/multiDayContainer/multiDayStyles';
import { DATE_HEADER_HEIGHT, WEB_DATE_HEADER_PADDING } from '@/utility/constants';
import { COLORS } from '@/utility/theme';
import React, { memo, useMemo } from 'react';
import { Text, View } from 'react-native';
import { useScreenSize } from '../contexts/screen-size-context';
import { useUIContext } from '../contexts/ui-context';

const lightStyles = getDateHeaderStyles(false);
const darkStyles = getDateHeaderStyles(true);

const DateHeader = ({ day, dayWidth }: { day: Date; dayWidth: number }) => {
  const { now, theme } = useUIContext();
  const { isWeb } = useScreenSize();
  const styles = theme.isDark ? darkStyles : lightStyles;
  const isWeekend = useMemo(() => day.getDay() === 6 || day.getDay() === 0, [day]);

  const isToday = useMemo(() => {
    if (!now || !day) return false;
    return now.toDateString() === day.toDateString();
  }, [now, day]);

  return (
    <View
      style={[
        styles.date,
        {
          width: dayWidth,
          height: DATE_HEADER_HEIGHT + isWeb * WEB_DATE_HEADER_PADDING * 2,
          backgroundColor: theme.isDark
            ? isWeekend
              ? COLORS.background.elevatedDark
              : COLORS.background.dark
            : isWeekend
              ? COLORS.background.elevatedLight
              : COLORS.background.light,
        },
      ]}
    >
      <Text style={[styles.dateText, isToday && styles.todayText]}>
        {day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
      </Text>
      <Text style={[styles.dateNumber, isToday && styles.todayNumber]}>{day.toLocaleDateString('en-US', { day: 'numeric' })}</Text>
    </View>
  );
};

export default memo(DateHeader);
