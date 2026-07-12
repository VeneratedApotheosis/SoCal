import { WEB_DRAWER_WIDTH, WEB_MUTED_PADDING } from '@/utility/constants';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useUIContext } from '../contexts/ui-context';
import CustomDrawerContent from './drawer-container';

export default function FixedDrawer() {
  const { sideBar } = useUIContext();

  const animationProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animationProgress, {
      toValue: sideBar.isSidebarExpanded ? 1 : 0,
      duration: 400,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        sideBar.setSidebarLoading(false);
      }
    });
  }, [sideBar.isSidebarExpanded]);

  const width = animationProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, WEB_DRAWER_WIDTH],
  });

  const marginRight = animationProgress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0, WEB_MUTED_PADDING],
  });

  const opacity = animationProgress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <Animated.View style={[{ marginRight }]}>
      {/* Animated container box */}
      <Animated.View style={[styles.animatedBox, { width }]}>
        {/* Animated inner content container */}
        <Animated.View style={[{ opacity, flex: 1 }]}>
          <CustomDrawerContent />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedBox: {
    flex: 1,
  },
});
