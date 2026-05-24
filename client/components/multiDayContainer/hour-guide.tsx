import { GRID_COLOR } from '@/utility/constants';
import { Text, View } from 'react-native';

//TODO: add a stylesheet to this
const hours = Array.from({ length: 24 }, (_, i) => i);
export default function HourGuide({ hourHeight, labelWidth }: { hourHeight: number; labelWidth: number }) {
  // Create an array [0, 1, ..., 23]
  return (
    <View
      style={{
        width: labelWidth,
        backgroundColor: 'transparent',
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderTopColor: GRID_COLOR,
        borderRightColor: GRID_COLOR,
      }}
    >
      {hours.map((hour) => (
        <View
          key={hour}
          style={{
            height: hourHeight,
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          {/*todo: dynmically resizing font size depending on how zoomed in stuff is*/}
          <Text style={{ fontSize: 10, color: '#888', marginTop: -6 }}> 
            {hour === 0 ? '' : `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? 'PM' : 'AM'}`}
          </Text>
          {/* Optional: Add a subtle divider line that spans the width */}
        </View>
      ))}
    </View>
  );
}
