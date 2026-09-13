import { COLORS } from '@/utility/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { useCalendarEvents } from '../contexts/calendar-events-context';
import { useCalendarObjects } from '../contexts/calendar-obj-context';
import { useCalendarPreferencesContext } from '../contexts/calendar-preferences-context';
import { useProfileContext } from '../contexts/profile-context';
import { useUIContext } from '../contexts/ui-context';

export const FetchStatusIcon = () => {
  const { isLoading, error, reloadCalendar } = useCalendarEvents();
  const { refreshColorGroups } = useCalendarPreferencesContext();
  const { refetchCalendarList } = useCalendarObjects();
  const { familyProfiles } = useProfileContext();
  const { theme } = useUIContext();
  const iconColor = theme.isDark ? COLORS.border.mutedLight : COLORS.border.mutedDark;

  const refetchUserData = () => {
    reloadCalendar();
    refreshColorGroups();
    refetchCalendarList();
  };

  // 1. Loading State: Show the spinning circle
  if (isLoading) {
    return (
      <View>
        <ActivityIndicator size="small" color={iconColor} />
      </View>
    );
  }

  // 2. Offline or Server Error State (500 or 'OFFLINE')
  if (error === '500' || error === 'OFFLINE') {
    return (
      <Pressable onPress={refetchUserData}>
        <Ionicons name="cloud-offline-outline" size={24} color={iconColor} />
      </Pressable>
    );
  }

  // 3. Generic Error State (Any other error code)
  if (error !== null) {
    console.log(error);
    return (
      <Pressable onPress={refetchUserData}>
        {/* A warning icon inside a cloud, or just a generic error cloud */}
        <Ionicons name="alert-circle-outline" size={24} color={iconColor} />
      </Pressable>
    );
  }

  // 4. Success State: Done loading, no errors
  return (
    <Pressable onPress={refetchUserData}>
      <Ionicons name="refresh-outline" size={24} color={iconColor} />
    </Pressable>
  );
};
