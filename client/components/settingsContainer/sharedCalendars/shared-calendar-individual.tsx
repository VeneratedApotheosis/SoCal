import AccessRoleIndicator from '@/components/AccessRoleIndicator';
import { useScreenSize } from '@/components/contexts/screen-size-context';
import { useUIContext } from '@/components/contexts/ui-context';
import { getPositions } from '@/utility/drawerUtil';
import { getIconColor, globalStyles } from '@/utility/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { getSharedCalIndividualStyles } from '../settingsContainerStyles';
import SharedCalendarSettingsModal, { sharedSettingsModalHeight, sharedSettingsModalWidth } from './shared-calendar-settings-modal';

export interface SharedCalIndividualProps {
  calName: string;
  accessRole: string;
  calId: string;
  userId: string;
  idx: number;
  type: 'cal' | 'user';
}

export default function SharedCalendarIndividual({ calName, accessRole, calId, userId, idx, type }: SharedCalIndividualProps) {
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [isVisible, setVisible] = useState(false);
  const buttonRef = useRef<View>(null);
  const { theme } = useUIContext();
  const styles = getSharedCalIndividualStyles(theme.isDark);
  const iconColor = getIconColor(theme.isDark);
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useScreenSize();

  return (
    <View key={`${userId}-${idx}`} style={styles.detailRow}>
      <AccessRoleIndicator accessRole={accessRole} />

      {/* --- INNER TEXT --- */}
      {type === 'user' ? (
        <Text style={styles.detailName} numberOfLines={1} ellipsizeMode="middle">
          {userId}
        </Text>
      ) : (
        <Text style={styles.detailName} numberOfLines={1} ellipsizeMode="middle">
          {calName}
        </Text>
      )}

      {/* --- UNSHARE MODAL --- */}
      <SharedCalendarSettingsModal
        isVisible={isVisible}
        setVisible={setVisible}
        top={menuPos.top}
        left={menuPos.left}
        calId={calId}
        email={userId}
      />

      {/* --- SETTINGS BUTTON --- */}
      <View ref={buttonRef} collapsable={false}>
        <Pressable
          onPress={() => {
            getPositions(buttonRef, setMenuPos, sharedSettingsModalHeight, sharedSettingsModalWidth, SCREEN_WIDTH, SCREEN_HEIGHT);
            setVisible(true);
          }}
          style={({ pressed }) => [styles.iconButton, pressed && globalStyles.pressedButton]}
        >
          <Ionicons name={'ellipsis-horizontal-circle-outline'} size={20} color={iconColor} />
        </Pressable>
      </View>
    </View>
  );
}
