import { useCalendarObjects } from '@/components/contexts/calendar-obj-context';
import { useUIContext } from '@/components/contexts/ui-context';
import { getIconColor } from '@/utility/globalStyles';
import { calendarObj } from '@/utility/types';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { Animated, LayoutAnimation, Pressable, Text, View } from 'react-native';
import { getSettingCardStyles, getSubscribedCalStyles } from '../settingsContainerStyles';
import SuscribedCalendarIndividual from './suscribed-calendar-individual';

export default function SuscribedCalendars() {
  const { calendarObjs } = useCalendarObjects();

  const { theme: uiTheme } = useUIContext();
  const cardStyles = getSettingCardStyles(uiTheme.isDark);
  const styles = getSubscribedCalStyles(uiTheme.isDark);

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
  // Only calendars with shared users
  const suscribedCalendars: calendarObj[] = useMemo(() => {
    if (!calendarObjs) return [];
    return calendarObjs.filter((cal) => cal.owner === false);
  }, [calendarObjs]);

  return (
    <View style={cardStyles.container}>
      {/* --- Trigger (Header) --- */}
      <Pressable onPress={toggleSection} style={cardStyles.trigger}>
        <View style={cardStyles.triggerLeft}>
          <Ionicons name="today-outline" size={20} color={iconColor} />
          <Text style={cardStyles.label}>Suscribed Calendars</Text>
        </View>
        <View style={cardStyles.triggerLeft}>
          <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
            <Ionicons name="chevron-down-outline" size={20} color={iconColor} />
          </Animated.View>
        </View>
      </Pressable>
      {isExpanded && (
        <View style={[cardStyles.content, styles.listContainer]}>
          {/* View Mode: Calendars */}
          {suscribedCalendars.length === 0 ? (
            <Text style={styles.emptyText}>No shared calendars found.</Text>
          ) : (
            suscribedCalendars.map((cal) => {
              return <SuscribedCalendarIndividual cal={cal} key={cal.calendarId} />;
            })
          )}
        </View>
      )}
    </View>
  );
}
