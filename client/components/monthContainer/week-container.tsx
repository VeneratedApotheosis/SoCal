import { useLayoutEffect, useRef, useState } from 'react';
import { Dimensions, View } from 'react-native';
import DayBox from './day-container';

// --- CONSTANTS ---
const SCREEN_WIDTH = Dimensions.get('window').width;

// --- WeekBox Element (NEEDS TO BE ABSTRACTED AWAY) ---
export default function WeekBox({ day, weekHeight }: { day: { id: string; date: Date }; weekHeight: number }) {
  const ref = useRef(null);
  const [unitWidth, setUnitWidth] = useState(SCREEN_WIDTH / 7);
  const [daysOfWeek, setDaysOfWeek] = useState<Date[]>([]);

  //create a list of days in the week
  useLayoutEffect(() => {
    const tempDays = [];
    for (let i = 0; i < 7; i++) {
      const tempDay = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate() + i);
      tempDays.push(tempDay);
      setDaysOfWeek(tempDays);
    }
  }, []);

  //return statement
  return (
    <View style={{ flex: 1, flexDirection: 'row' }} ref={ref}>
      {daysOfWeek.map((dayItem) => (
        <DayBox key={dayItem.toISOString()} day={dayItem} weekHeight={weekHeight} dayWidth={unitWidth} />
      ))}
    </View>
  );
}
