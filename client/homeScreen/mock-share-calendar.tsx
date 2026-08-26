import { getColorPaletteStyles, getSettingCardStyles, getSharedCalStyles } from '@/components/settingsContainer/settingsContainerStyles';
import SharedCalendarIndividual from '@/components/settingsContainer/sharedCalendars/shared-calendar-individual';
import { getIconColor } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { Ionicons } from '@expo/vector-icons';
import { Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function MockSharedCalendars() {
  const sharedCalendars = [
    {
      id: '1@group.calendar.google.com',
      name: 'Clubs, James',
      sharedIds: [
        { id: 'Josh@gmail.com', accessRole: 'reader' },
        { id: 'Jose@gmail.com', accessRole: 'reader' },
      ],
    },
    {
      id: 'James@gmail.com',
      name: 'James@gmail.com',
      sharedIds: [
        { id: 'Jose@gmail.com', accessRole: 'reader' },
        { id: 'James2@gmail.com', accessRole: 'writer' },
      ],
    },
    {
      id: '2@group.calendar.google.com',
      name: 'Schedule, James',
      sharedIds: [
        { id: 'Josh@gmail.com', accessRole: 'reader' },
        { id: 'Jose@gmail.com', accessRole: 'reader' },
      ],
    },
    {
      id: '3@group.calendar.google.com',
      name: 'Finals, James',
      sharedIds: [],
    },
    {
      id: '4@group.calendar.google.com',
      name: 'Assignments, James',
      sharedIds: [],
    },
  ];
  const cardStyles = getSettingCardStyles(false);
  const themeStyles = getColorPaletteStyles(false);
  const styles = getSharedCalStyles(false);

  const iconColor = getIconColor(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // ─── Calendar View Modes and Expanded View ───────────────────────────────────────────────────────────

  const [viewMode, setViewMode] = useState('users');
  const [expandedId, setExpandedId] = useState<string[]>([]);

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

    return Object.values(userMap);
  }, [activeCalendars]);

  // Helper to toggle accordion
  const handleToggle = (id: string) => {
    setExpandedId((prev) => {
      const containsId = prev.find((p) => p === id);
      if (containsId) return prev.filter((p) => p !== id);
      else return [...prev, id];
    });
  };

  const switchViewMode = (mode: string) => {
    setViewMode(mode);
    setExpandedId([]);
  };

  return (
    <View style={[cardStyles.container, { flex: 1, marginBottom: 0 }]}>
      {/* --- Trigger (Header) --- */}
      <Pressable onPress={() => {}} style={cardStyles.trigger}>
        <View style={cardStyles.triggerLeft}>
          <Ionicons name="person-outline" size={20} color={iconColor} />
          <Text style={cardStyles.label}>Shared Calendars</Text>
        </View>
        <View style={cardStyles.triggerLeft}>
          <Pressable hitSlop={10} style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => {}}>
            <Plus size={16} color={COLORS.blueAccentDark} style={[themeStyles.plusIcon]} />
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: COLORS.blueAccentDark,
              }}
            >
              Share
            </Text>
          </Pressable>
        </View>
      </Pressable>
      {/* --- Content --- */}
      {isExpanded && (
        <ScrollView style={{ flex: 1 }}>
          <View style={cardStyles.content}>
            {/* Toggle Controls */}
            <View style={styles.toggleButtonContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.toggleButtonSegment,
                  viewMode === 'users' && styles.toggleButtonActiveSegement,
                  ,
                  pressed && styles.pressedButton,
                ]}
                onPress={() => switchViewMode('users')}
              >
                <Text style={[styles.smallButtonText, viewMode === 'users' && styles.activeSmallButtonText]}>By User</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.toggleButtonSegment,
                  viewMode === 'calendars' && styles.toggleButtonActiveSegement,
                  pressed && styles.pressedButton,
                ]}
                onPress={() => switchViewMode('calendars')}
              >
                <Text style={[styles.smallButtonText, viewMode === 'calendars' && styles.activeSmallButtonText]}>By Calendar</Text>
              </Pressable>
            </View>
            {/* View Mode: Calendars */}
            {viewMode === 'calendars' && (
              <View style={styles.listContainer}>
                {activeCalendars.length === 0 ? (
                  <Text style={styles.emptyText}>No shared calendars found.</Text>
                ) : (
                  activeCalendars.map((cal) => {
                    const isExpanded = expandedId.find((p) => p === cal.id);
                    return (
                      <View key={cal.id} style={isExpanded ? styles.selectedAccordionContainer : styles.accordionContainer}>
                        <Pressable
                          style={({ pressed }) => [styles.accordionHeader, pressed && styles.pressedButton]}
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
                    const isExpanded = expandedId.find((p) => p === user.id);
                    return (
                      <View key={user.id} style={isExpanded ? styles.selectedAccordionContainer : styles.accordionContainer}>
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
          </View>
        </ScrollView>
      )}
    </View>
  );
}
