import { globalStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { calendarObj } from '@/utility/types';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface SharedCalIndividualProps {
  cal: calendarObj;
}

export default function SuscribedCalendarIndividual({ cal }: SharedCalIndividualProps) {
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [isVisible, setVisible] = useState(false);
  const buttonRef = useRef<View>(null);

  return (
    <View key={cal.calendarId} style={[styles.accordionContainer, globalStyles.bottomRightShadow]}>
      <Text style={styles.accordionTitle}>{cal.calendarName}</Text>

      {/* --- SETTINGS BUTTON --- */}
      <View ref={buttonRef} collapsable={false}>
        {/* <Pressable
          onPress={() => {
            getPositions(buttonRef, setMenuPos, suscribedSettingsModalHeight, suscribedSettingsModalWidth);
            setVisible(true);
          }}
          style={({ pressed }) => [pressed && globalStyles.pressedButton]}
        >
          <Ionicons name={'ellipsis-horizontal-circle-outline'} size={20} color={'#333'} />
        </Pressable> */}
      </View>
      {/* <SuscribedSettingsModal isVisible={isVisible} setVisible={setVisible} top={menuPos.top} left={menuPos.left} calId={cal.calendarId} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  sharedAccessSection: {
    marginTop: 10,
    flex: 1,
  },
  listContainer: {
    flex: 1,
    gap: 12,
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  accordionContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 10,
  },
});
