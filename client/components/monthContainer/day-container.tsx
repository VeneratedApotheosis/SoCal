import { Text, View } from 'react-native';

// --- CONSTANTS ---
const GRID_COLOR = '#f0f0f0';

export default function DayBox({ day, weekHeight, dayWidth, key }: { day: Date; weekHeight: number; dayWidth: number; key: string }) {
  return (
    <View
      style={{
        width: dayWidth,
        height: weekHeight,
        borderWidth: 1,
        borderColor: GRID_COLOR,
        flex: 1,
      }}
      key={key}
    >
      <Text>{day.getDate()}</Text>
    </View>
  );
}
