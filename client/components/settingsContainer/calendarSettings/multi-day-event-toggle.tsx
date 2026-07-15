import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useUIContext } from '../../contexts/ui-context';

// Adjust these imports to match your actual file structure
import DropdownCard from '@/components/dropdown-card';
import { baseFlexStyles, getBasicThemeStyles, getBasicTypographyStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';

export default function MultiDayAppearanceToggle() {
  const { theme, multiDayInHeader, setMultiDayInHeader } = useUIContext();
  const styles = getToggleStyles(theme.isDark);

  const baseTheme = getBasicThemeStyles(theme.isDark);

  // Set initial position based on context value
  const transformX = useRef(new Animated.Value(multiDayInHeader ? 20 : 0)).current;

  // Animate the thumb when the toggle state changes
  useEffect(() => {
    Animated.timing(transformX, {
      toValue: multiDayInHeader ? 20 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [multiDayInHeader, transformX]);

  return (
    <DropdownCard title="Multi-Day Events" iconName="calendar-outline" defaultExpanded={true}>
      <View style={styles.container}>
        {/* Label and Custom Toggle */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.labelText}>Show multi-day events in header</Text>
            <Text style={styles.descriptionText}>
              {multiDayInHeader
                ? 'Events spanning >24 hrs will be pinned in the all-day header.'
                : 'Events spanning >24 hrs will stretch across the hourly grid.'}
            </Text>
          </View>

          <Pressable
            onPress={() => setMultiDayInHeader(!multiDayInHeader)}
            style={[
              styles.customSwitch,
              multiDayInHeader
                ? { ...baseTheme.backgroundBlue } // Assuming backgroundBlue exists in your baseTheme
                : { backgroundColor: theme.isDark ? '#3a3a3a' : '#d1d1dd' },
            ]}
            accessibilityRole="switch"
            accessibilityState={{ checked: multiDayInHeader }}
          >
            <Animated.View style={[styles.customThumb, { transform: [{ translateX: transformX }] }]} />
          </Pressable>
        </View>

        {/* Dynamic Contextual Helper Text */}
      </View>
    </DropdownCard>
  );
}

const getToggleStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    container: {
      gap: 8,
      paddingVertical: 4,
    },
    headerRow: {
      ...baseFlexStyles.rowLeft,
      flex: 1,
      gap: 16,
    },
    headerLeft: {
      ...baseFlexStyles.columnLeft,
      flex: 1,
      alignItems: 'flex-start',
    },
    labelText: {
      ...baseText.subtitle,
      color: isDark ? COLORS.text.light : COLORS.text.dark,
      fontWeight: '500',
      flex: 1,
      paddingRight: 16,
    },
    descriptionText: {
      ...baseText.body,
      color: isDark ? '#999' : '#666',
      fontSize: 13,
    },
    customSwitch: {
      width: 48,
      height: 28,
      borderRadius: 9999,
      padding: 4,
      justifyContent: 'center',
    },
    customThumb: {
      width: 20,
      height: 20,
      borderRadius: 9999,
      ...baseTheme.background, // Ensures the thumb matches your theme's base background
      boxShadow: '0px 1px 1px 0px rgba(0, 0, 0, 0.15)', // Note: boxShadow string is valid in newer RN/Expo web, but use shadow props if strictly native
      elevation: 2,
    },
  });
};
