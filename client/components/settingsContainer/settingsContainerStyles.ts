import { baseFlexStyles, getBasicThemeStyles, getBasicTypographyStyles } from '@/utility/globalStyles';
import { COLORS, FONT_WEIGHTS, SIZES } from '@/utility/theme';
import { StyleSheet } from 'react-native';

//background of the settings
export const getSettingBackgroundStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);

  return StyleSheet.create({
    handleContainer: {
      ...baseTheme.backgroundMuted,
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
      color: 'blue',
      boxShadow: '0px -2px 4px rgba(0, 0, 0, 0.1)',
      elevation: 10,
    },
    handleIndicator: {
      backgroundColor: isDark ? COLORS.background.mutedLight : COLORS.background.mutedDark,
    },
    tabBar: {
      ...baseTheme.background,
      elevation: 0,
      boxShadow: '0px 0px 0px rgba(0, 0, 0, 0)',
      fontSize: 12,
      paddingBottom: 16,
      borderTopWidth: 1,
      borderColor: isDark ? COLORS.border.mutedDark : COLORS.border.mutedLight,
    },
    indicator: {
      ...baseTheme.background,
    },
    tabContainer: {
      flex: 1,
      ...baseTheme.backgroundMuted,
      padding: 16,
    },
    scrollViewContainer: {
      ...baseTheme.backgroundMuted,
    },
  });
};

//each card styles
export const getSettingCardStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    container: {
      borderRadius: 16,
      ...baseTheme.background,
      marginBottom: 16,
      boxShadow: isDark ? '0px 1px 2px rgba(0, 0, 0, 0)' : '0px 1px 2px rgba(0, 0, 0, 0.05)',
      elevation: isDark ? 0 : 2,
    },
    trigger: {
      width: '100%',
      ...baseFlexStyles.rowBetween,
      padding: 20,
    },
    triggerLeft: {
      ...baseFlexStyles.rowLeft,
      gap: 12, // gap-3
    },
    label: {
      ...baseText.title,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      gap: 16,
    },
  });
};

//profile (name and picture and logout)
export const getSettingProfileStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    profileContainer: {
      ...baseFlexStyles.columnCenter,
      gap: 15,
      padding: 20,
    },
    profileIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    usernameText: {
      marginBottom: 4,
      ...baseText.title,
      ...baseText.darkGrayColor,
    },
    emailText: {
      ...baseText.body,
      ...baseText.subtleColor,
    },
    buttonContainer: {
      ...baseFlexStyles.centerAll,
      width: '100%',
    },
    button: {
      paddingVertical: 10,
      width: '100%',
      borderRadius: 12,
      ...baseFlexStyles.rowCenter,
      gap: 5,
      backgroundColor: isDark ? COLORS.secondary.backgroundDark : COLORS.secondary.backgroundLight,
    },
    buttonText: {
      ...baseText.title,
      color: isDark ? COLORS.secondary.textDark : COLORS.secondary.textLight,
      textAlign: 'center',
    },
  });
};

//theme (light, dark, auto)
export const getSettingThemeStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    grid: {
      ...baseFlexStyles.rowLeft,
      gap: 12, // gap-3
    },
    themeButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      ...baseFlexStyles.centerAll,
    },
    buttonIcon: {
      marginBottom: 8,
    },
    // Button
    buttonSelected: {
      ...baseTheme.borderInverted,
      ...baseTheme.background,
    },
    buttonUnselected: {
      ...baseTheme.border,
      ...baseTheme.background,
    },
    buttonText: {
      ...baseText.subtitle,
      ...baseText.darkGrayColor,
      marginTop: 8,
    },
  });
};

