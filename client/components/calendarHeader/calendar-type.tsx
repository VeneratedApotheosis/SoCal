import { baseFlexStyles, getBasicThemeStyles, getBasicTypographyStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuthContext } from '../contexts/auth-context';
import { useUIContext } from '../contexts/ui-context';

export default function CalendarTypePicker() {
  const { theme } = useUIContext();
  const { calendarType, setCalendarType } = useAuthContext();
  const styles = CalendarTypeStyles(theme.isDark);

  // Constants
  const PERIOD_OPTIONS = [
    { key: 'D', label: 'Days', value: 'days' },
    { key: 'W', label: 'Weeks', value: 'weeks' },
  ] as const;

  // State
  const [durationFocused, setDurationFocused] = useState<boolean>(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState<boolean>(false);

  // Derived label for the trigger button
  const currentPeriodLabel = PERIOD_OPTIONS.find((opt) => opt.key === calendarType.type)?.label || 'Days';

  return (
    <View style={[{ zIndex: 10 }]}>
      <View style={styles.row}>
        {/* Number Input Container */}
        <View style={[styles.stepperContainer, durationFocused && styles.stepperSelected]}>
          <TextInput
            keyboardType="number-pad"
            maxLength={3}
            value={String(calendarType.num)}
            onFocus={() => setDurationFocused(true)}
            onBlur={() => {
              if (calendarType.num === 0) setCalendarType({ type: calendarType.type, num: 1 });
              setDurationFocused(false);
            }}
            onChangeText={(text) => {
              const parsed = parseInt(text) || 0;
              setCalendarType({ type: calendarType.type, num: parsed });
            }}
            style={styles.stepperInput}
          />
        </View>

        {/* Custom Dropdown Container */}
        <View style={{ zIndex: 10 }}>
          {/* Dropdown Trigger */}
          <Pressable style={styles.dropdownTrigger} onPress={() => setShowPeriodDropdown(!showPeriodDropdown)}>
            <Text style={styles.dropdownTriggerText}>{currentPeriodLabel}</Text>
            <Ionicons name="chevron-down" size={14} color={theme.isDark ? COLORS.border.mutedLight : COLORS.border.mutedLight} />
          </Pressable>

          {/* Dropdown Menu */}
          {showPeriodDropdown && (
            <View style={styles.dropdownMenu}>
              {PERIOD_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.key}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setCalendarType({ type: opt.key, num: calendarType.num });
                    setShowPeriodDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export const CalendarTypeStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    row: {
      ...baseFlexStyles.rowLeft,
      gap: 12,
    },
    stepperContainer: {
      ...baseFlexStyles.rowLeft,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? COLORS.background.dark : COLORS.background.light,
      ...baseTheme.background,
      overflow: 'hidden',
    },
    stepperInput: {
      width: 56,
      textAlign: 'center',
      paddingVertical: 10,
      ...baseText.input,
      ...baseText.noBorder,
    },
    stepperSelected: {
      backgroundColor: isDark ? COLORS.primaryy.backgroundDark : COLORS.primaryy.backgroundLight,
      borderColor: isDark ? COLORS.primaryy.light : COLORS.primaryy.dark,
    },
    dropdownTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      ...baseTheme.background,
      paddingHorizontal: 16,
      paddingVertical: 11,
      gap: 8,
    },
    dropdownTriggerText: {
      ...baseText.subtitle,
    },
    dropdownMenu: {
      position: 'absolute',
      top: 48,
      left: 0,
      minWidth: 120,
      borderRadius: 12,
      padding: 4,
      ...baseTheme.background,
      borderWidth: 1,
      ...baseTheme.border,
      boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.15)',
      elevation: 5,
    },
    dropdownItem: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    dropdownItemText: {
      ...baseText.subtitle,
      ...baseText.darkGrayColor,
      fontWeight: '400',
    },
  });
};
