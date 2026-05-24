import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';

import { getSettingRootStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { useUIContext } from '../contexts/ui-context';
import AppearanceContainer from './appearance/appearance-container';
import Login from './login';

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isVisible, onClose }: Props) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['98%'], []);
  const { theme } = useUIContext();
  const styles = getSettingRootStyles(theme.isDark);

  useEffect(() => {
    if (isVisible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isVisible]);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'profile', title: 'Profile' },
    { key: 'appearance', title: 'Appearance' },
    { key: 'calendar', title: 'Calendar' },
  ]);

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
  const CalendarSettings = () => (
    <BottomSheetScrollView key={1} style={styles.scrollViewContainer}>
      <Text>CalendarSettings</Text>
    </BottomSheetScrollView>
  );

  const renderScene = SceneMap({
    profile: ProfileSettings,
    appearance: AppearanceSettings,
    calendar: CalendarSettings,
  });

  return (
    <>
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
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            tabBarPosition="bottom"
            renderTabBar={(props) => (
              <TabBar
                {...props}
                indicatorStyle={styles.indicator}
                style={styles.tabBar}
                activeColor={theme.isDark ? COLORS.blueAccentLight : COLORS.blueAccentDark}
                inactiveColor={theme.isDark ? COLORS.text.subtleLight : COLORS.text.subtle}
              />
            )}
          />
        </View>
      </BottomSheetModal>
    </>
  );
}
