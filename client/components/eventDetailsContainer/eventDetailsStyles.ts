import { baseFlexStyles, getBasicThemeStyles, getBasicTypographyStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { StyleSheet } from 'react-native';

export const eventDetailStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    handleContainer: {
      ...baseTheme.borderMutedInverted,
      ...baseTheme.backgroundMuted,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      boxShadow: '0px -2px 4px rgba(0, 0, 0, 0.2)',
      elevation: 10,
    },
    container: {
      ...baseTheme.backgroundMuted,
    },
    handleIndicator: {
      backgroundColor: isDark ? COLORS.background.mutedLight : COLORS.background.mutedDark,
    },
  });
};

export const eventViewStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    container: {
      ...baseTheme.backgroundMuted,
      flex: 1,
      padding: 16,
    },
    card: {
      borderRadius: 16,
      overflow: 'visible',
      ...baseTheme.background,
      marginBottom: 16,
      boxShadow: isDark ? '0px 1px 3px rgba(0, 0, 0, 0)' : '0px 1px 3px rgba(0, 0, 0, 0.05)',
      elevation: isDark ? 0 : 2,
      padding: 16,
      gap: 16,
    },
    titleInput: {
      ...baseText.title,
      fontSize: 26,
      paddingVertical: 0,
      textAlignVertical: 'top',
      ...baseText.noBorder,
    },
    descriptionInput: {
      ...baseText.subtitle,
      fontWeight: '400',
      minHeight: 80,
      paddingVertical: 0,
      textAlignVertical: 'top',
      ...baseText.noBorder,
    },

    // Buttons
    actionBlock: { gap: 16 },
    actionRow: { flexDirection: 'row', gap: 16 },
    btn: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtn: {
      backgroundColor: isDark ? COLORS.primaryy.backgroundDark : COLORS.primaryy.backgroundLight,
      boxShadow: isDark ? '0px 1px 3px rgba(0, 0, 0, 0)' : '0px 1px 3px rgba(0, 0, 0, 0.05)',
    },
    primaryBtnPressed: {},
    primaryBtnText: {
      ...baseText.title,
      color: isDark ? COLORS.primaryy.textLight : COLORS.primaryy.textDark,
    },
    secondaryBtn: {
      ...baseTheme.background,
      boxShadow: isDark ? '0px 1px 3px rgba(0, 0, 0, 0)' : '0px 1px 3px rgba(0, 0, 0, 0.05)',
    },
    btnPressed: {},
    secondaryBtnText: {
      ...baseText.title,
      ...baseText.subtleColor,
    },
    deleteBtn: {
      backgroundColor: isDark ? COLORS.secondary.backgroundDark : COLORS.secondary.backgroundLight,
      boxShadow: isDark ? '0px 1px 3px rgba(0, 0, 0, 0)' : '0px 1px 3px rgba(0, 0, 0, 0.05)',
    },
    deleteBtnPressed: {},
    deleteBtnText: {
      ...baseText.title,
      color: isDark ? COLORS.secondary.textLight : COLORS.secondary.textDark,
    },
  });
};

export const calendarObjViewStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    listRow: {
      ...baseFlexStyles.rowCenter,
      gap: 10,
    },
    calDot: {
      width: 16,
      height: 16,
      borderRadius: 4,
      marginLeft: 2,
      marginRight: 1,
    },
    listText: {
      flex: 1,
      ...baseText.subtitle,
      fontWeight: '400',
    },
    noCalsText: {
      flex: 1,
      ...baseText.subtitle,
      fontWeight: '400',
      ...baseText.emptyText,
      ...baseText.subtleColor,
    },
  });
};

