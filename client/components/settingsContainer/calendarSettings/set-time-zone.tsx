import { useTimeZoneContext } from '@/components/contexts/time-zone-context';
import DropdownCard from '@/components/dropdown-card';
import { baseFlexStyles, getBasicThemeStyles, getBasicTypographyStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Localization from 'expo-localization';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useUIContext } from '../../contexts/ui-context';

// Get the system default using expo-localization
const SYSTEM_TIMEZONE = Localization.getCalendars()[0]?.timeZone ?? 'UTC';

// Get all ~400 standard IANA time zones using the native JS Intl API
const ALL_TIMEZONES = Intl.supportedValuesOf('timeZone');

interface TimeZoneSelectorProps {}

export default function TimeZoneSelector({}: TimeZoneSelectorProps) {
  const { theme: uiTheme } = useUIContext();
  const [searchQuery, setSearchQuery] = useState('');
  const { timeZone, setTimeZone } = useTimeZoneContext();

  const styles = getTimeZoneStyles(uiTheme.isDark);
  const listColor = uiTheme.isDark ? COLORS.text.lightGray : COLORS.text.darkGray;

  // Filter time zones and convert spaces in the query to underscores
  const filteredZones = useMemo(() => {
    if (!searchQuery) return [];

    // Convert any typed spaces into underscores for the lookup
    const formattedQuery = searchQuery.replace(/ /g, '_').toLowerCase();

    return ALL_TIMEZONES.filter((zone) => zone.toLowerCase().includes(formattedQuery));
  }, [searchQuery]);

  const handleSelect = (zone: string) => {
    setTimeZone(zone);
    setSearchQuery(''); // Clears the input and hides the FlatList
  };

  return (
    <DropdownCard title="Time Zone" iconName="globe-outline" defaultExpanded={true} zIndex={2}>
      {/* Stand-alone text box for the Current Time Zone */}
      <View style={styles.currentZoneContainer}>
        <Text style={styles.selectorLabel}>Current Time Zone</Text>
        <Text style={styles.selectorValue}>{timeZone.replace(/_/g, ' ')}</Text>
      </View>

      {/* Quick toggle to reset to System Default */}
      {timeZone !== SYSTEM_TIMEZONE && (
        <Pressable onPress={() => setTimeZone(SYSTEM_TIMEZONE)} style={styles.resetButton}>
          <Ionicons name="refresh-outline" size={16} color={COLORS.primaryy.light} />
          <Text style={styles.resetText}>Reset to System Default</Text>
        </Pressable>
      )}

      {/* Inline Search Input & Absolute Dropdown */}
      <View style={styles.searchWrapper}>
        <TextInput
          style={[styles.searchInput, searchQuery.length === 0 && { fontStyle: 'italic' }]}
          placeholder="Search cities or regions..."
          placeholderTextColor={uiTheme.isDark ? COLORS.text.subtleDark : COLORS.text.subtleLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Search Results FlatList (Now Absolute) */}
        {searchQuery.length > 0 && (
          <View style={styles.listContainer}>
            <FlatList
              data={filteredZones}
              keyExtractor={(item) => item}
              style={styles.listView}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              renderItem={({ item }) => (
                <Pressable style={styles.row} onPress={() => handleSelect(item)}>
                  <Text numberOfLines={1} style={{ color: listColor, fontSize: 14 }}>
                    {item.replace(/_/g, ' ')}
                  </Text>
                  {item === timeZone && <Ionicons name="checkmark" size={20} color={COLORS.primaryy.light} />}
                </Pressable>
              )}
              ListEmptyComponent={
                <View style={styles.row}>
                  <Text style={{ color: listColor, fontStyle: 'italic' }}>No time zones found.</Text>
                </View>
              }
            />
          </View>
        )}
      </View>
    </DropdownCard>
  );
}

// Styling reusing your existing conventions
const getTimeZoneStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    // Replaces selectorButton: acts as a static read-only box
    currentZoneContainer: {
      padding: 12,
      borderRadius: 12,
      ...baseTheme.backgroundMuted,
      borderWidth: 1,
      borderColor: isDark ? COLORS.background.mutedDark : COLORS.background.mutedLight,
    },
    selectorLabel: {
      ...baseText.subtitle,
      ...baseText.subtleColor,
      fontSize: 12,
      marginBottom: 4,
    },
    selectorValue: {
      ...baseText.body,
      fontWeight: '600',
    },

    // Reset Button
    resetButton: {
      ...baseFlexStyles.rowLeft,
      marginTop: 12,
      gap: 6,
    },
    resetText: {
      ...baseText.subtitle,
      color: isDark ? COLORS.primaryy.light : COLORS.primaryy.dark,
    },
    searchWrapper: {
      zIndex: 999,
      elevation: 5,
      position: 'relative',
    },
    searchInput: {
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      ...baseTheme.backgroundMuted,
      ...baseText.input,
      fontWeight: '400',
    },

    // Dropdown List Container (Absolute positioning)
    listContainer: {
      position: 'absolute',
      top: 52, // Roughly the height of the TextInput + a small gap. Adjust if needed.
      left: 0,
      right: 0,
      zIndex: 1000,
      elevation: 10,
      // We use baseTheme.background instead of Muted so it's fully opaque over other UI
      ...baseTheme.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? COLORS.background.mutedDark : COLORS.background.mutedLight,

      boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
    },
    listView: {
      maxHeight: 250,
      borderRadius: 12,
      overflow: 'hidden',
    },
    row: {
      ...baseFlexStyles.rowLeft,
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? COLORS.background.mutedDark : COLORS.background.mutedLight,
    },
  });
};
