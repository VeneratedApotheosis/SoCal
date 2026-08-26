import { useScreenSize } from '@/components/contexts/screen-size-context';
import { useAuth } from '@/hooks/useAuth';
import { DATE_HEADER_HEIGHT, DEFAULT_COLORS, WEB_DATE_HEADER_PADDING, WEB_WHITE_X_PADDING, WEB_WHITE_Y_PADDING } from '@/utility/constants';
import { baseFlexStyles } from '@/utility/globalStyles';
import { COLORS, FONT_WEIGHTS, LAYOUT, RADII, SPACING, textStyles, TYPOGRAPHY } from './homeScreenStyles';
import { MockCalendar, MockEvent } from './mock-calendar';

import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import React, { useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { GoogleWeb } from './google-icon';

export default function Hero() {
  const styles = heroStyles(false);
  const { isWeb } = useScreenSize();

  const { promptAsync, isLoading } = useAuth();

  // ─── Get Width of Mock Container ───────────────────────────────────────────────────────────

  const webContainerRef = useRef<any>(null);
  const [boxWidth, setBoxWidth] = useState(0);
  const handleLayout = (event: any) => {
    try {
      const { width, height, x, y } = event.nativeEvent.layout;
      setBoxWidth(Math.floor((width - 2 * WEB_WHITE_X_PADDING) / 3));
    } catch (e) {
      console.log(e);
    }
  };
  const top = DATE_HEADER_HEIGHT + isWeb * WEB_DATE_HEADER_PADDING * 2 + WEB_WHITE_Y_PADDING;

  return (
    <View style={styles.hero}>
      <View style={styles.heroGlowOne} />
      <View style={styles.heroGlowTwo} />

      <View style={styles.heroInner}>
        <View style={styles.heroText}>
          <View style={styles.betaPill}>
            <View style={styles.greenDot} />
            <Text style={styles.betaText}>Now in beta — free to use</Text>
          </View>

          <Text style={styles.heroTitle}>
            Your group's{'\n'}
            <Text style={styles.gradientText}>calendars,</Text>
            {'\n'}finally organized.
          </Text>

          <Text style={styles.heroDescription}>
            SoCal brings your group's Google Calendars into one unified view. Keep track of what your friends are up to, and easily manage
            who has access to your time.
          </Text>

          <View style={styles.heroLogin}>
            {Platform.OS === 'web' ? (
              <>
                <GoogleWeb
                  width={198}
                  height={44}
                  onPress={() => {
                    promptAsync();
                  }}
                />
              </>
            ) : (
              <GoogleSigninButton
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Light}
                onPress={() => {
                  promptAsync();
                }}
                disabled={false}
              />
            )}
          </View>

          <Text style={styles.heroNote}>No new account needed, just your existing Google account.</Text>
        </View>

        <View style={styles.heroCalendarWrap} onLayout={handleLayout}>
          <Animated.View ref={webContainerRef} style={{ flex: 1 }}></Animated.View>
          <MockCalendar />
          <MockEvent
            color={DEFAULT_COLORS[4]}
            top={top + 40 * 3.5}
            height={40 * 1.5}
            left={WEB_WHITE_X_PADDING + Math.floor(boxWidth / 2)}
            width={boxWidth / 2 - 10}
            offset={5}
            opacity={1}
            selectedThisEvent={false}
            text={'gym'}
          />
          <MockEvent
            color={DEFAULT_COLORS[10]}
            top={top + 40 * 2.5}
            height={40 * 2}
            left={WEB_WHITE_X_PADDING}
            width={boxWidth - 10}
            offset={2}
            opacity={1}
            selectedThisEvent={false}
            text={'Physics 105'}
          />
          <MockEvent
            color={DEFAULT_COLORS[2]}
            top={top + 40 * 6.5}
            height={40 * 2}
            left={WEB_WHITE_X_PADDING}
            width={boxWidth - 10}
            offset={0}
            opacity={1}
            selectedThisEvent={false}
            text={'dinner with jose'}
          />
          <MockEvent
            color={DEFAULT_COLORS[7]}
            top={top + 40 * 1}
            height={40 * 7.5}
            left={WEB_WHITE_X_PADDING + boxWidth}
            width={boxWidth - 10}
            offset={0}
            opacity={1}
            selectedThisEvent={false}
            text={'going hiking'}
          />
          <MockEvent
            color={DEFAULT_COLORS[3]}
            top={top + 40 * 5.5}
            height={40 * 2}
            left={WEB_WHITE_X_PADDING + boxWidth * 2.5}
            width={boxWidth / 2 - 10}
            offset={5}
            opacity={1}
            selectedThisEvent={false}
            text={'Meeting'}
          />
          <MockEvent
            color={DEFAULT_COLORS[10]}
            top={top + 40 * 3.5}
            height={40 * 3}
            left={WEB_WHITE_X_PADDING + boxWidth * 2}
            width={boxWidth - 10}
            offset={0}
            opacity={1}
            selectedThisEvent={false}
            text={'Econ 111'}
          />
        </View>
      </View>
    </View>
  );
}

const heroStyles = (isDark: boolean) => {
  return StyleSheet.create({
    hero: {
      minHeight: LAYOUT.heroMinHeight,
      paddingTop: 64,
      backgroundColor: COLORS.white,
      justifyContent: 'center',
    },
    heroGlowOne: {
      position: 'absolute',
      top: 100,
      left: '35%',
      width: 700,
      height: 500,
      borderRadius: RADII.pill,
      backgroundColor: COLORS.glow.blue,
    },
    heroGlowTwo: {
      position: 'absolute',
      bottom: -100,
      left: -100,
      width: 500,
      height: 400,
      borderRadius: RADII.pill,
      backgroundColor: COLORS.glow.purple,
    },
    heroInner: {
      ...baseFlexStyles.rowLeft,
      alignSelf: 'center',
      width: '100%',
      maxWidth: LAYOUT.contentMaxWidth,
      paddingHorizontal: 30,
      gap: SPACING.xxxl,
    },
    heroText: {
      flex: 1,
      maxWidth: 570,
      alignItems: 'flex-start',
    },
    betaPill: {
      ...baseFlexStyles.rowLeft,
      gap: SPACING.s,
      paddingHorizontal: SPACING.m,
      paddingVertical: 6,
      borderRadius: RADII.pill,
      backgroundColor: COLORS.primaryy.background,
      borderWidth: 1,
      borderColor: COLORS.primaryy.border,
      marginBottom: SPACING.m,
    },
    greenDot: {
      width: 6,
      height: 6,
      borderRadius: RADII.pill,
      backgroundColor: COLORS.green,
    },
    betaText: {
      color: COLORS.primaryy.soft,
      fontSize: TYPOGRAPHY.small,
      fontWeight: FONT_WEIGHTS.medium,
    },
    heroTitle: {
      ...textStyles.heroTitle,
      marginBottom: SPACING.xxl,
    },
    gradientText: {
      color: COLORS.primaryTint,
    },
    heroDescription: {
      ...textStyles.largeDescription,
      marginBottom: SPACING.l,
    },
    heroLogin: {
      marginBottom: SPACING.l,
    },
    heroLoginText: {
      color: COLORS.text.black,
      fontSize: TYPOGRAPHY.medium,
      fontWeight: FONT_WEIGHTS.semibold,
    },
    heroNote: {
      ...textStyles.caption,
    },
    heroCalendarWrap: {
      flex: 1,
      width: '100%',
      alignItems: 'flex-end',
    },
  });
};