export const calendarObjModalStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.4)', // Subtle dimming overlay
    },
    centeredContainer: {
      ...StyleSheet.absoluteFillObject,
      ...baseFlexStyles.centerAll,
    },
    menuBox: {
      ...baseTheme.background,
      borderRadius: 16,
      padding: 16,
      width: '85%',
      maxWidth: 320,
      boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.25)',
      elevation: 10,
    },
    title: {
      ...baseText.subtitle,
      marginBottom: 8,
    },
    calendarItem: {
      ...baseFlexStyles.rowBetween,
      padding: 12,
      borderRadius: 12,
    },
    selectedItem: {
      backgroundColor: isDark ? COLORS.primaryy.backgroundDark : COLORS.primaryy.backgroundLight,
    },
    pressedItem: {
      opacity: 0.7,
      transform: [{ scale: 0.98 }],
    },
    leftRowSection: {
      ...baseFlexStyles.rowLeft,
      flex: 1,
      gap: 12,
    },
    colorDot: {
      width: 14,
      height: 14,
      borderRadius: 999,
    },
    calendarName: {
      ...baseText.subtitle,
      fontWeight: '400',
    },
    selectedCalendarName: {
      fontWeight: '600',
      color: isDark ? COLORS.primaryy.textLight : COLORS.primaryy.textDark,
    },
    checkmark: {
      ...baseText.subtitle,
      color: isDark ? COLORS.primaryy.textLight : COLORS.primaryy.textDark,
      fontWeight: '600',
    },
    emptyText: {
      ...baseText.subtitle,
      ...baseText.emptyText,
      fontWeight: '400',
      textAlign: 'center',
      paddingVertical: 16,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 12,
    },
    button: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 4,
    },
    cancelText: {
      ...baseText.subtitle,
      ...baseText.darkGrayColor,
    },
  });
};

export const locationStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      padding: 16,
    },
    textInputContainer: {
      backgroundColor: 'transparent',
      borderTopWidth: 0,
      borderBottomWidth: 0,
    },
    textInput: {
      ...baseText.subtitle,
      fontWeight: '400',
      ...baseText.noBorder,
    },
    listView: {
      ...baseTheme.background,
      borderRadius: 8,
      elevation: 3,
      boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
      position: 'absolute',
      top: 45,
      left: 0,
      right: 0,
      maxHeight: 220,
      width: '100%',
    },
    row: {
      padding: 13,
      height: 44,
      ...baseFlexStyles.rowLeft,
    },
  });
};

export const timeStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    pillRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    timePill: {
      flex: 1,
      gap: 5,
    },
    pillLabel: {
      ...baseText.caption,
      ...baseText.subtleColor,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      paddingLeft: 4,
    },
    pillInput: {
      ...baseTheme.backgroundMuted,
      borderRadius: 10,
      padding: 10,
      ...baseFlexStyles.centerAll,
    },
    pillInputPressed: {
      backgroundColor: '#e8e8e5',
    },
    pillInputError: {
      backgroundColor: isDark ? COLORS.secondary.backgroundDark : COLORS.secondary.backgroundLight,
      borderWidth: 1,
      borderColor: isDark ? COLORS.secondary.textLight : COLORS.secondary.textDark,
    },
    pillInputText: {
      width: '100%',
      ...baseText.noBorder,
      ...baseText.subtitle,
      fontWeight: '600',
      textAlign: 'center',
    },
    pillInputTextError: {
      color: isDark ? COLORS.secondary.textLight : COLORS.secondary.textDark,
    },
    pillInputMuted: {
      ...baseText.subtitle,
      ...baseText.subtleColor,
      fontWeight: '600',
    },
    dateDisplay: {
      ...baseText.subtitle,
      textAlign: 'left',
      marginBottom: 16,
    },
    //all day thing
    toggleRow: {
      ...baseFlexStyles.rowBetween,
      paddingVertical: 16,
    },
    toggleLabel: {
      ...baseText.subtitle,
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
      ...baseTheme.background,
      // shadow-sm emulation
      boxShadow: '0px 1px 1px 0px rgba(0, 0, 0, 0.15)',
      elevation: 2,
    },
    rowDivider: {
      height: 0,
      borderTopWidth: 1,
      ...baseTheme.borderMuted,
    },
    //recurrence thing
    repeatRow: {
      ...baseFlexStyles.rowBetween,
      paddingTop: 12,
    },
    iconColor: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: isDark ? COLORS.primaryy.backgroundDark : COLORS.primaryy.backgroundLight,
      ...baseFlexStyles.centerAll,
    },
  });
};

