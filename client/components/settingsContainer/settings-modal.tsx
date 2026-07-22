import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TabBar, TabView } from 'react-native-tab-view';

import { getSettingBackgroundStyles, settingsPortalStyles } from '@/components/settingsContainer/settingsContainerStyles';
import { PORTAL_HOME_NAME } from '@/utility/constants';
import { COLORS } from '@/utility/theme';
import { Ionicons } from '@expo/vector-icons';
import { Portal } from '@gorhom/portal';
import { useUIContext } from '../contexts/ui-context';
import AppearanceContainer from './appearance-container';
import CalendarSettingsContainer from './calendar-settings-container';
import Login from './login-container';

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isVisible, onClose }: Props) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { theme } = useUIContext();
  const styles = getSettingBackgroundStyles(theme.isDark);
  const portalStyles = settingsPortalStyles(theme.isDark);

  useEffect(() => {
    if (isVisible) {
      bottomSheetModalRef.current?.present();
    }
  }, [isVisible]);

  const [index, setIndex] = useState(0);

  // Good: routes are stable because they are in useState
  const [routes, setRoutes] = useState<{ key: string; title: string }[]>([
    { key: 'profile', title: 'Profile ' },
    { key: 'appearance', title: 'Appearance' },
    { key: 'calendar', title: 'Calendar' },
  ]);

  // 1. REPLACED inline components and SceneMap with a stable useCallback and switch statement
  const renderScene = useCallback(
    ({ route }: any) => {
      switch (route.key) {
        case 'profile':
          return (
            <ScrollView style={styles.scrollViewContainer} keyboardShouldPersistTaps="handled">
              <Login />
            </ScrollView>
          );
        case 'appearance':
          return (
            <ScrollView style={styles.scrollViewContainer} keyboardShouldPersistTaps="handled">
              <AppearanceContainer />
            </ScrollView>
          );
        case 'calendar':
          return (
            <ScrollView style={styles.scrollViewContainer} keyboardShouldPersistTaps="handled">
              <CalendarSettingsContainer />
            </ScrollView>
          );
        case 'profile_appearance':
          return (
            <ScrollView style={styles.scrollViewContainer} keyboardShouldPersistTaps="handled">
              <View style={{ flexDirection: 'row' }}>
                <Login />
                <AppearanceContainer />
              </View>
            </ScrollView>
          );
        default:
          return null;
      }
    },
    [styles.scrollViewContainer],
  );

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
          portalStyles.container,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={portalStyles.header}>
          <Pressable style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={'arrow-back-outline'} size={24} onPress={onClose} />
          </Pressable>
          <Text style={portalStyles.headerText}>Settings</Text>
        </View>
        <View style={portalStyles.rowDivider}></View>
        <View style={{ flex: 1 }}>
          <TabView
            navigationState={{ index, routes: routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            tabBarPosition="bottom"
            renderTabBar={(props) => (
              <TabBar
                {...props}
                indicatorStyle={styles.indicator}
                style={styles.tabBar}
                activeColor={theme.isDark ? COLORS.blueAccentLight : COLORS.blueAccentDark}
                inactiveColor={theme.isDark ? COLORS.text.subtleLight : COLORS.text.subtleDark}
              />
            )}
          />
        </View>
      </Animated.View>
    </Portal>
  );
}
