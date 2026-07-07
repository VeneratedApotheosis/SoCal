import { useCalendarObjects } from '@/components/contexts/calendar-obj-context';
import { useScreenSize } from '@/components/contexts/screen-size-context';
import { useUIContext } from '@/components/contexts/ui-context';
import { getPositions } from '@/utility/drawerUtil';
import { getIconColor } from '@/utility/globalStyles';
import { calendarObj } from '@/utility/types';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { getFolderModal } from '../customDrawer';
import CalendarSettingsColorModal from './drawer-calendar-settings-color-modal';

const menuHeight = 116;
const menuWidth = 150;

export interface CalendarSettingsModal {
  isVisible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  calendar: calendarObj;
  top: number;
  left: number;
}

export default function CalendarSettingsModal({ isVisible, setVisible, calendar, top, left }: CalendarSettingsModal) {
  const buttonRef = useRef<View>(null);
  const [isColorsVisible, setColorsVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const { toggleTransparent, toggleIsolate } = useCalendarObjects();

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useScreenSize();

  const { theme } = useUIContext();
  const styles = getFolderModal(theme.isDark, menuWidth, menuHeight);
  const iconColor = getIconColor(theme.isDark);

  return (
    <>
      {/* --- SETTINGS MODAL --- */}
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setVisible(false);
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
                getPositions(buttonRef, setMenuPos, menuHeight, menuWidth, SCREEN_WIDTH, SCREEN_HEIGHT);
                setColorsVisible(true);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name={'color-palette-outline'} size={13} color={iconColor} />
                <Text style={styles.menuText}>Color</Text>
              </View>
              <View>
                <Ionicons name={'chevron-forward-outline'} size={13} color={iconColor} />
              </View>
            </Pressable>
          </View>
          <CalendarSettingsColorModal
            isVisible={isColorsVisible}
            setVisible={setColorsVisible}
            setParentVisible={setVisible}
            calendar={calendar}
            top={menuPos.top}
            left={menuPos.left}
          />

          <Pressable
            style={styles.menuItem}
            onPress={() => {
              toggleIsolate(calendar.calendarId);
            }}
          >
            <Text style={styles.menuText}>Isolate</Text>
          </Pressable>
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              toggleTransparent(calendar.calendarId);
              setVisible(false);
            }}
          >
            <Text style={styles.menuText}>Make Transparent</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}