export const recurrenceStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    sheetHandle: {
      ...baseTheme.background,
      boxShadow: '0px -2px 4px rgba(0, 0, 0, 0.2)',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    sheetIndicator: {
      backgroundColor: isDark ? COLORS.background.light : COLORS.background.dark,
      width: 36,
    },
    sheetContent: {
      flex: 1,
      paddingBottom: 36,
      paddingTop: 24,
      paddingHorizontal: 24,
      ...baseTheme.background,
    },
    sheetTitle: {
      ...baseText.subtitle,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    optionRow: {
      ...baseFlexStyles.rowBetween,
      padding: 15,
    },
    optionDivider: {
      height: 0,
      borderTopWidth: 1,
      ...baseTheme.borderMuted,
      marginHorizontal: 4,
    },
    optionLabel: {
      ...baseText.subtitle,
      fontWeight: '400',
    },
    optionCustom: {
      color: isDark ? COLORS.primaryy.textLight : COLORS.primaryy.textDark,
    },
    optionSelected: {
      backgroundColor: isDark ? COLORS.primaryy.backgroundDark : COLORS.primaryy.backgroundLight,
      color: isDark ? COLORS.primaryy.textLight : COLORS.primaryy.textDark,
      borderRadius: 16,
    },
  });
};

export const modalStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      ...baseFlexStyles.centerAll,
    },
    modalContent: {
      width: '88%',
      maxWidth: 360,
      ...baseTheme.background,
      borderRadius: 24,
      padding: 24,
      boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.25)',
      elevation: 10,
    },
    modalTitle: {
      ...baseText.title,
      marginBottom: 24,
    },
    section: {
      marginBottom: 24,
    },
    sectionFinal: {
      marginBottom: 28,
    },
    sectionLabel: {
      ...baseText.subtitle,
      marginBottom: 12,
    },
    row: {
      ...baseFlexStyles.rowLeft,
      gap: 12,
    },
    stepperContainer: {
      ...baseFlexStyles.rowLeft,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? COLORS.background.mutedDark : COLORS.background.mutedLight,
      ...baseTheme.backgroundMuted,
      overflow: 'hidden',
    },
    stepperInput: {
      width: 56,
      textAlign: 'center',
      paddingVertical: 10,
      ...baseText.subtitle,
      ...baseText.noBorder,
    },
    stepperSelected: {
      backgroundColor: isDark ? COLORS.primaryy.backgroundDark : COLORS.primaryy.backgroundLight,
      borderColor: isDark ? COLORS.primaryy.light : COLORS.primaryy.dark,
    },
    dropdownTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      ...baseTheme.backgroundMuted,
      paddingHorizontal: 16,
      paddingVertical: 11,
      gap: 8,
    },
    dropdownTriggerText: {
      ...baseText.subtitle,
    },
    dropdownMenu: {
      position: 'absolute',
      top: 48,
      left: 0,
      minWidth: 120,
      borderRadius: 12,
      padding: 4,
      ...baseTheme.background,
      borderWidth: 1,
      ...baseTheme.borderMuted,
      boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.15)',
      elevation: 5,
    },
    dropdownItem: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    dropdownItemText: {
      ...baseText.subtitle,
      ...baseText.darkGrayColor,
      fontWeight: '400',
    },
    daysRow: {
      ...baseFlexStyles.rowLeft,
      gap: 6,
    },
    dayCircle: {
      width: 36,
      height: 36,
      borderRadius: 999,
      ...baseFlexStyles.centerAll,
    },
    dayCircleActive: {
      ...baseTheme.backgroundBlue,
      boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.3)',
      elevation: 3,
    },
    dayCircleInactive: {
      ...baseTheme.backgroundMuted,
    },
    dayText: {
      ...baseText.body,
      fontWeight: '600',
    },
    dayTextActive: {
      color: COLORS.text.light,
    },
    dayTextInactive: {
      ...baseText.darkGrayColor,
    },
    radioGroup: {
      gap: 12,
    },
    radioRow: {
      ...baseFlexStyles.rowLeft,
    },
    radioRowInline: {
      ...baseFlexStyles.rowLeft,
      width: 80,
    },
    radioOuter: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      ...baseTheme.borderMuted,
      ...baseFlexStyles.centerAll,
      marginRight: 12,
    },
    radioOuterActive: {
      borderColor: isDark ? COLORS.primaryy.light : COLORS.primaryy.dark,
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: isDark ? COLORS.primaryy.light : COLORS.primaryy.dark,
    },
    radioText: {
      ...baseText.subtitle,
      ...baseText.darkGrayColor,
      fontWeight: '400',
    },
    inputField: {
      flex: 1,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      ...baseText.subtitle,
      fontWeight: '400',
      ...baseText.noBorder,
    },
    inputFieldSelected: {
      borderWidth: 1,
      borderColor: isDark ? COLORS.primaryy.light : COLORS.primaryy.dark,
      ...baseTheme.background,
    },
    inputFieldError: {
      borderWidth: 1,
      borderColor: isDark ? COLORS.secondary.textDark : COLORS.secondary.textLight,
      backgroundColor: isDark ? COLORS.secondary.backgroundDark : COLORS.secondary.backgroundLight,
      color: isDark ? COLORS.secondary.textDark : COLORS.secondary.textLight,
    },
    inputFieldInactive: {
      borderWidth: 1,
      ...baseTheme.backgroundMuted,
      borderColor: isDark ? COLORS.background.mutedDark : COLORS.background.mutedLight,
      ...baseText.subtleColor,
    },
    inputFieldActive: {
      backgroundColor: isDark ? COLORS.primaryy.backgroundDark : COLORS.primaryy.backgroundLight,
    },
    inlineStepperContainer: {
      ...baseFlexStyles.rowLeft,
      borderRadius: 12,
      overflow: 'hidden',
      marginRight: 16,
    },
    inlineStepperInput: {
      ...baseText.noBorder,
      width: 40,
      textAlign: 'center',
      paddingVertical: 8,
      ...baseText.subtitle,
      fontWeight: '600',
    },
    inlineStepperSuffix: {
      ...baseText.subtitle,
      ...baseText.subtleColor,
      fontWeight: '400',
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 16,
    },
    btnCancel: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 12,
    },
    btnCancelText: {
      ...baseText.subtitle,
      ...baseText.blueColor,
    },
    btnDone: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 12,
      ...baseTheme.backgroundBlue,
    },
    btnDoneText: {
      ...baseText.subtitle,
      color: '#ffffff',
    },
  });
};

