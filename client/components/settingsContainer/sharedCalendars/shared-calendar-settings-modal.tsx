import { useCalendarObjects } from '@/components/contexts/calendar-obj-context';
import { useUIContext } from '@/components/contexts/ui-context';
import { useUnshareCalendar } from '@/hooks/sharingCalendars/useUnshareCalendar';
import { useAuth } from '@/hooks/useAuth';
import { getModalStyles, globalStyles } from '@/utility/globalStyles';
import { Keyboard, Modal, Pressable, Text, View } from 'react-native';

export const sharedSettingsModalHeight = 50;
export const sharedSettingsModalWidth = 100;
export interface ShareCalendarSettingsModalProps {
  isVisible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  top: number;
  left: number;
  calId: string;
  email: string;
}

export default function SharedCalendarSettingsModal({ isVisible, setVisible, top, left, calId, email }: ShareCalendarSettingsModalProps) {
  const { unshare, isLoading, error, clearError } = useUnshareCalendar();
  const { refetchCalendarList } = useCalendarObjects();
  const { theme } = useUIContext();
  const styles = getModalStyles(theme.isDark, sharedSettingsModalWidth, sharedSettingsModalHeight);
  const { getValidJwt } = useAuth();

  const handleUnshare = async () => {
    const jwtToken = await getValidJwt();
    if (!email || !calId || !jwtToken) return;
    const result = await unshare(calId, email, jwtToken);
    if (result.success) {
      refetchCalendarList();
    }
    setVisible(false);
  };

  return (
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
      <View style={[styles.menuBox, { top: top, left: left }]}>
        <Pressable style={({ pressed }) => [styles.menuItem, pressed && globalStyles.pressedButton]} onPress={handleUnshare}>
          {isLoading ? <Text style={styles.menuText}>Removing...</Text> : <Text style={styles.menuText}>unshare</Text>}
        </Pressable>
      </View>
    </Modal>
  );
}
