// hooks/usePinchZoom.ts
import { HOUR_HEIGHT } from '@/utility/constants';
import { useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';

export const usePinchZoom = () => {
  const [hourHeight, setHourHeight] = useState(HOUR_HEIGHT);
  const [baseHeight, setBaseHeight] = useState(HOUR_HEIGHT);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const newHeight = baseHeight * e.scale;
      setHourHeight(Math.min(Math.max(newHeight, 30), 200));
    })
    .onEnd(() => setBaseHeight(hourHeight));

  return { hourHeight, pinchGesture };
};