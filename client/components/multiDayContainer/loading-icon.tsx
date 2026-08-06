import { COLORS } from '@/utility/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useCalendarEvents } from '../contexts/calendar-events-context';
import { useUIContext } from '../contexts/ui-context';

export const FetchStatusPill = () => {
  const { isLoading, error } = useCalendarEvents();
  const { theme } = useUIContext();

  // Animation values (start off-screen above the grid)
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);

  const isDark = theme.isDark;
  const iconColor = isDark ? COLORS.border.mutedLight : COLORS.border.mutedDark;

  // Determine dynamic content based on state
  const getStatusContent = () => {
    if (isLoading) {
      return {
        icon: <ActivityIndicator size="small" color={iconColor} />,
        label: 'Syncing...',
      };
    }

    if (error === 'OFFLINE') {
      return {
        icon: <Ionicons name="cloud-offline-outline" size={18} color={iconColor} />,
        label: 'No Internet',
      };
    }

    if (error === '500') {
      return {
        icon: <Ionicons name="cloud-offline-outline" size={18} color={iconColor} />,
        label: 'Server Error (500)',
      };
    }

    if (error !== null) {
      return {
        icon: <Ionicons name="alert-circle-outline" size={18} color={iconColor} />,
        label: `Error: ${error}`,
      };
    }

    // Success State
    return {
      icon: <Ionicons name="cloud-done-outline" size={18} color={iconColor} />,
      label: 'Updated',
    };
  };

  const status = getStatusContent();

  // Control spring-in and auto-hide behavior
  useEffect(() => {
    const isError = error !== null;
    const isActive = isLoading || isError;

    if (isActive) {
      // Animate downward into view
      translateY.value = withSpring(0, { damping: 60, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      // On Success: Show briefly ("Updated"), then slide back up
      translateY.value = withSpring(0, { damping: 60, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 200 });

      const timer = setTimeout(() => {
        translateY.value = withTiming(-80, { duration: 300 });
        opacity.value = withTiming(0, { duration: 200 });
      }, 2000); // Stays visible for 2 seconds before dismissing

      return () => clearTimeout(timer);
    }
  }, [isLoading, error]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  // Dynamic Theme Styling
  const containerBg = isDark ? COLORS.background.dark : COLORS.background.light;
  const textColor = isDark ? COLORS.text.light : COLORS.text.dark;
  const borderColor = isDark ? COLORS.border.dark : COLORS.border.light;

  return (
    <Animated.View style={[styles.container, animatedStyle, { backgroundColor: containerBg, borderColor }]}>
      {status.icon}
      <Text style={[styles.text, { color: textColor }]}>{status.label}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    zIndex: 999, // Floating above other views
    elevation: 6, // Android drop shadow
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.12)',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
