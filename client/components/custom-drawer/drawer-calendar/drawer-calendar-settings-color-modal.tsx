import { calendarObj } from '@/utility/types';
import { useContext } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { UIContext } from '../../contexts/ui-context';

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
  const { colorCache } = useContext(UIContext);

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
            style={({ pressed }) => [styles.colorButton, { backgroundColor: color }, pressed && styles.pressedButton]}
            onPress={() => {
              colorCache.setManualCalendarColor(calendar.calendarId, color);
            }}
          />
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuBox: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 6,
    width: 150,

    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)',

    // Android Settings
    elevation: 10,
  },
  colorButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  pressedButton: {
    transform: [{ scale: 0.9 }],
  },
});