//color palette
export const getColorPaletteStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    headerRow: {
      ...baseFlexStyles.rowBetween,
    },
    subLabel: {
      ...baseText.subtitle,
      color: isDark ? COLORS.text.subtleLight : COLORS.text.subtleDark,
    },
    modifyText: {
      ...baseText.subtitle,
      color: isDark ? COLORS.blueAccentLight : COLORS.blueAccentDark,
    },
    colorCircle: {
      width: 40, // w-10
      height: 40, // h-10
      borderRadius: 20, // rounded-full
      borderWidth: 2,
    },
    //add new palette button
    actionButton: {
      width: '100%',
      paddingVertical: 12,
      borderRadius: 12,
      ...baseFlexStyles.rowCenter,
      backgroundColor: isDark ? COLORS.background.mutedDark : COLORS.background.mutedLight,
    },
    viewModeButton: {
      width: '100%',
      marginTop: 16,
      paddingVertical: 8,
      borderRadius: 12,
      ...baseFlexStyles.rowCenter,
      backgroundColor: isDark ? COLORS.secondary.textDark : COLORS.secondary.textLight,
    },
    viewModeText: {
      ...baseText.subtitle,
      color: 'white',
    },
    actionButtonPressed: {
      backgroundColor: isDark ? '#2a2a2a' : '#f3f4f6', // Hover simulation
    },
    actionButtonText: {
      ...baseText.subtitle,
      color: isDark ? COLORS.blueAccentLight : COLORS.blueAccentDark,
    },
    plusIcon: {
      marginRight: 4,
    },
    colorStrip: { gap: 8 },
    colorGrid: { ...baseFlexStyles.rowLeft, flexWrap: 'wrap', gap: 10 },
  });
};

//color palette editing
export const getColorEditStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    content: { padding: 20, gap: 16 },
    headerRow: {
      ...baseFlexStyles.rowBetween,
    },
    editLabel: {
      ...baseText.subtitle,
    },

    // Grid / Strip
    colorStrip: { gap: 8 },
    colorGrid: {
      ...baseFlexStyles.rowLeft,
      flexWrap: 'wrap',
      gap: 10,
    },
    selectedCircle: {
      transform: [{ scale: 1.1 }],
      // ring effect simulation
      boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.5)',
      elevation: 4,
    },
    addCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderStyle: 'dashed',
      ...baseTheme.borderMuted,
      ...baseFlexStyles.centerAll,
    },

    // Edit Card
    editorCard: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      ...baseTheme.borderMuted,
      borderColor: isDark ? COLORS.border.dark : COLORS.border.light,
    },
    inputLabel: {
      ...baseText.subtitle,
    },
    inputRow: {
      gap: 16,
      ...baseFlexStyles.rowLeft,
      flex: 1,
      width: '100%',
    },
    hueInput: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      minWidth: 0,
      ...baseTheme.backgroundMuted,
      ...baseText.input,
      ...baseText.noBorder,
      textAlign: 'center',
    },

    hueError: {
      backgroundColor: isDark ? COLORS.secondary.backgroundDark : COLORS.secondary.backgroundLight,
      borderWidth: 1,
      borderColor: isDark ? COLORS.secondary.textLight : COLORS.secondary.textDark,
    },
    hueTextError: {
      color: isDark ? COLORS.secondary.textLight : COLORS.secondary.textDark,
    },
    textInput: {
      flex: 1,
      height: 40,
      borderRadius: 8,
      paddingHorizontal: 12,
      ...baseTheme.background,
      ...baseTheme.border,
      ...baseText.input,
      fontWeight: '400',
      borderWidth: 1,
    },

    // Buttons
    buttonGroup: {
      ...baseFlexStyles.rowLeft,
      gap: 8,
    },
    saveBtn: {
      backgroundColor: isDark ? COLORS.blueAccentLight : COLORS.blueAccentDark,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    saveBtnText: { ...baseText.subtitle, color: COLORS.white },
    cancelBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    cancelBtnText: { ...baseText.subtitle, ...baseText.subtleColor },
    removeBtn: {
      backgroundColor: isDark ? COLORS.secondary.backgroundDark : COLORS.secondary.backgroundLight,
      paddingHorizontal: 12,
      paddingVertical: 8,
      ...baseFlexStyles.centerAll,
      borderRadius: 8,
    },
    removeBtnText: { ...baseText.subtitle, color: isDark ? COLORS.secondary.textLight : COLORS.secondary.textDark },
    revertBtn: {
      backgroundColor: isDark ? COLORS.background.mutedDark : COLORS.background.mutedLight,
    },
    revertBtnText: { ...baseText.subtitle, color: isDark ? COLORS.text.light : COLORS.text.dark },

    // Event Card
    event: {
      borderLeftWidth: 16,
      borderRadius: 12,
      padding: 10,
      height: 100,
    },
    eventText: {
      ...baseText.title,
    },
  });
};