export const getDeleteModalStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      ...baseFlexStyles.centerAll,
    },
    modalContent: {
      width: '88%',
      maxWidth: 360,
      ...baseTheme.background,
      borderRadius: 24,
      padding: 24,
      boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.25)',
      elevation: 10,
    },
    modalTitle: {
      ...baseText.title,
      marginBottom: 28,
    },
    radioGroup: {
      marginBottom: 28,
      gap: 16,
    },
    radioRow: {
      ...baseFlexStyles.rowLeft,
      gap: 12,
    },
    radioOuter: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      ...baseTheme.borderMuted,
      ...baseFlexStyles.centerAll,
    },
    radioOuterActive: {
      borderColor: isDark ? COLORS.primaryy.light : COLORS.primaryy.dark,
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: isDark ? COLORS.primaryy.light : COLORS.primaryy.dark,
    },
    radioText: {
      ...baseText.subtitle,
      ...baseText.darkGrayColor,
      fontWeight: '400',
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
    },
    btnCancel: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 12,
    },
    btnCancelText: {
      ...baseText.subtitle,
      ...baseText.blueColor,
    },
    btnDone: {
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 12,
      ...baseTheme.backgroundBlue,
    },
    btnDoneText: {
      ...baseText.subtitle,
      color: '#ffffff',
      fontWeight: '600',
    },
  });
};
