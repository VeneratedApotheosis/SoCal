import { PORTAL_HOME_NAME } from '@/utility/constants';
import { getIconColor } from '@/utility/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { Portal } from '@gorhom/portal';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useUIContext } from '../contexts/ui-context';
import AppearanceContainer from './appearance-container';
import CalendarSettingsContainer from './calendar-settings-container';
import Login from './login-container';
import { settingsPortalStyles } from './settingsContainerStyles';

export interface SettingsPortalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function WebSettingsPortal({ isVisible, onClose }: SettingsPortalProps) {
  const { theme } = useUIContext();
  const styles = settingsPortalStyles(theme.isDark);
  const iconColor = getIconColor(theme.isDark);

  // ─── Fade Animations ───────────────────────────────────────────────────────────

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setShouldRender(false);
      });
    }
  }, [isVisible, fadeAnim]);

  if (!shouldRender) return null;

  return (
    <Portal hostName={PORTAL_HOME_NAME}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.container,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={'arrow-back-outline'} size={24} onPress={onClose} color={iconColor} />
          </Pressable>
          <Text style={styles.headerText}>Settings</Text>
        </View>
        <View style={styles.rowDivider}></View>
        <ScrollView style={styles.scrollViewContainer}>
          <View style={{ flexDirection: 'row' }}>
            <Login />
            <AppearanceContainer />
            <CalendarSettingsContainer />
          </View>
        </ScrollView>
      </Animated.View>
    </Portal>
  );
}
