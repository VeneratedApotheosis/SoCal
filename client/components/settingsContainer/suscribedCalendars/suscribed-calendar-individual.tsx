import AccessRoleIndicator from '@/components/AccessRoleIndicator';
import { useScreenSize } from '@/components/contexts/screen-size-context';
import { useUIContext } from '@/components/contexts/ui-context';
import { getPositions } from '@/utility/drawerUtil';
import { getIconColor, globalStyles } from '@/utility/globalStyles';
import { calendarObj } from '@/utility/types';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { getSharedCalIndividualStyles } from '../settingsContainerStyles';
import SuscribedSettingsModal, { suscribedSettingsModalHeight, suscribedSettingsModalWidth } from './suscribed-settings-modal';

export interface SharedCalIndividualProps {
  cal: calendarObj;
}

export default function SuscribedCalendarIndividual({ cal }: SharedCalIndividualProps) {
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [isVisible, setVisible] = useState(false);
  const buttonRef = useRef<View>(null);
  const { theme } = useUIContext();

  const shareStyles = getSharedCalIndividualStyles(theme.isDark);
  const iconColor = getIconColor(theme.isDark);
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useScreenSize();

  return (
    <View key={cal.calendarId} style={shareStyles.detailRow}>
      <AccessRoleIndicator accessRole={cal.accessRole} />
      <Text style={shareStyles.detailName} numberOfLines={1}>
        {cal.calendarName}
      </Text>

      {/* --- SETTINGS BUTTON --- */}
      <View ref={buttonRef} collapsable={false}>
        <Pressable
          onPress={() => {
            getPositions(buttonRef, setMenuPos, suscribedSettingsModalHeight, suscribedSettingsModalWidth, SCREEN_WIDTH, SCREEN_HEIGHT);
            setVisible(true);
          }}
          style={({ pressed }) => [shareStyles.iconButton, pressed && globalStyles.pressedButton]}
        >
          <Ionicons name={'ellipsis-horizontal-circle-outline'} size={20} color={iconColor} />
        </Pressable>
      </View>
      <SuscribedSettingsModal isVisible={isVisible} setVisible={setVisible} top={menuPos.top} left={menuPos.left} calId={cal.calendarId} />
    </View>
  );
}
