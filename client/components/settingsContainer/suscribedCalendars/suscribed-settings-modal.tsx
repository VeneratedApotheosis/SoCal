import { useCalendarObjects } from '@/components/contexts/calendar-obj-context';
import { useUnshareCalendar } from '@/hooks/sharingCalendars/useUnshareCalendar';
import { unsuscribeCalendar } from '@/services/api';
import { globalStyles } from '@/utility/globalStyles';
import { COLORS, SIZES } from '@/utility/theme';
import { Keyboard, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuthContext } from '../../contexts/auth-context';

export const suscribedSettingsModalHeight = 50;
export const suscribedSettingsModalWidth = 100;
export interface ShareCalendarSettingsModalProps {
  isVisible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  top: number;
  left: number;
  calId: string;
}

export default function SuscribedSettingsModal({ isVisible, setVisible, top, left, calId }: ShareCalendarSettingsModalProps) {
  const { unshare, isLoading } = useUnshareCalendar();
  const { refetchCalendarList } = useCalendarObjects();
  const { jwtToken } = useAuthContext();

  const handleUnshare = async () => {
    if (!calId || !jwtToken) return;
    const result = await unsuscribeCalendar(calId, jwtToken.sessionToken);
    if (result.success) {
      setTimeout(() => {
        refetchCalendarList();
      }, 1000);
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
          {isLoading ? <Text style={styles.menuText}>Removing...</Text> : <Text style={styles.menuText}>unsuscribe</Text>}
        </Pressable>
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
    minWidth: suscribedSettingsModalWidth,
    height: suscribedSettingsModalHeight,
    justifyContent: 'center',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)',

    elevation: 10,
  },
  menuItem: {
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: SIZES.m,
    color: COLORS.text.main,
  },
});
