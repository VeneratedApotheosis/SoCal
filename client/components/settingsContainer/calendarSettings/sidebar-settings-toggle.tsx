import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useUIContext } from '../../contexts/ui-context';

// Adjust these imports to match your actual file structure
import DropdownCard from '@/components/dropdown-card';
import { baseFlexStyles, getBasicThemeStyles, getBasicTypographyStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';

export default function SidebarSettingsToggles() {
  const { theme, visibleSettings, setVisibleSettings } = useUIContext();
  const styles = getToggleStyles(theme.isDark);

  const baseTheme = getBasicThemeStyles(theme.isDark);

  // Set initial position based on context value
  const userProfileTransformX = useRef(new Animated.Value(visibleSettings.has('User Profile') ? 20 : 0)).current;
  const suppressTransformX = useRef(new Animated.Value(visibleSettings.has('Subscribed Calendars Toggle') ? 20 : 0)).current;

  // Animate the thumb when the toggle state changes
  useEffect(() => {
    Animated.timing(userProfileTransformX, {
      toValue: visibleSettings.has('User Profile') ? 20 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visibleSettings, userProfileTransformX]);

  useEffect(() => {
    Animated.timing(suppressTransformX, {
      toValue: visibleSettings.has('Subscribed Calendars Toggle') ? 20 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visibleSettings, suppressTransformX]);

  return (
    <DropdownCard title="Sidebar Settings" iconName="settings-outline" defaultExpanded={true}>
      <View style={styles.container}>
        {/* multiDay Events Toggle */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.labelText}>User Profile</Text>
          </View>

          <Pressable
            onPress={() =>
              setVisibleSettings((prev) => {
                const next = new Set(prev);
                const selected = next.has('User Profile');
                if (selected) next.delete('User Profile');
                else next.add('User Profile');
                return next;
              })
            }
            style={[
              styles.customSwitch,
              visibleSettings.has('User Profile')
                ? { ...baseTheme.backgroundBlue } // Assuming backgroundBlue exists in your baseTheme
                : { backgroundColor: theme.isDark ? '#3a3a3a' : '#d1d1dd' },
            ]}
            accessibilityRole="switch"
            accessibilityState={{ checked: visibleSettings.has('User Profile') }}
          >
            <Animated.View style={[styles.customThumb, { transform: [{ translateX: userProfileTransformX }] }]} />
          </Pressable>
        </View>
      </View>
      <View style={styles.container}>
        {/* Supression Toggle */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.labelText}>Subscribed Calendars Toggle</Text>
          </View>

          <Pressable
            onPress={() =>
              setVisibleSettings((prev) => {
                const next = new Set(prev);
                const selected = next.has('Subscribed Calendars Toggle');
                if (selected) next.delete('Subscribed Calendars Toggle');
                else next.add('Subscribed Calendars Toggle');
                return next;
              })
            }
            style={[
              styles.customSwitch,
              visibleSettings.has('Subscribed Calendars Toggle')
                ? { ...baseTheme.backgroundBlue } // Assuming backgroundBlue exists in your baseTheme
                : { backgroundColor: theme.isDark ? '#3a3a3a' : '#d1d1dd' },
            ]}
            accessibilityRole="switch"
            accessibilityState={{ checked: visibleSettings.has('Subscribed Calendars Toggle') }}
          >
            <Animated.View style={[styles.customThumb, { transform: [{ translateX: suppressTransformX }] }]} />
          </Pressable>
        </View>
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
