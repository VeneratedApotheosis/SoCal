import { useCalendarGroupsContext } from '@/components/contexts/calendar-groups-context';
import { useScreenSize } from '@/components/contexts/screen-size-context';
import { useUIContext } from '@/components/contexts/ui-context';
import { getPositions } from '@/utility/drawerUtil';
import { getIconColor } from '@/utility/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Keyboard, Modal, Pressable, Text, View } from 'react-native';
import { getFolderModal } from '../customDrawer';
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
  const { calendarGroups } = useCalendarGroupsContext();
  const { theme } = useUIContext();
  const styles = getFolderModal(theme.isDark, menuWidth, menuHeight);
  const iconColor = getIconColor(theme.isDark);
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useScreenSize();

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
                getPositions(buttonRef, setMenuPos, menuHeight, menuWidth, SCREEN_WIDTH, SCREEN_HEIGHT);
                setColorsVisible(true);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name={'create-outline'} size={13} color={iconColor} />
                <Text style={styles.menuText}>Rename</Text>
              </View>
              <View>
                <Ionicons name={'chevron-forward-outline'} size={13} color={iconColor} />
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
            <Text style={styles.menuText}>Remove</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}
