import { useCalendarObjects } from '@/components/contexts/calendar-obj-context';
import { useUIContext } from '@/components/contexts/ui-context';
import { getIconColor } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { Ionicons } from '@expo/vector-icons';
import { Plus } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import { Animated, LayoutAnimation, Pressable, Text, View } from 'react-native';
import { getColorPaletteStyles, getSettingCardStyles, getSharedCalStyles } from '../settingsContainerStyles';
import ShareModal from './share-modal';
import SharedCalendarIndividual from './shared-calendar-individual';

export default function SharedCalendars() {
  const { sharedCalendars = [] } = useCalendarObjects();
  console.log(JSON.stringify(sharedCalendars));

  // -------------------------------------------
  // Card Themes and Toggle
  // -------------------------------------------
  const { theme: uiTheme } = useUIContext();
  const cardStyles = getSettingCardStyles(uiTheme.isDark);
  const themeStyles = getColorPaletteStyles(uiTheme.isDark);
  const styles = getSharedCalStyles(uiTheme.isDark);

  const iconColor = getIconColor(uiTheme.isDark);
  const [isExpanded, setIsExpanded] = useState(true);
  const animatedController = useRef(new Animated.Value(0)).current;

  const toggleSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    Animated.timing(animatedController, {
      toValue: isExpanded ? 0 : 1,
      duration: 100,
      useNativeDriver: true,
    }).start();

    setIsExpanded(!isExpanded);
  };

  const arrowRotation = animatedController.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // ─── Calendar View Modes and Expanded View ───────────────────────────────────────────────────────────

  const [viewMode, setViewMode] = useState('users');
  const [expandedId, setExpandedId] = useState<string[]>([]);
  const [isVisible, setVisible] = useState(false);

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
    <View style={cardStyles.container}>
      {/* --- Trigger (Header) --- */}
      <Pressable onPress={toggleSection} style={cardStyles.trigger}>
        <View style={cardStyles.triggerLeft}>
          <Ionicons name="person-outline" size={20} color={iconColor} />
          <Text style={cardStyles.label}>Shared Calendars</Text>
        </View>
        <View style={cardStyles.triggerLeft}>
          <Pressable hitSlop={10} style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => setVisible(true)}>
            <Plus size={16} color={uiTheme.isDark ? COLORS.blueAccentLight : COLORS.blueAccentDark} style={[themeStyles.plusIcon]} />
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: uiTheme.isDark ? COLORS.blueAccentLight : COLORS.blueAccentDark,
              }}
            >
              Share
            </Text>
          </Pressable>
          <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
            <Ionicons name="chevron-down-outline" size={20} color={iconColor} />
          </Animated.View>
        </View>
      </Pressable>
      {/* --- Content --- */}
      {isExpanded && (
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
      )}
      <ShareModal isVisible={isVisible} setVisible={setVisible} />
    </View>
  );
}