//appearance container
export const getSettingAppearanceStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    //modal styles
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: 'white',
      padding: 25,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,

      boxShadow: '0px -2px 4px rgba(0, 0, 0, 0.1)',
      elevation: 10,
    },
    modalTitle: { ...baseText.title, marginBottom: 15 },
    modalOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    modalOptionText: { fontSize: 16, color: '#1F2937' },
    modalCancel: { marginTop: 15, alignItems: 'center' },

    event: {
      flex: 1,
      borderLeftWidth: 6,
      borderRadius: 4,
      padding: 4,
    },
    eventText: {
      fontSize: 11,
      fontWeight: '600',
    },
  });
};

//subscribed container
export const getSubscribedCalStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    sharedAccessSection: {
      marginTop: 10,
      flex: 1,
    },
    listContainer: {
      flex: 1,
      gap: 12,
    },
    emptyText: {
      ...baseText.emptyText,
      ...baseText.subtleColor,
      textAlign: 'center',
      marginTop: 20,
    },
    accordionContainer: {
      ...baseTheme.background,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
    },
    accordionTitle: {
      ...baseText.subtitle,
      fontWeight: '400',
      flex: 1,
      marginRight: 10,
    },
    borderTop: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark ? COLORS.border.mutedDark : COLORS.border.mutedLight,
    },
  });
};

//shared container
export const getSharedCalStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    toggleButtonContainer: {
      flexDirection: 'row',
      borderRadius: 10,
      padding: 4,
      height: 35,
    },
    toggleButtonSegment: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
    },
    toggleButtonActiveSegement: {
      backgroundColor: isDark ? COLORS.background.selectedDark : COLORS.background.selectedLight,
      elevation: 3,
      boxShadow: '0px 0px 0px rgba(0, 0, 0, 0.1)',
    },
    pressedButton: {
      opacity: 0.8,
      transform: [{ scale: 0.96 }],
    },
    activeButton: {
      ...baseTheme.backgroundMuted,
    },
    smallButtonText: {
      ...baseText.body,
      fontWeight: FONT_WEIGHTS.light,
    },
    activeSmallButtonText: {
      ...baseText.defaultColor,
      fontWeight: FONT_WEIGHTS.heavy,
    },
    listContainer: {
      gap: 12,
    },
    emptyText: {
      ...baseText.emptyText,
      ...baseText.subtleColor,
      textAlign: 'center',
      marginTop: 20,
    },
    accordionContainer: {
      ...baseTheme.backgroundMuted,
      borderRadius: 12,
    },
    selectedAccordionContainer: {
      ...baseTheme.background,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? COLORS.border.mutedDark : COLORS.border.mutedLight,
      boxShadow: isDark ? '0px 1px 2px rgba(0, 0, 0, 0)' : '0px 0px 3px rgba(0, 0, 0, 0.1)',
    },
    accordionHeader: {
      ...baseFlexStyles.rowBetween,
      padding: 16,
      borderRadius: 12,
    },
    accordionTitle: {
      ...baseText.subtitle,
      marginRight: 10,
    },
    badge: {
      ...baseTheme.backgroundBlue,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
      minWidth: 24,
      alignItems: 'center',
    },
    badgeText: {
      ...baseText.body,
      color: '#FFF',
    },
    accordionContent: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark ? COLORS.border.mutedDark : COLORS.border.mutedLight,
    },
  });
};

