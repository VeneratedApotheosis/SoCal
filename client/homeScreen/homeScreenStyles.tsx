import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, Path, Rect, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

export const COLORS = {
  black: '#000000',
  white: '#ffffff',

  pageBackground: '#f4f4f6',
  panelBackground: '#f8f8fc',
  softBackground: '#fafafa',
  placeholderBackground: '#f0f0f8',

  primary: '#4f8ef7',
  primaryTint: '#7d8df7',
  purple: '#a78bfa',
  blue: '#60a5fa',
  indigo: '#818cf8',
  green: '#4ade80',
  red: '#f87171',
  pink: '#f472b6',
  yellow: '#fbbf24',
  danger: '#ef4444',

  text: {
    black: '#000',
    dark: '#374151',
    secondary: '#5b5f67',
    muted: '#9ca3af',
    bodyText: '#4b5563',
    calendarTitle: '#1f2937',
    buttonText: '#1a1a2e',
    faintText: '#3a3a5a',
  },
  darkText: '#374151',
  bodyText: '#4b5563',
  secondaryText: '#5b5f67',
  mutedText: '#9ca3af',
  calendarTitle: '#1f2937',
  buttonText: '#1a1a2e',
  faintText: '#3a3a5a',
  faintLabel: '#4a4a6a',
  heroNote: '#5a5a7a',

  border: '#e5e7eb',
  mutedBorder: '#cbd5e1',
  gridLine: '#f0f0f4',
  placeholderBorder: '#e0e0f0',
  placeholderText: '#a0a0b8',
  placeholderLine: '#c0c0d8',
  controlBackground: '#f3f4f6',

  calendarBackground: 'rgba(255,255,255,0.97)',
  navBackground: 'rgba(255,255,255,0.92)',
  mobileMenuBackground: 'rgba(11,11,24,0.97)',
  arrowLine: '#7f8ef7',
  white15: 'rgba(255,255,255,0.15)',
  white08: 'rgba(255,255,255,0.08)',
  white07: 'rgba(255,255,255,0.07)',
  white035: 'rgba(255,255,255,0.35)',
  black07: 'rgba(34, 34, 230, 0.04)',

  glow: {
    blue: 'rgba(79,142,247,0.06)',
    purple: 'rgba(167,139,250,0.05)',
  },
  primaryGlow: 'rgba(79,142,247,0.06)',
  purpleGlow: 'rgba(167,139,250,0.05)',

  primaryy: {
    background: 'rgba(79,142,247,0.12)',
    border: 'rgba(79,142,247,0.25)',
    soft: '#2e75df',
  },
  whiteTransparent: 'rgba(255,255,255,0.15)',
} as const;

export const SPACING = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 48,
  sectionLarge: 72,
  page: 96,
} as const;

export const RADII = {
  xsmall: 2,
  dot: 3,
  small: 6,
  medium: 8,
  large: 12,
  xl: 16,
  pill: 999,
} as const;

export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const TYPOGRAPHY = {
  display: 46,
  displayLineHeight: 54,

  featureTitle: 38,
  featureTitleLineHeight: 45,

  brand: 20,

  large: 18,
  largeLineHeight: 29,

  body: 16,
  bodyLineHeight: 28,
  bodyLineHeightSmall: 26,

  medium: 14,
  small: 12,
  micro: 10,
  tiny: 8,
} as const;

export const LAYOUT = {
  navHeight: 64,
  heroMinHeight: 760,
  contentMaxWidth: 1200,
  heroTextMaxWidth: 570,
  sectionDescriptionMaxWidth: 700,
  aboutDescriptionMaxWidth: 720,
  calendarMaxWidth: 520,
  footerDescriptionMaxWidth: 260,
  featureMinHeight: 240,
} as const;

export const DECORATIVE = {
  largeGlow: 700,
  largeGlowHeight: 500,
  smallGlow: 500,
  smallGlowHeight: 400,
  smallGlowOffset: -100,
} as const;

export const textStyles = StyleSheet.create({
  heroTitle: {
    fontSize: 64,
    lineHeight: 70,
    color: COLORS.text.black,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: -2,
  },
  sectionTitle: {
    color: COLORS.text.black,
    fontSize: TYPOGRAPHY.display,
    lineHeight: TYPOGRAPHY.displayLineHeight,
    fontWeight: FONT_WEIGHTS.bold,
  },
  largeDescription: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.large,
    lineHeight: TYPOGRAPHY.bodyLineHeight,
    fontWeight: FONT_WEIGHTS.regular,
  },
  caption: {
    color: COLORS.text.black,
    fontSize: TYPOGRAPHY.small,
    fontWeight: FONT_WEIGHTS.regular,
  },
  brand: {
    color: COLORS.text.dark,
    fontSize: TYPOGRAPHY.brand,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: -0.5,
  },
});

export const homeScreenStyles = StyleSheet.create({
  blueEyebrow: {
    color: COLORS.primaryy.soft,
    fontSize: TYPOGRAPHY.medium,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 2,
    marginBottom: SPACING.s,
  },
  sectionContainer: {
    width: '100%',
    maxWidth: LAYOUT.contentMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 72,
  },
  sectionTitle: {
    ...textStyles.sectionTitle,
    letterSpacing: -1.5,
    textAlign: 'center',
  },
  sectionDescription: {
    ...textStyles.largeDescription,
    maxWidth: LAYOUT.sectionDescriptionMaxWidth,
    textAlign: 'center',
    marginTop: SPACING.l,
  },
});

export function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28">
      <Defs>
        <SvgLinearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#4f8ef7" />
          <Stop offset="1" stopColor="#a78bfa" />
        </SvgLinearGradient>
      </Defs>
      <Rect width="28" height="28" rx="8" fill="url(#logoGrad)" />
      <Rect x="7" y="10" width="14" height="11" rx="2" fill="white" fillOpacity="0.2" />
      <Rect x="7" y="7" width="14" height="5" rx="2" fill="white" fillOpacity="0.9" />
      <Rect x="10" y="15" width="3" height="3" rx="0.5" fill="#60a5fa" />
      <Rect x="15" y="15" width="3" height="3" rx="0.5" fill="#f87171" />
    </Svg>
  );
}
