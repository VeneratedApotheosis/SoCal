import { DRAWER_DRAGGABLE_HEIGHT } from '@/utility/constants';
import { getPositions } from '@/utility/drawerUtil';
import { lightenColor } from '@/utility/eventUtils';
import { calendarObj } from '@/utility/types';

import { Ionicons } from '@expo/vector-icons';
import { useContext, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { UIContext } from '../contexts/ui-context';
import CalendarSettingsModal from './drawer-calendar-settings-modal';

const menuHeight = 100;
const menuWidth = 150;

export default function CalendarDrawerList({
  calendarObj,
  onToggle,
}: {
  calendarObj: calendarObj;
  onToggle: (calendarId: string) => void;
}) {
  const [isVisible, setVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<View>(null);
  const [opacity, setOpacity] = useState(calendarObj.shown ? 1 : 0.5);

  const { colorCache } = useContext(UIContext);
  const [color, setColor] = useState<string>();

  //Sync color with colorCache
  useEffect(() => {
    setColor(lightenColor(colorCache.getCalendarColor(calendarObj.calendarId), 'border'));
  }, [colorCache.allCaches, colorCache.activeCacheId]);

  return (
    <View key={calendarObj.calendarId} style={styles.calendarItem}>
      {/* --- SQURAE AND NAME --- */}
      <View style={styles.calendarInfo}>
        <View
          style={[
            styles.colorSquare,
            {
              backgroundColor: color || calendarObj.calendarDefaultColor,
              opacity: opacity,
            },
          ]}
        />
        <Text style={[styles.calendarName, { opacity: opacity }]} numberOfLines={1}>
          {calendarObj.calendarName}
        </Text>
      </View>

      {/* --- BUTTONS --- */}
      <View style={{ flexDirection: 'row' }}>
        {/* --- SETTINGS BUTTON --- */}
        <View ref={buttonRef} collapsable={false}>
          <Pressable
            onPress={() => {
              getPositions(buttonRef, setMenuPos, menuHeight, menuWidth);
              setVisible(true);
            }}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressedButton]}
          >
            <Ionicons name={'ellipsis-horizontal-outline'} size={14} color={opacity === 1 ? '#333' : '#ccc'} />
          </Pressable>
        </View>
        {/* --- SETTINGS MODAL --- */}
        <CalendarSettingsModal isVisible={isVisible} setVisible={setVisible} calendar={calendarObj} top={menuPos.top} left={menuPos.left} />

        {/* --- VISIBILITY TOGGLE --- */}
        <Pressable
          onPress={() => {
            setOpacity(opacity === 0.5 ? 1 : 0.5);
            onToggle(calendarObj.calendarId);
          }}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressedButton]}
        >
          <Ionicons name={calendarObj.shown ? 'eye-outline' : 'eye-off-outline'} size={14} color={opacity === 1 ? '#333' : '#ccc'} />
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  calendarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    backgroundColor: 'white',
    height: DRAWER_DRAGGABLE_HEIGHT,
  },
  calendarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorSquare: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 12,
  },
  calendarName: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  iconButton: {
    padding: 4,
  },
  pressedButton: {
    transform: [{ scale: 0.96 }],
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuBox: {
    position: 'absolute',
    backgroundColor: '#eeeeee',
    borderRadius: 8,
    padding: 5,
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    minWidth: 150,
  },
  menuItem: { padding: 12 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 4 },
});
