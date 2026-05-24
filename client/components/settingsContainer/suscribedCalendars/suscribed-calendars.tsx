import { globalStyles } from '@/utility/globalStyles';
import { calendarObj } from '@/utility/types';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useCalendarEvents } from '../../contexts/calendar-events-context';
import SuscribedCalendarIndividual from './suscribed-calendar-individual';

export default function SuscribedCalendars() {
  const { calendarObjs } = useCalendarEvents();

  // Only calendars with shared users
  const suscribedCalendars: calendarObj[] = useMemo(() => {
    if (!calendarObjs) return [];
    return calendarObjs.filter((cal) => cal.owner === false);
  }, [calendarObjs]);

  return (
    <View style={styles.sharedAccessSection}>
      <View style={globalStyles.rowHeader}>
        <Text style={globalStyles.headerText}>Suscribed Calendars</Text>
      </View>

      {/* View Mode: Calendars */}
      <View style={styles.listContainer}>
        {suscribedCalendars.length === 0 ? (
          <Text style={styles.emptyText}>No shared calendars found.</Text>
        ) : (
          suscribedCalendars.map((cal) => {
            return <SuscribedCalendarIndividual cal={cal} />;
          })
        )}
      </View>
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
});
