import { getPositions } from '@/utility/drawerUtil';
import { lightenColor } from '@/utility/eventColorUtil';
import { calendarObj } from '@/utility/types';

import { useCalendarObjects } from '@/components/contexts/calendar-obj-context';
import { useScreenSize } from '@/components/contexts/screen-size-context';
import { getIconColor } from '@/utility/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useUIContext } from '../../contexts/ui-context';
import { getCalendarIndividual } from '../customDrawer';
import CalendarSettingsModal from './drawer-calendar-settings-modal';

const menuHeight = 116;
const menuWidth = 150;

export default function CalendarDrawerList({
  calendarObj,
  onToggle,
  isolated,
}: {
  calendarObj: calendarObj;
  onToggle: (calendarId: string) => void;
  isolated: 'NA' | 'true' | 'false';
}) {
  const { colorCache, theme } = useUIContext();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useScreenSize();
  const { hiddenCalendarHook } = useCalendarObjects();

  const [isVisible, setVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<View>(null);
  const displayed = !hiddenCalendarHook.hiddenCalendars.includes(calendarObj.calendarId || '');
  const [opacity, setOpacity] = useState(() => {
    if (isolated === 'NA') return displayed ? 1 : 0.5;
    else return isolated === 'true' ? 1 : 0.5;
  });

  useEffect(() => {
    setOpacity(() => {
      if (isolated === 'NA') return displayed ? 1 : 0.5;
      else return isolated === 'true' ? 1 : 0.5;
    });
  }, [calendarObj.shown, hiddenCalendarHook.hiddenCalendars, isolated]);

  const styles = getCalendarIndividual(theme.isDark);
  const iconColor = getIconColor(theme.isDark, opacity !== 1);

  const [color, setColor] = useState<string>();

  //Sync color with colorCache
  useEffect(() => {
    setColor(lightenColor(colorCache.getCalendarColor(calendarObj.calendarId), 'border', theme.isDark));
  }, [colorCache.allCaches, colorCache.activeCacheId, lightenColor, theme.isDark]);

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
      <View style={{ flexDirection: 'row', gap: 2 }}>
        {isolated === 'NA' && (
          <>
            {/* --- SETTINGS BUTTON --- */}
            <View ref={buttonRef} collapsable={false}>
              <Pressable
                onPress={() => {
                  getPositions(buttonRef, setMenuPos, menuHeight, menuWidth, SCREEN_WIDTH, SCREEN_HEIGHT);
                  setVisible(true);
                }}
                style={({ pressed }) => [styles.iconButton, pressed && styles.pressedButton, isVisible && styles.selectedIcon]}
              >
                <Ionicons name={'ellipsis-horizontal-outline'} size={14} color={iconColor} />
              </Pressable>
            </View>
            {/* --- SETTINGS MODAL --- */}
            <CalendarSettingsModal
              isVisible={isVisible}
              setVisible={setVisible}
              calendar={calendarObj}
              top={menuPos.top}
              left={menuPos.left}
            />
          </>
        )}

        {/* --- VISIBILITY TOGGLE --- */}
        <Pressable
          onPress={() => {
            setOpacity(opacity === 0.5 ? 1 : 0.5);
            onToggle(calendarObj.calendarId);
          }}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressedButton]}
        >
          <Ionicons name={displayed ? 'eye-outline' : 'eye-off-outline'} size={14} color={iconColor} />
        </Pressable>
      </View>
    </View>
  );
}
