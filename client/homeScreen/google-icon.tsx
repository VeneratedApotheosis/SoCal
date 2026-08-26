import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

type Props = {
  onPress: () => void;
  width?: number;
  height?: number;
};

export function GoogleWeb({ onPress, width, height }: Props) {
  return (
    <Pressable onPress={onPress} style={webStyles.button} accessibilityRole="button" accessibilityLabel="Sign in with Google">
      <img src="/GoogleButton.svg" width={width || 180} height={height || 40} alt="Sign in with Google" />
    </Pressable>
  );
}

export function GoogleLogoWeb({ onPress, width, height }: Props) {
  return (
    <Pressable onPress={onPress} style={webStyles.button} accessibilityRole="button" accessibilityLabel="Sign in with Google">
      <img src="/GoogleLogo.svg" width={width || 180} height={height || 180} alt="Sign in with Google" />
    </Pressable>
  );
}

const webStyles = StyleSheet.create({
  button: {
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
});
