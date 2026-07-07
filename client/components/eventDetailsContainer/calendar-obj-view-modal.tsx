import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
// Adjust these imports to match your project's context path=
import { lightenColor } from '@/utility/eventColorUtil';
import { COLORS } from '@/utility/theme';
import { calendarObj } from '@/utility/types';
import { Ionicons } from '@expo/vector-icons';
import { useCalendarObjects } from '../contexts/calendar-obj-context';
import { useUIContext } from '../contexts/ui-context';
import { calendarObjModalStyles } from './eventDetailsStyles';

export interface CalendarSelectionModalInterface {
  isVisible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCalendarId: string | undefined;
  onSelectCalendar: (calendarId: string) => void;
}

export default function CalendarSelectionModal({
  isVisible,
  setVisible,
  selectedCalendarId,
  onSelectCalendar,
}: CalendarSelectionModalInterface) {
  const { calendarObjs } = useCalendarObjects();
  const [ownedCalendars, setOwnedCalendars] = useState<calendarObj[]>([]);
  const { colorCache, theme } = useUIContext();
  const styles = calendarObjModalStyles(theme.isDark);
  // Filter owned calendars
  useEffect(() => {
    if (isVisible && calendarObjs) {
      const filtered = calendarObjs.filter((cal) => cal.accessRole === 'owner' || cal.accessRole === 'writer');
      setOwnedCalendars(filtered);
    }
  }, [isVisible, calendarObjs]);

  const handleSelect = (calendar: calendarObj) => {
    onSelectCalendar(calendar.calendarId);
    setVisible(false);
  };

  const displayColors = useMemo(() => {
    return colorCache.allCaches[colorCache.activeCacheId];
  }, [colorCache.allCaches, colorCache.activeCacheId]);

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade" onRequestClose={() => setVisible(false)}>
      {/* --- BACKDROP BUTTON --- */}
      <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />

      {/* --- CENTERED SELECTION BOX --- */}
      <View style={styles.centeredContainer} pointerEvents="box-none">
        <View style={styles.menuBox}>
          <Text style={styles.title}>Select Calendar</Text>

          <ScrollView showsVerticalScrollIndicator={true}>
            {ownedCalendars.length === 0 ? (
              <Text style={styles.emptyText}>No writable calendars found.</Text>
            ) : (
              ownedCalendars.map((cal, index) => {
                const isSelected = cal.calendarId === selectedCalendarId;
                return (
                  <Pressable
                    key={cal.calendarId}
                    style={({ pressed }) => [styles.calendarItem, isSelected && styles.selectedItem, pressed && styles.pressedItem]}
                    onPress={() => handleSelect(cal)}
                  >
                    <View style={styles.leftRowSection}>
                      <View
                        style={[
                          styles.colorDot,
                          { backgroundColor: lightenColor(displayColors.colorMap[cal.calendarId], 'border', theme.isDark) || '#4285F4' },
                        ]}
                      />
                      <Text style={[styles.calendarName, isSelected && styles.selectedCalendarName]} numberOfLines={1}>
                        {cal.calendarName}
                      </Text>
                    </View>

                    {isSelected && (
                      <Ionicons name={'checkmark-outline'} size={16} color={theme.isDark ? COLORS.primaryy.light : COLORS.primaryy.dark} />
                    )}
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          <View style={styles.buttonRow}>
            <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressedItem]} onPress={() => setVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
