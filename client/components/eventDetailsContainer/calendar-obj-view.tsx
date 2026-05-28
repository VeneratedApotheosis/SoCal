import { lightenColor } from '@/utility/eventUtils';
import { COLORS } from '@/utility/theme';
import { calendarObj } from '@/utility/types';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuthContext } from '../contexts/auth-context';
import { useCalendarObjects } from '../contexts/calendar-obj-context';
import { useUIContext } from '../contexts/ui-context';
import CalendarSelectionModal from './calendar-obj-view-modal';

export default function CalendarObjView({ calendar }: { calendar: calendarObj }) {
  const { familyProfiles } = useAuthContext();
  const { calendarObjs } = useCalendarObjects();

  //  -------------------------------------------
  // Local Calendar Object
  //  -------------------------------------------
  const [localCalendar, setLocalCalendar] = useState<calendarObj | undefined>(() => {
    if (calendar && calendar.calendarId) return calendar;

    // Fallback: Find the primary calendar matching the parent's ID
    const parentId = familyProfiles?.parent?.email;
    return calendarObjs?.find((c) => c.calendarId === parentId);
  });

  useEffect(() => {
    if (calendar && calendar.calendarId) {
      setLocalCalendar(calendar);
      return;
    } else {
      if (!localCalendar && calendarObjs) {
        const parentId = familyProfiles?.parent?.email;
        const primaryCal = calendarObjs.find((c) => c.calendarId === parentId);
        setLocalCalendar(primaryCal);
      }
    }
  }, [calendarObjs, familyProfiles, calendar]);

  // -------------------------------------------
  // Color
  // -------------------------------------------
  const { colorCache } = useUIContext();
  const [color, setColor] = useState<string>('#00FFFF');

  useEffect(() => {
    if (localCalendar) {
      setColor(lightenColor(colorCache.getCalendarColor(localCalendar.calendarId), 'border'));
    }
  }, [colorCache.allCaches, colorCache.activeCacheId, localCalendar]);

  // -------------------------------------------
  // Modal Stuff
  // -------------------------------------------
  const buttonRef = useRef<View>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  return (
    <>
      <Pressable
        style={styles.listRow}
        ref={buttonRef}
        onPress={() => {
          setIsVisible(true);
        }}
      >
        <View style={[styles.calDot, { backgroundColor: color }]} />
        <Text style={styles.listText} numberOfLines={1}>
          {localCalendar?.calendarName}
        </Text>
      </Pressable>

      <CalendarSelectionModal
        isVisible={isVisible}
        setVisible={setIsVisible}
        selectedCalendarId={localCalendar?.calendarId}
        onSelectCalendar={() => {}}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  bar: { height: 1, backgroundColor: '#f0f0ee', marginVertical: 16 },

  // Title — no fixed height, wraps naturally
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text.main,
    lineHeight: 34,
    paddingVertical: 4,
    marginBottom: 4,
    // no fixed height — grows/shrinks via onContentSizeChange
  },

  // Properties list
  listBlock: { marginVertical: 4 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 },
  listDivider: { height: 1, backgroundColor: '#f0f0ee' },
  icon: { fontSize: 16, width: 20, textAlign: 'center' },
  calDot: { width: 13, height: 13, borderRadius: 3, marginLeft: 2, marginRight: 1 },
  listInput: { flex: 1, fontSize: 15, color: '#37352f', padding: 0 },
  listText: { flex: 1, fontSize: 15, color: '#37352f' },
  listTextMuted: { flex: 1, fontSize: 15, color: '#9b9b97' },

  // Description
  descriptionInput: {
    fontSize: 15,
    color: '#37352f',
    lineHeight: 22,
    minHeight: 80,
    paddingVertical: 0,
    textAlignVertical: 'top',
  },

  // Buttons
  actionBlock: { gap: 10 },
  actionRow: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: { backgroundColor: '#2383e2' },
  primaryBtnPressed: { backgroundColor: '#1d6ebc' },
  primaryBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  secondaryBtn: { backgroundColor: '#f1f1ef' },
  btnPressed: { backgroundColor: '#e4e4e1' },
  secondaryBtnText: { fontSize: 14, fontWeight: '500', color: '#37352f' },
  deleteBtn: { backgroundColor: '#fff0f0' },
  deleteBtnPressed: { backgroundColor: '#fde0e0' },
  deleteBtnText: { fontSize: 14, fontWeight: '500', color: '#d44c47' },
});
