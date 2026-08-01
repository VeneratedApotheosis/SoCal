import { lightenColor } from '@/utility/eventColorUtil';
import { getIconColor } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { calendarObj } from '@/utility/types';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useCalendarObjects } from '../contexts/calendar-obj-context';
import { useProfileContext } from '../contexts/profile-context';
import { useUIContext } from '../contexts/ui-context';
import CalendarSelectionModal from './calendar-obj-view-modal';
import { calendarObjViewStyles } from './eventDetailsStyles';

export interface CalendarObjViewProps {
  calendarId: string;
  creatingEvent: boolean;
  calendarObjectSelect: (calendarId: string) => void;
}

export default function CalendarObjView({ calendarId, creatingEvent, calendarObjectSelect }: CalendarObjViewProps) {
  const { familyProfiles } = useProfileContext();
  const { calendarObjs } = useCalendarObjects();
  const { theme } = useUIContext();
  const styles = calendarObjViewStyles(theme.isDark);

  // ─── Local Calendar Object ───────────────────────────────────────────────────────────

  const [localCalendar, setLocalCalendar] = useState<calendarObj | undefined>(() => {
    const calendar = calendarObjs?.find((c) => c.calendarId === calendarId);
    if (calendar) return calendar;

    // Fallback: Find the primary calendar matching the parent's ID
    const parentId = familyProfiles?.parent?.email;
    return calendarObjs?.find((c) => c.calendarId === parentId);
  });

  useEffect(() => {
    const calendar = calendarObjs?.find((c) => c.calendarId === calendarId);
    if (calendar) {
      setLocalCalendar(calendar);
      return;
    } else {
      if (!localCalendar && calendarObjs) {
        const parentId = familyProfiles?.parent?.email;
        const primaryCal = calendarObjs.find((c) => c.calendarId === parentId);
        setLocalCalendar(primaryCal);
      }
    }
  }, [calendarObjs, familyProfiles, calendarId]);

  // ─── Color ───────────────────────────────────────────────────────────

  const { colorCache } = useUIContext();
  const [color, setColor] = useState<string>(theme.isDark ? COLORS.primaryy.light : COLORS.primaryy.dark);
  const iconColor = getIconColor(theme.isDark, true);

  useEffect(() => {
    if (localCalendar) {
      setColor(lightenColor(colorCache.getCalendarColor(localCalendar.calendarId), 'border'));
    }
  }, [colorCache.allCaches, colorCache.activeCacheId, localCalendar]);

  // ─── Modal Stuff ───────────────────────────────────────────────────────────

  const buttonRef = useRef<View>(null);
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <Pressable
        style={styles.listRow}
        ref={buttonRef}
        onPress={() => {
          if (creatingEvent && localCalendar) setIsVisible(true);
        }}
      >
        <View style={styles.leftRow}>
          <View style={[styles.calDot, { backgroundColor: color }]} />
          {localCalendar ? (
            <Text style={styles.listText} numberOfLines={1}>
              {localCalendar?.calendarName}
            </Text>
          ) : (
            <Text style={styles.noCalsText} numberOfLines={1}>
              No Calendars Found.
            </Text>
          )}
        </View>
        {creatingEvent && localCalendar && <Ionicons name="chevron-forward-outline" size={20} color={iconColor} />}
      </Pressable>

      <CalendarSelectionModal
        isVisible={isVisible}
        setVisible={setIsVisible}
        selectedCalendarId={localCalendar?.calendarId}
        onSelectCalendar={calendarObjectSelect}
      />
    </>
  );
}
