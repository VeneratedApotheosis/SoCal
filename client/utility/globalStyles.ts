import { Platform, StyleSheet } from 'react-native';
import { HEADER_HEIGHT } from './constants';
import { COLORS, FONT_WEIGHTS, SIZES } from './theme';

export const globalStyles = StyleSheet.create({
  pressedButton: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  activeButton: {
    backgroundColor: COLORS.selectedButton,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: SIZES.l,
    color: COLORS.text.main,
    fontWeight: FONT_WEIGHTS.medium,
  },
  toggleButtonContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.darkNeutral,
    borderRadius: 10,
    padding: 4,
    height: 35,
    marginBottom: 20,
  },
  toggleButtonSegment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActiveSegement: {
    backgroundColor: 'white',
    elevation: 3,
    boxShadow: '0px 0px 0px rgba(0, 0, 0, 0.1)',
  },
  smallButtonText: {
    fontSize: SIZES.s,
    color: COLORS.text.main,
    fontWeight: FONT_WEIGHTS.light,
  },
  activeSmallButtonText: {
    color: COLORS.text.main,
    fontWeight: FONT_WEIGHTS.heavy,
  },
  bottomRightShadow: {
    boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 10,
  },
});

export const getIconColor = (isDark: boolean, isMuted: boolean = false) => {
  if (isMuted) return isDark ? '#666' : '#ccc';
  return isDark ? COLORS.text.light : COLORS.text.main;
};

export const getBasicThemeStyles = (isDark: boolean) =>
  StyleSheet.create({
    background: {
      backgroundColor: isDark ? COLORS.background.dark : COLORS.background.light,
    },
    backgroundMuted: {
      backgroundColor: isDark ? COLORS.background.mutedDark : COLORS.background.mutedLight,
    },
    backgroundBlue: {
      backgroundColor: isDark ? COLORS.primaryy.light : COLORS.primaryy.dark,
    },
    border: {
      borderColor: isDark ? COLORS.border.dark : COLORS.border.light,
    },
    borderInverted: {
      borderColor: isDark ? COLORS.border.light : COLORS.border.dark,
    },
    borderMuted: {
      borderColor: isDark ? COLORS.border.mutedDark : COLORS.border.mutedLight,
    },
    borderMutedInverted: {
      borderColor: isDark ? COLORS.border.mutedLight : COLORS.border.mutedDark,
    },
    blueAccentColor: {
      color: isDark ? COLORS.blueAccentLight : COLORS.blueAccentDark,
    },
  });

export const getBasicTypographyStyles = (isDark: boolean) => {
  const defaultColor = isDark ? COLORS.text.light : COLORS.text.main;

  return StyleSheet.create({
    title: {
      fontSize: SIZES.l,
      fontWeight: FONT_WEIGHTS.medium,
      color: defaultColor,
    },
    subtitle: {
      fontSize: SIZES.m,
      fontWeight: '500',
      color: defaultColor,
    },
    body: {
      fontSize: SIZES.s,
      fontWeight: FONT_WEIGHTS.light,
      color: defaultColor,
    },
    caption: {
      fontSize: SIZES.xs,
      fontWeight: '500',
      color: defaultColor,
    },
    defaultColor: {
      color: isDark ? COLORS.text.light : COLORS.text.main,
    },
    subtleColor: {
      color: isDark ? COLORS.text.subtleLight : COLORS.text.subtleDark,
    },
    darkGrayColor: {
      color: isDark ? COLORS.text.lightGray : COLORS.text.darkGray,
    },
    blueColor: {
      color: isDark ? COLORS.primaryy.light : COLORS.primaryy.dark,
    },
    emptyText: {
      fontStyle: 'italic',
    },
    noBorder: {
      borderWidth: 0,
      ...Platform.select({
        web: {
          outlineStyle: 'none' as any,
        },
      }),
    },
  });
};

export const baseFlexStyles = StyleSheet.create({
  rowLeft: {
    //centered vertically, pushed to left side
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowCenter: {
    //centered vertically and horizontally
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  columnLeft: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  columnCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  columnBetween: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centerAll: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// -------------------------------------------
// CALENDAR GRID
// -------------------------------------------

export const globalParameterStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    pressedButton: {
      opacity: 0.8,
      transform: [{ scale: 0.96 }],
    },
    activeButton: {
      ...baseTheme.backgroundMuted,
    },
    rowHeader: {
      ...baseFlexStyles.rowBetween,
      marginBottom: 10,
    },
    headerText: {
      ...baseText.title,
    },
    toggleButtonContainer: {
      flexDirection: 'row',
      backgroundColor: isDark ? COLORS.background.mutedDark : '#F3F4F6',
      borderRadius: 10,
      padding: 4,
      height: 35,
      marginBottom: 20,
    },
    toggleButtonSegment: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
    },
    toggleButtonActiveSegement: {
      backgroundColor: isDark ? '#414141' : COLORS.white,
      elevation: 3,
      boxShadow: '0px 0px 0px rgba(0, 0, 0, 0.1)',
    },
    smallButtonText: {
      ...baseText.body,
      fontWeight: FONT_WEIGHTS.light,
    },
    activeSmallButtonText: {
      ...baseText.defaultColor,
      fontWeight: FONT_WEIGHTS.heavy,
    },
    bottomRightShadow: {
      boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
      elevation: 10,
    },
  });
};

export const getModalStyles = (isDark: boolean, width: number, height: number) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    menuBox: {
      position: 'absolute',
      ...baseTheme.background,
      borderRadius: 8,
      minWidth: width,
      height: height,
      justifyContent: 'center',
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)',
      paddingHorizontal: 12,
      elevation: 10,
    },
    menuItem: {
      paddingVertical: 8,
      ...baseFlexStyles.rowLeft,
      justifyContent: 'center',
    },
    menuText: {
      ...baseText.subtitle,
    },
    pressedButton: {
      transform: [{ scale: 0.96 }],
    },
  });
};

// -------------------------------------------
// Calendar header
// -------------------------------------------
export const getHeaderStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    headerContainer: {
      height: HEADER_HEIGHT,
      flexDirection: 'row',
      alignItems: 'stretch',
      ...baseTheme.backgroundMuted,
      padding: 16,
      gap: 10,
    },
    waffle: {
      alignSelf: 'flex-start',
    },
    headerText: {
      ...baseText.title,
      ...baseText.noBorder,
      fontSize: 20,
      fontWeight: '700',
      padding: 0,
    },
    headerButtonContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 16,
    },
    headerButton: {
      width: 35,
      height: 35,
      ...baseTheme.backgroundBlue,
      borderRadius: 999,
      ...baseFlexStyles.centerAll,
      aspectRatio: 1,
      fontWeight: '700',

      // --- Shadows ---
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      elevation: 3,
    },
    headerButtonText: {
      ...baseText.subtitle,
      color: 'white',
    },
  });
};
