import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';

import { getSettingBackgroundStyles } from '@/components/settingsContainer/settingsContainerStyles';
import { COLORS } from '@/utility/theme';
import { useScreenSize } from '../contexts/screen-size-context';
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
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useScreenSize();
  const snapPoints = useMemo(() => [SCREEN_HEIGHT * 0.98], [SCREEN_HEIGHT]);

  useEffect(() => {
    if (isVisible) {
      bottomSheetModalRef.current?.present();
    }
  }, [isVisible]);

  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState<{ key: string; title: string }[]>([
    { key: 'profile', title: 'Profile' },
    { key: 'appearance', title: 'Appearance' },
    { key: 'calendar', title: 'Calendar' },
  ]);

  useEffect(() => {
    if (SCREEN_WIDTH < 700) {
      setRoutes([
        { key: 'profile', title: 'Profile' },
        { key: 'appearance', title: 'Appearance' },
        { key: 'calendar', title: 'Calendar' },
      ]);
    } else if (SCREEN_WIDTH < 1400) {
      setRoutes([
        { key: 'profile_appearance', title: 'Profile/Appearance' },
        { key: 'calendar', title: 'Calendar' },
      ]);
    } else {
      setRoutes([
        { key: 'profile_appearance', title: 'Profile/Appearance' },
        { key: 'calendar', title: 'Calendar' },
      ]);
    }
  }, [SCREEN_WIDTH]);

  const ProfileSettings = () => (
    <BottomSheetScrollView key={1} style={styles.scrollViewContainer}>
      <Login />
    </BottomSheetScrollView>
  );
  const AppearanceSettings = () => (
    <BottomSheetScrollView key={1} style={styles.scrollViewContainer}>
      <AppearanceContainer />
    </BottomSheetScrollView>
  );
  const ProfileAndAppearanceSettings = () => (
    <BottomSheetScrollView key={1} style={[styles.scrollViewContainer]}>
      <View style={{ flexDirection: 'row' }}>
        <Login />
        <AppearanceContainer />
      </View>
    </BottomSheetScrollView>
  );
  const CalendarSettings = () => (
    <BottomSheetScrollView key={1} style={styles.scrollViewContainer}>
      <CalendarSettingsContainer />
    </BottomSheetScrollView>
  );

  const renderScene = SceneMap({
    profile: ProfileSettings,
    appearance: AppearanceSettings,
    calendar: CalendarSettings,
    profile_appearance: ProfileAndAppearanceSettings,
  });

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      animationConfigs={{
        duration: 500,
      }}
      onDismiss={onClose}
      handleStyle={styles.handleContainer}
      handleIndicatorStyle={styles.handleIndicator}
      stackBehavior={'push'}
    >
      {/* --- SETTINGS COMPONENT --- */}
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
    </BottomSheetModal>
  );
}
