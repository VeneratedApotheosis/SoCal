import { ALL_DAY_HEIGHT, HOUR_LABEL_WIDTH } from '@/utility/constants';
import { baseFlexStyles, getBasicThemeStyles, getBasicTypographyStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { StyleSheet } from 'react-native';

export const AllDayStyles = {
  bottomMargin: 2,
  borderLeftWidth: 6,
  borderRadius: 4,
  marginHorizontalTotal: 2.5,
  marginLeft: 2,
  marginRight: 3,
  padding: 4,
} as const;

export const getAllDayChipStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    eventContainer: {
      borderWidth: 0,
      ...baseTheme.background,
      borderColor: isDark ? COLORS.black : COLORS.white,
      overflow: 'visible',
      position: 'relative',
      height: ALL_DAY_HEIGHT - 2 * AllDayStyles.bottomMargin,
      marginBottom: AllDayStyles.bottomMargin,
      marginTop: AllDayStyles.bottomMargin,
      borderRadius: 0,
      padding: AllDayStyles.padding,
      justifyContent: 'center',
    },
    eventText: {
      ...baseText.caption,
    },
  });
};

export const getEventCardStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    eventContainer: {
      borderWidth: isDark ? 0 : 1,
      borderColor: isDark ? COLORS.black : COLORS.white,
      overflow: 'hidden',
      position: 'absolute',
      borderRadius: 4,
    },
    event: {
      flex: 1,
      borderRadius: 4,
      padding: 4,
    },
    eventText: {
      ...baseText.caption,
    },
    eventTime: {
      ...baseText.caption,
    },
  });
};

export const getDateHeaderStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    date: {
      ...baseTheme.background,
      ...baseFlexStyles.centerAll,
      borderRightWidth: 1,
      ...baseTheme.border,
    },
    dateText: {
      ...baseText.caption,
    },
    dateNumber: {
      ...baseText.title,
    },
    todayText: { ...baseTheme.blueAccentColor },
    todayNumber: { ...baseTheme.blueAccentColor },
  });
};

export const getCalendarGridStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    container: {
      ...baseTheme.background,
      flex: 1,
      elevation: 0,
    },
    sideBarContainer: {
      flexDirection: 'column',
      borderRightWidth: 1,
      ...baseTheme.border,
    },
    timeZone: {
      width: HOUR_LABEL_WIDTH,
      zIndex: 10,
      justifyContent: 'flex-end',
      textAlign: 'center',
      ...baseTheme.background,
      padding: 3,
    },
    allDay: {
      width: HOUR_LABEL_WIDTH,
      zIndex: 11,
      justifyContent: 'flex-start',
      textAlign: 'center',
      ...baseTheme.background,
      padding: 3,
      position: 'absolute',
      borderBottomWidth: 1,
      ...baseTheme.border,
    },
    timeZoneText: {
      ...baseText.body,
      textAlign: 'center',
    },
    allDayText: {
      ...baseText.caption,
      fontWeight: '400',
      textAlign: 'center',
    },
  });
};

export const getDayContainerStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    rootContainer: {
      overflow: 'hidden',
      borderRightWidth: 1,
      borderColor: isDark ? COLORS.border.mutedDark : COLORS.border.mutedLight,
    },
    allDayContainer: {
      flexDirection: 'column',
      overflow: 'visible',
      position: 'absolute',
      borderBottomWidth: 1,
      borderRightWidth: 1,
      ...baseTheme.border,
      ...baseTheme.background,
    },
    dayContainer: {
      flex: 1,
      position: 'relative',
      zIndex: 3,
      borderRightWidth: 1,
      ...baseTheme.border,
    },
    newEventButton: {
      zIndex: 0,
      backgroundColor: 'transparent',
      ...baseText.noBorder,
    },
  });
};
