import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
// Adjust these imports to match your project's context path=
import { calendarObj } from '@/utility/types';
import { useCalendarObjects } from '../contexts/calendar-obj-context';

export interface CalendarSelectionModalInterface {
  isVisible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCalendarId: string | undefined;
  onSelectCalendar: (calendar: calendarObj) => void;
}

export default function CalendarSelectionModal({
  isVisible,
  setVisible,
  selectedCalendarId,
  onSelectCalendar,
}: CalendarSelectionModalInterface) {
  const { calendarObjs } = useCalendarObjects();
  const [ownedCalendars, setOwnedCalendars] = useState<calendarObj[]>([]);

  // Filter owned calendars
  useEffect(() => {
    if (isVisible && calendarObjs) {
      const filtered = calendarObjs.filter((cal) => cal.owner === true);
      setOwnedCalendars(filtered);
    }
  }, [isVisible, calendarObjs]);

  const handleSelect = (calendar: calendarObj) => {
    onSelectCalendar(calendar);
    setVisible(false);
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade" onRequestClose={() => setVisible(false)}>
      {/* --- BACKDROP BUTTON --- */}
      <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />

      {/* --- CENTERED SELECTION BOX --- */}
      <View style={styles.centeredContainer} pointerEvents="box-none">
        <View style={styles.menuBox}>
          <Text style={styles.title}>Select Calendar</Text>

          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={true}>
            {ownedCalendars.length === 0 ? (
              <Text style={styles.emptyText}>No writable calendars found.</Text>
            ) : (
              ownedCalendars.map((cal) => {
                const isSelected = cal.calendarId === selectedCalendarId;
                return (
                  <Pressable
                    key={cal.calendarId}
                    style={({ pressed }) => [styles.calendarItem, isSelected && styles.selectedItem, pressed && styles.pressedItem]}
                    onPress={() => handleSelect(cal)}
                  >
                    <View style={styles.leftRowSection}>
                      {/* Optional: Displays a color indicator dot if your calendarObj has colors */}
                      <View style={[styles.colorDot, { backgroundColor: cal.calendarCustomColor || '#4285F4' }]} />
                      <Text style={[styles.calendarName, isSelected && styles.selectedCalendarName]} numberOfLines={1}>
                        {cal.calendarName}
                      </Text>
                    </View>

                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
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

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Subtle dimming overlay
  },
  centeredContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '85%',
    maxWidth: 320,
    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.25)',
    elevation: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  listContainer: {
    marginVertical: 4,
  },
  calendarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginVertical: 2,
  },
  selectedItem: {
    backgroundColor: '#F0F4FF', // Light tint for selection highlight
  },
  pressedItem: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  leftRowSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  calendarName: {
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
  selectedCalendarName: {
    fontWeight: '600',
    color: '#1A73E8',
  },
  checkmark: {
    color: '#1A73E8',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  cancelText: {
    color: '#666',
    fontWeight: '500',
  },
});