export const getSharedCalIndividualStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    detailRow: {
      ...baseFlexStyles.rowBetween,
      gap: 8,
      paddingVertical: 4,
    },
    detailName: {
      ...baseText.body,
      flex: 1,
      marginRight: 10,
    },
    iconButton: {
      padding: 4,
    },
  });
};

export const getShareModalStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    backDrop: {
      ...StyleSheet.absoluteFillObject,
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    container: {
      position: 'absolute',
      ...baseTheme.background,
      borderRadius: 16,
      padding: 16,
    },
    headerContainer: {
      ...baseFlexStyles.rowBetween,
      marginTop: 'auto',
      marginBottom: 10,
    },
    title: {
      ...baseText.title,
    },
    subtitle: {
      ...baseText.body,
      ...baseText.subtleColor,
    },
    input: {
      ...baseTheme.backgroundMuted,
      ...baseText.subtleColor,
      borderRadius: 12,
      padding: 12,
      fontSize: SIZES.input,
      marginBottom: 4,
    },
    sectionTitle: {
      ...baseText.title,
      marginBottom: 12,
    },
    scrollContent: { padding: 8 },
    emptyText: {
      ...baseText.subtleColor,
      fontStyle: 'italic',
    },
    calendarsContainer: {
      gap: 12,
      flexDirection: 'column',
    },
    calendarItem: {
      ...baseTheme.backgroundMuted,
      ...baseFlexStyles.rowBetween,
      borderRadius: 12,
      padding: 12,
    },
    calendarItemActive: {
      backgroundColor: isDark ? '#1F2937' : '#E8F0FE',
      borderColor: isDark ? COLORS.blueAccentLight : COLORS.blueAccentDark,
    },
    calendarText: {
      ...baseText.subtitle,
    },
    calendarTextActive: {
      color: isDark ? COLORS.primaryy.textDark : COLORS.primaryy.textLight,
      fontWeight: '600',
    },
    shareButton: {
      ...baseTheme.backgroundBlue,
      borderRadius: 12,
      padding: 8,
      alignItems: 'center',
      marginTop: 'auto',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 5,
    },
    shareButtonDisabled: { backgroundColor: isDark ? COLORS.primaryy.mutedBackgroundDark : COLORS.primaryy.mutedBackgroundLight },
    shareButtonText: {
      ...baseText.title,
      color: 'white',
    },
    errorText: {
      color: isDark ? COLORS.secondary.textDark : COLORS.secondary.textLight,
      fontSize: SIZES.xs,
      fontWeight: FONT_WEIGHTS.medium,
      textAlign: 'center',
      backgroundColor: isDark ? COLORS.secondary.backgroundDark : COLORS.secondary.backgroundLight,
      padding: 4,
      borderRadius: 8,
    },
    successText: {
      color: isDark ? COLORS.green.textDark : COLORS.green.textLight,
      fontSize: SIZES.xs,
      fontWeight: FONT_WEIGHTS.medium,
      textAlign: 'center',
      backgroundColor: isDark ? COLORS.green.backgroundDark : COLORS.green.backgroundLight,
      padding: 4,
      borderRadius: 8,
    },
  });
};

export const settingsPortalStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    container: {
      flex: 1,
      zIndex: 999,
      elevation: 10,
    },
    header: {
      padding: 16,
      paddingLeft: 24,
      ...baseTheme.backgroundMuted,
      ...baseFlexStyles.rowLeft,
      gap: 16,
    },
    headerText: {
      ...baseText.title,
      fontSize: 24,
    },
    rowDivider: {
      height: 0,
      borderTopWidth: 1,
      ...baseTheme.borderMuted,
    },
    scrollViewContainer: {
      flex: 1,
      ...baseTheme.backgroundMuted,
    },
  });
};
