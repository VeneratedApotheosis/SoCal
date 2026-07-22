import { COLORS } from '@/utility/theme';
import { toZonedTime } from 'date-fns-tz';
import { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTimeZoneContext } from '../contexts/time-zone-context';
import { UIContext } from '../contexts/ui-context';

// Time Indicator
export default function TimeIndicator({ hourHeight, isToday }: { hourHeight: number; isToday: boolean }) {
  const { now } = useContext(UIContext);
  const { timeZone } = useTimeZoneContext();

  const hours = toZonedTime(now, timeZone).getHours();
  const minutes = toZonedTime(now, timeZone).getMinutes();

  // Logic: (Hours * height per hour) + (Minutes percentage of an hour)
  const topOffset = (hours + minutes / 60) * hourHeight;

  return (
    <View style={[styles.container, { top: topOffset - 1 }]}>
      {isToday ? (
        <View style={styles.timeLine} pointerEvents="none">
          <View style={styles.timeDot} />
        </View>
      ) : (
        <View style={styles.blackLine} pointerEvents="none"></View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 200,
    elevation: 200,
  },
  timeLine: {
    height: 3,
    backgroundColor: COLORS.blueAccentDark,
  },
  timeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.blueAccentDark,
    marginLeft: -5,
    top: -3,
  },
  blackLine: {
    height: 1,
    backgroundColor: COLORS.border.mutedDark,
    top: 1,
  },
});
