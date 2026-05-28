import { useCalendarGroups } from '@/components/contexts/calendar-groups-context';
import { getPositions } from '@/utility/drawerUtil';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Keyboard, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import FolderSettingsRenameModal from './drawer-folder-rename-modal';

const menuHeight = 82;
const menuWidth = 150;

export interface CalendarSettingsModal {
  isVisible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  calId: string;
  top: number;
  left: number;
}

export default function FolderSettingsModal({ isVisible, setVisible, calId, top, left }: CalendarSettingsModal) {
  const buttonRef = useRef<View>(null);
  const [isColorsVisible, setColorsVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const { calendarGroups } = useCalendarGroups();

  return (
    <>
      {/* --- SETTINGS MODAL --- */}
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setVisible(false);
          Keyboard.dismiss();
        }}
      >
        {/* --- BACKDROP BUTTON --- */}
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />

        {/* --- SETTINGS MENU BOX --- */}
        <View
          style={[
            styles.menuBox,
            {
              top: top,
              left: left,
            },
          ]}
        >
          {/* --- COLORS BUTTON --- */}
          <View ref={buttonRef} collapsable={false}>
            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.pressedButton]}
              onPress={() => {
                getPositions(buttonRef, setMenuPos, menuHeight, menuWidth);
                setColorsVisible(true);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name={'create-outline'} size={13} />
                <Text>Rename</Text>
              </View>
              <View>
                <Ionicons name={'chevron-forward-outline'} size={13} />
              </View>
            </Pressable>
          </View>
          <FolderSettingsRenameModal
            isVisible={isColorsVisible}
            setVisible={setColorsVisible}
            setParentVisible={setVisible}
            calId={calId}
            top={menuPos.top}
            left={menuPos.left}
          />

          <Pressable style={styles.menuItem} onPress={() => calendarGroups.deleteGroup(calId)}>
            <Text>Remove</Text>
          </Pressable>
        </View>
      </Modal>
    </>
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
    minWidth: menuWidth,
    minHeight: menuHeight,
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)',

    elevation: 10,
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pressedButton: {
    transform: [{ scale: 0.96 }],
  },
});
