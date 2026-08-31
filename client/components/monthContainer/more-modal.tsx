import { useUIContext } from '@/components/contexts/ui-context';
import { PORTAL_HOME_NAME_2 } from '@/utility/constants';
import { baseFlexStyles, getBasicThemeStyles, getBasicTypographyStyles, getIconColor } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { EventObj, EventWithLayout } from '@/utility/types';
import { Ionicons } from '@expo/vector-icons';
import { Portal } from '@gorhom/portal';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import AllDayEvents from './all-day-events';

export interface DayEventsModalProps {
  isVisible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  x: number;
  y: number;
  events: EventWithLayout[];
  maxHeight?: number;
  dayWidth: number;
  day: Date;
  handleEventSelect: (event: EventObj, e: any) => void;
  selectedEventId: string | null;
  createEventToday: () => void;
  newEventToday: boolean;
}

export default function DayEventsModal({
  isVisible,
  setVisible,
  x,
  y,
  events,
  maxHeight = 500,
  dayWidth,
  day,
  handleEventSelect,
  selectedEventId,
  createEventToday,
  newEventToday,
}: DayEventsModalProps) {
  const { theme, now } = useUIContext();
  const styles = getDayEventsModalStyles(theme.isDark);
  const iconColor = getIconColor(theme.isDark);

  const isToday = useMemo(() => {
    if (!now || !day) return false;
    return now.toDateString() === day.toDateString();
  }, [now, day]);

  // ─── Layout ───────────────────────────────────────────────────────────

  const [modalSize, setModalSize] = useState({
    width: 0,
    height: 0,
  });

  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;

    // Avoid unnecessary state updates.
    if (width !== modalSize.width || height !== modalSize.height) {
      setModalSize({ width, height });
    }
  };

  const hasMeasured = modalSize.width > 0 && modalSize.height > 0;
  const modalLeft = x - modalSize.width / 2;
  const modalTop = y - modalSize.height / 2;

  // ─── Fade Animations ───────────────────────────────────────────────────────────

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(isVisible);
  const pan = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      pan.setValue({ x: 0, y: 0 });
      pan.flattenOffset();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start(() => {
        setShouldRender(false);
      });
    }
  }, [isVisible, fadeAnim]);

  if (!shouldRender) return null;

  return (
    <Portal hostName={PORTAL_HOME_NAME_2}>
      <Animated.View style={[styles.invisibleOverlay, { opacity: fadeAnim }]} pointerEvents="box-none">
        <Pressable
          style={[StyleSheet.absoluteFill]}
          onPress={() => {
            setVisible(false);
          }}
        />
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <View
            onLayout={handleLayout}
            style={[
              styles.modalBox,
              {
                position: 'absolute',
                left: modalLeft,
                top: modalTop,
                maxHeight,
                opacity: hasMeasured ? 1 : 0,
              },
              newEventToday && styles.newEvent,
            ]}
          >
            <View style={styles.headerContainer}>
              <Pressable style={[styles.cancelButton, newEventToday && { opacity: 0 }]} onPress={createEventToday}>
                <Ionicons name={'add-outline'} size={20} color={iconColor} />
              </Pressable>
              <View style={styles.textContainer}>
                <Text style={[styles.dateText, isToday && styles.todayText]}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                </Text>
                <Text style={[styles.dateNumber, isToday && styles.todayNumber]}>
                  {day.toLocaleDateString('en-US', { day: 'numeric' })}
                </Text>
              </View>
              <Pressable
                style={[styles.cancelButton, newEventToday && { opacity: 0 }]}
                onPress={() => {
                  setVisible(false);
                }}
              >
                <Ionicons name={'close-outline'} size={20} color={iconColor} />
              </Pressable>
            </View>
            {events.map((event, idx) => {
              const key = event && event.event && event.event.id ? event.event.id + day.toISOString() : idx + day.toISOString();
              return (
                <AllDayEvents
                  key={key}
                  event={event.event}
                  day={day}
                  layout={event}
                  handlePress={handleEventSelect}
                  dayWidth={dayWidth * 1.25}
                  selectedEventId={selectedEventId}
                  isDummy={event.dummy}
                  idx={idx}
                  singleEvent={true}
                />
              );
            })}
          </View>
        </View>
      </Animated.View>
    </Portal>
  );
}

export const getDayEventsModalStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },

    invisibleOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 999,
      elevation: 999,
    },

    modalBox: {
      ...baseTheme.background,
      borderRadius: 20,
      padding: 20,
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.25)',
      elevation: 10,
      overflow: 'hidden',
    },
    newEvent: {
      backgroundColor: isDark ? COLORS.primaryy.backgroundDark : COLORS.primaryy.backgroundLight,
    },
    headerContainer: {
      ...baseFlexStyles.rowBetween,
      marginBottom: 12,
    },
    textContainer: {
      ...baseFlexStyles.centerAll,
    },
    dateText: {
      ...baseText.caption,
    },
    dateNumber: {
      ...baseText.title,
    },
    todayText: { ...baseTheme.blueAccentColor },
    todayNumber: { ...baseTheme.blueAccentColor },
    cancelButton: {
      borderRadius: 999,
      width: 30,
      height: 30,
      ...baseFlexStyles.centerAll,
      ...baseTheme.backgroundMuted,
    },
  });
};
