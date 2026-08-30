import React from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet } from 'react-native';

import googleButtonAsset from '@/assets/images/GoogleButton.svg';
import googleLogoAsset from '@/assets/images/GoogleLogo.svg';

type Props = {
  onPress: () => void;
  width?: number;
  height?: number;
};

export function GoogleWeb({ onPress, width, height }: Props) {
  const w = width || 182;
  const h = height || 40;

  return (
    <Pressable onPress={onPress} style={webStyles.button} accessibilityRole="button" accessibilityLabel="Sign in with Google">
      <Image source={googleButtonAsset as ImageSourcePropType} style={{ width: w, height: h }} />
    </Pressable>
  );
}

export function GoogleLogoWeb({ onPress, width, height }: Props) {
  const w = width || 180;
  const h = height || 180;
  return (
    <Pressable onPress={onPress} style={webStyles.button} accessibilityRole="button" accessibilityLabel="Sign in with Google">
      <Image source={googleLogoAsset as ImageSourcePropType} style={{ width: w, height: h }} />
    </Pressable>
  );
}

const webStyles = StyleSheet.create({
  button: {
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    overflow: 'visible',
  },
});
