import { DRAWER_DRAGGABLE_HEIGHT } from '@/utility/constants';
import { baseFlexStyles, getBasicThemeStyles, getBasicTypographyStyles } from '@/utility/globalStyles';
import { COLORS, SIZES } from '@/utility/theme';
import { StyleSheet } from 'react-native';

export const getDrawerStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    headerContainer: {
      flex: 1,
      ...baseTheme.backgroundMuted,
    },
    headerText: {
      ...baseText.subtitle,
    },
    profile: {
      height: 42,
      marginBottom: 20,
      justifyContent: 'center',
    },
    username: {
      marginBottom: 4,
      ...baseText.title,
    },
    email: {
      fontSize: SIZES.s,
      ...baseText.subtleColor,
    },
    viewToggleContainer: {
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    viewButton: {
      padding: 8,
      marginVertical: 2,
      borderRadius: 8,
    },
    headerRow: {
      ...baseFlexStyles.rowLeft,
      flex: 1,
      gap: 16,
      padding: 12,
      ...baseTheme.background,
      borderRadius: 16,
      marginBottom: 20,
    },
    headerLeft: {
      ...baseFlexStyles.columnLeft,
      flex: 1,
      alignItems: 'flex-start',
    },
    labelText: {
      ...baseText.subtitle,
      color: isDark ? COLORS.text.light : COLORS.text.dark,
      fontWeight: '500',
      flex: 1,
      paddingRight: 16,
    },
    descriptionText: {
      ...baseText.body,
      color: isDark ? '#999' : '#666',
      fontSize: 13,
    },
    customSwitch: {
      width: 48,
      height: 28,
      borderRadius: 9999,
      padding: 4,
      justifyContent: 'center',
    },
    customThumb: {
      width: 20,
      height: 20,
      borderRadius: 9999,
      ...baseTheme.background, // Ensures the thumb matches your theme's base background
      boxShadow: '0px 1px 1px 0px rgba(0, 0, 0, 0.15)', // Note: boxShadow string is valid in newer RN/Expo web, but use shadow props if strictly native
      elevation: 2,
    },
  });
};

export const getFolderIndividual = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    folderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
      paddingTop: 16,
      height: DRAWER_DRAGGABLE_HEIGHT,
    },
    folderFront: {
      flexDirection: 'row',
      marginTop: 'auto',
      gap: 8,
    },
    sectionHeaderText: {
      ...baseText.body,
    },
    iconButton: {
      padding: 4,
    },
    pressedButton: {
      transform: [{ scale: 0.96 }],
    },
  });
};

export const getCalendarIndividual = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    calendarItem: {
      ...baseFlexStyles.rowBetween,
      paddingVertical: 6,
      paddingHorizontal: 8,
      height: DRAWER_DRAGGABLE_HEIGHT,
      borderRadius: 12,
    },
    calendarInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    colorSquare: {
      width: 16,
      height: 16,
      borderRadius: 4,
      marginRight: 12,
    },
    calendarName: {
      ...baseText.body,
      fontSize: 12,
    },
    iconButton: {
      padding: 6,
      borderRadius: 999,
      ...baseFlexStyles.centerAll,
    },
    selectedIcon: {
      ...baseTheme.background,
    },
    pressedButton: {
      transform: [{ scale: 0.96 }],
    },
  });
};

export const getFolderRenameModal = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    menuBox: {
      ...baseTheme.background,
      borderRadius: 8,
      padding: 16,
      width: '80%', // Takes up a nice chunk of the screen width
      maxWidth: 300,
      boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.25)',
      elevation: 10,
    },
    colorButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
    },
    pressedButton: {
      transform: [{ scale: 0.9 }],
    },
    centeredContainer: {
      ...StyleSheet.absoluteFillObject,
      ...baseFlexStyles.centerAll,
    },
    title: {
      ...baseText.subtitle,
      marginBottom: 12,
    },
    input: {
      ...baseTheme.backgroundMuted,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
      ...baseText.input,
      ...baseText.noBorder,
    },
    buttonRow: {
      paddingTop: 6,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 16,
    },
    button: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 4,
    },
    cancelText: {
      ...baseText.subtleColor,
      fontWeight: '500',
    },
    saveText: {
      ...baseTheme.blueAccentColor,
      fontWeight: '600',
    },
    inputError: {
      backgroundColor: isDark ? COLORS.secondary.backgroundDark : COLORS.secondary.backgroundLight,
      borderWidth: 1,
      borderColor: isDark ? COLORS.secondary.textLight : COLORS.secondary.textDark,
      color: isDark ? COLORS.secondary.textLight : COLORS.secondary.textDark,
    },
  });
};

export const getFolderModal = (isDark: boolean, width: number, height: number) => {
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
      padding: 6,
      minWidth: width,
      minHeight: height,
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)',

      elevation: 10,
    },
    menuItem: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      fontSize: 11,
      ...baseFlexStyles.rowBetween,
    },
    pressedButton: {
      transform: [{ scale: 0.96 }],
    },
    menuText: {
      ...baseText.subtitle,
    },
    removeText: {
      ...baseText.subtitle,
      color: isDark ? COLORS.secondary.textDark : COLORS.secondary.textLight,
    },
  });
};

export const getCalendarColorModal = (isDark: boolean) => {
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
      padding: 6,
      width: 200,
      ...baseFlexStyles.centerAll,
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)',
      elevation: 10,
    },
    colorButton: {
      width: 30,
      height: 30,
      borderRadius: 999,
    },
    pressedButton: {
      transform: [{ scale: 0.9 }],
    },
    selectedColor: {
      transform: [{ scale: 1.1 }],
      boxShadow: isDark ? '0px 0px 5px rgba(255, 255, 255, 0.4)' : '0px 0px 5px rgba(0, 0, 0, 0.5)',
    },
  });
};
