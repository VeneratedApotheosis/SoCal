import { getPositions } from '@/utility/drawerUtil';
import { globalStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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

  return (
    <View key={`${userId}-${idx}`} style={styles.detailRow}>
      <Text style={styles.detailRole}>{accessRole}</Text>

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
            getPositions(buttonRef, setMenuPos, sharedSettingsModalHeight, sharedSettingsModalWidth);
            setVisible(true);
          }}
          style={({ pressed }) => [styles.iconButton, pressed && globalStyles.pressedButton]}
        >
          <Ionicons name={'ellipsis-horizontal-circle-outline'} size={20} color={'#333'} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CCC',
  },
  detailName: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    marginRight: 10,
  },
  detailRole: {
    fontSize: 12,
    color: '#888',
    textTransform: 'capitalize',
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  iconButton: {
    padding: 4,
  },
});
