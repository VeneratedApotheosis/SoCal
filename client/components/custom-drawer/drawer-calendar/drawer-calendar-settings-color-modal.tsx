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
        {colorCache.allCaches[colorCache.activeCacheId].palette.map((color) => (
          <Pressable
            key={color + ' ' + calendar.calendarId}
            style={({ pressed }) => [
              styles.colorButton,
              { backgroundColor: lightenColor(color, 'border', theme.isDark) },
              pressed && styles.pressedButton,
            ]}
            onPress={() => {
              colorCache.setManualCalendarColor(calendar.calendarId, color);
            }}
          />
        ))}
      </View>
    </Modal>
  );
}
