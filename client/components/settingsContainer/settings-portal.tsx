import { PORTAL_HOME_NAME } from '@/utility/constants';
import { baseFlexStyles, getBasicThemeStyles, getBasicTypographyStyles } from '@/utility/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { Portal } from '@gorhom/portal';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useUIContext } from '../contexts/ui-context';
import AppearanceContainer from './appearance-container';
import Login from './login-container';

export interface SettingsPortalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function SettingsPortal({ isVisible, onClose }: SettingsPortalProps) {
  const { theme } = useUIContext();
  const styles = settingsPortalStyles(theme.isDark);

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
            <Ionicons name={'arrow-back-outline'} size={24} onPress={onClose} />
          </Pressable>
          <Text style={styles.headerText}>Settings</Text>
        </View>
        <View style={styles.rowDivider}></View>
        <ScrollView style={styles.scrollViewContainer}>
          <View style={{ flexDirection: 'row' }}>
            <Login />
            <AppearanceContainer />
          </View>
        </ScrollView>
      </Animated.View>
    </Portal>
  );
}

const settingsPortalStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    container: {
      flex: 1,
      zIndex: 999,
      elevation: 10,
    },
    header: {
      padding: 16,
      paddingLeft: 24,
      ...baseTheme.backgroundMuted,
      ...baseFlexStyles.rowLeft,
      gap: 16,
    },
    headerText: {
      ...baseText.title,
      fontSize: 24,
    },
    rowDivider: {
      height: 0,
      borderTopWidth: 1,
      ...baseTheme.borderMuted,
    },
    scrollViewContainer: {
      flex: 1,
      ...baseTheme.backgroundMuted,
    },
  });
};
