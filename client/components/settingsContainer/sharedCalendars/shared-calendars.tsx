import { globalStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useCalendarEvents } from '../../contexts/calendar-events-context';
import ShareModal, { shareModalRef } from './share-modal';
import SharedCalendarIndividual from './shared-calendar-individual';

export default function SharedCalendars() {
  const { sharedCalendars = [] } = useCalendarEvents();

  const [viewMode, setViewMode] = useState('calendars');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Only calendars with shared users
  const activeCalendars = useMemo(() => {
    return sharedCalendars.filter((cal) => cal.sharedIds && cal.sharedIds.length > 0);
  }, [sharedCalendars]);

  // User-centric sharedCal array
  const usersWithAccess = useMemo(() => {
    const userMap: Record<string, { id: string; calendars: { calName: string; accessRole: string; calId: string }[] }> = {};

    activeCalendars.forEach((cal) => {
      cal.sharedIds.forEach((shared) => {
        if (!userMap[shared.id]) {
          userMap[shared.id] = { id: shared.id, calendars: [] };
        }
        userMap[shared.id].calendars.push({
          calId: cal.id,
          calName: cal.name,
          accessRole: shared.accessRole,
        });
      });
    });

    // THE FIX: Convert the Object back into an Array!
    return Object.values(userMap);
  }, [activeCalendars]);

  // Helper to toggle accordion
  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Helper to switch views (resets expanded state)
  const switchViewMode = (mode: string) => {
    setViewMode(mode);
    setExpandedId(null);
  };

  return (
    <View style={styles.sharedAccessSection}>
      <View style={globalStyles.rowHeader}>
        <Text style={globalStyles.headerText}>Shared Access</Text>

        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && globalStyles.pressedButton]}
          onPress={() => shareModalRef.current?.present()}
        >
          <Text style={styles.addButtonText}>+ share</Text>
        </Pressable>
      </View>

      {/* Toggle Controls */}
      <View style={globalStyles.toggleButtonContainer}>
        <Pressable
          style={({ pressed }) => [
            globalStyles.toggleButtonSegment,
            viewMode === 'calendars' && globalStyles.toggleButtonActiveSegement,
            pressed && globalStyles.pressedButton,
          ]}
          onPress={() => switchViewMode('calendars')}
        >
          <Text style={[globalStyles.smallButtonText, viewMode === 'calendars' && globalStyles.activeSmallButtonText]}>By Calendar</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            globalStyles.toggleButtonSegment,
            viewMode === 'users' && globalStyles.toggleButtonActiveSegement,
            ,
            pressed && globalStyles.pressedButton,
          ]}
          onPress={() => switchViewMode('users')}
        >
          <Text style={[globalStyles.smallButtonText, viewMode === 'users' && globalStyles.activeSmallButtonText]}>By User</Text>
        </Pressable>
      </View>
      {/* View Mode: Calendars */}
      {viewMode === 'calendars' && (
        <View style={styles.listContainer}>
          {activeCalendars.length === 0 ? (
            <Text style={styles.emptyText}>No shared calendars found.</Text>
          ) : (
            activeCalendars.map((cal) => {
              const isExpanded = expandedId === cal.id;
              return (
                <View key={cal.id} style={[styles.accordionContainer, globalStyles.bottomRightShadow]}>
                  <Pressable
                    style={({ pressed }) => [styles.accordionHeader, pressed && globalStyles.pressedButton]}
                    onPress={() => handleToggle(cal.id)}
                  >
                    <Text style={styles.accordionTitle}>{cal.name}</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{cal.sharedIds.length}</Text>
                    </View>
                  </Pressable>

                  {isExpanded && (
                    <View style={styles.accordionContent}>
                      {cal.sharedIds.map((user, idx) => (
                        <SharedCalendarIndividual
                          calName={cal.name}
                          accessRole={user.accessRole}
                          calId={cal.id}
                          userId={user.id}
                          idx={idx}
                          type="user"
                        />
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      )}

      {/* View Mode: Users */}
      {viewMode === 'users' && (
        <View style={styles.listContainer}>
          {usersWithAccess.length === 0 ? (
            <Text style={styles.emptyText}>No shared users found.</Text>
          ) : (
            usersWithAccess.map((user) => {
              const isExpanded = expandedId === user.id;
              return (
                <View key={user.id} style={[styles.accordionContainer, globalStyles.bottomRightShadow]}>
                  <Pressable
                    style={({ pressed }) => [styles.accordionHeader, pressed && { opacity: 0.7 }]}
                    onPress={() => handleToggle(user.id)}
                  >
                    <Text style={styles.accordionTitle} numberOfLines={1} ellipsizeMode="middle">
                      {user.id}
                    </Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{user.calendars.length}</Text>
                    </View>
                  </Pressable>

                  {isExpanded && (
                    <View style={styles.accordionContent}>
                      {user.calendars.map((cal, idx) => (
                        <SharedCalendarIndividual
                          calName={cal.calName}
                          accessRole={cal.accessRole}
                          calId={cal.calId}
                          userId={user.id}
                          idx={idx}
                          type="cal"
                        />
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      )}

      <ShareModal />
    </View>
  );
}

const styles = StyleSheet.create({
  sharedAccessSection: {
    marginVertical: 10,
  },
  listContainer: {
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
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9F9F9',
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.main,
    marginRight: 10,
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  accordionContent: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#F9F9F9',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CCC',
  },
  detailName: {
    fontSize: 14,
    color: COLORS.text.main,
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

  addButton: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  addButtonText: { fontSize: 12, fontWeight: '600', color: COLORS.primaryDark },
});
