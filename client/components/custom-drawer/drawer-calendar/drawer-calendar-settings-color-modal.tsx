import { lightenColor } from '@/utility/eventColorUtil';
import { calendarObj } from '@/utility/types';
import { Modal, Pressable, View } from 'react-native';
import { useUIContext } from '../../contexts/ui-context';
import { getCalendarColorModal } from '../customDrawer';

export default function CalendarSettingsColorModal({
  isVisible,
  setVisible,
  setParentVisible,
  calendar,
  top,
  left,
}: {
  isVisible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setParentVisible: React.Dispatch<React.SetStateAction<boolean>>;
  calendar: calendarObj;
  top: number;
  left: number;
}) {
  const { colorCache, theme } = useUIContext();
  const styles = getCalendarColorModal(theme.isDark);
  const thisColor = colorCache.allCaches[colorCache.activeCacheId].colorMap[calendar.calendarId];

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        setVisible(false);
      }} // Handles Android hardware back button><Modal/>);
    >
      {/* --- BACKDROP BUTTON --- */}
      <Pressable
        style={styles.backdrop}
        onPress={() => {
          setVisible(false);
          setTimeout(() => {
            setParentVisible(false);
          }, 50);
        }}
      />

      {/* --- COLORS CONTAINER --- */}
      <View
        style={[
          styles.menuBox,
          {
            top: top,
            left: left,
          },
        ]}
      >
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {colorCache.allCaches[colorCache.activeCacheId].palette.map((color) => (
            <Pressable
              key={color + ' ' + calendar.calendarId}
              style={({ pressed }) => [
                styles.colorButton,
                { backgroundColor: lightenColor(color, 'border', theme.isDark) },
                pressed && styles.pressedButton,
                thisColor === color && { boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)' },
              ]}
              onPress={() => {
                colorCache.setManualCalendarColor(calendar.calendarId, color);
              }}
            />
          ))}
        </View>
      </View>
    </Modal>
  );
}
