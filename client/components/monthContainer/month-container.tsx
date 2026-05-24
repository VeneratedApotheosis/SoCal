import { useDate } from '@/hooks/calendarHooks/useDate';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { FlatList as RoundList } from 'react-native-bidirectional-infinite-scroll';
import WeekBox from './week-container';

// --- CONSTANTS ---
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function MonthContainer({ numWeeks }: { numWeeks: number }) {
  const { days: today, refetch: refetchToday } = useDate(0, 2);
  const [weeksObject, setWeeksObject] = useState<{ id: string; date: Date }[]>([]);
  const [unitHeight, setUnitHeight] = useState(0);
  const ref = useRef<View>(null);

  //calculates height of screen
  const handleLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) {
      setUnitHeight(height / 6);
    }
  };

  // Builds the weeks in the month
  useEffect(() => {
    if (today && today.length > 0) {
      const firstOfMonth = new Date(today[0].date.getFullYear(), today[0].date.getMonth(), 1);

      const tempWeeks = Array.from({ length: 6 }).map((_, i) => {
        const date = new Date(firstOfMonth);
        date.setDate(firstOfMonth.getDate() + i * 7);
        return {
          id: date.toISOString(),
          date: date,
        };
      });

      setWeeksObject(tempWeeks);
    }
  }, [today]);

  //render each week
  const renderWeek = ({ item }: { item: { id: string; date: Date } }) => {
    return <WeekBox day={item} weekHeight={unitHeight} />;
  };

  //invisible component to measure screen
  if (weeksObject.length === 0 || unitHeight === 0) {
    return (
      <View ref={ref} onLayout={handleLayout} style={{ flex: 1, backgroundColor: 'transparent' }}>
        <Text>bruh</Text>
      </View>
    );
  }

  //return statement
  return (
    <View style={{ flex: 1 }} ref={ref}>
      <RoundList
        key={`calendar-list-${unitHeight === 0 ? 'loading' : 'ready'}`}
        style={styles.monthContainer}
        data={weeksObject}
        onStartReached={async () => {}}
        onEndReached={async () => {}}
        renderItem={renderWeek}
        extraData={unitHeight}
      ></RoundList>
    </View>
  );
}

const styles = StyleSheet.create({
  monthContainer: {
    flexDirection: 'column',
    backgroundColor: 'white',
    flex: 1,
  },
  weekContainer: {
    width: SCREEN_WIDTH,
  },
});
