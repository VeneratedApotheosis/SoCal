// components/track-window.tsx
// Encapsulates the clipping and Animated sliding view used by headers
import { GRID_WIDTH } from '@/utility/constants';
import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

export const TrackWindow = React.memo(({ animatedStyle, children }: { animatedStyle: any; children: React.ReactNode }) => {
  console.log('tracked window');

  return (
    <View style={{ width: GRID_WIDTH, overflow: 'hidden' }}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </View>
  );
});
