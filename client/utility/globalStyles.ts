import { StyleSheet } from 'react-native';
import { COLORS, FONT_WEIGHTS, SIZES } from './theme';

export const globalStyles = StyleSheet.create({
  pressedButton: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  activeButton: {
    backgroundColor: '#f0f0f0',
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
    marginBottom: 20 
  },
  toggleButtonSegment: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 8 
  },
  toggleButtonActiveSegement: {
    backgroundColor: 'white', 
    elevation: 3, 
    shadowOpacity: 0.1
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
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,

  },
})

export const getIconColor = (isDark: boolean) => {
    return isDark ? COLORS.text.light : COLORS.text.main;
}

// -------------------------------------------
// Settings
// -------------------------------------------
export const getSettingBackgroundStyles = (isDark: boolean) => StyleSheet.create({
  handleContainer: {
    backgroundColor: isDark ? COLORS.background.mutedDark : COLORS.background.mutedLight,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    color: 'blue',
    // Shadow logic
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 }, // Negative height pushes shadow UP
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  handleIndicator : {
    backgroundColor: isDark ? COLORS.background.mutedLight: COLORS.background.mutedDark
  },
  tabBar: {
    backgroundColor: isDark ? COLORS.background.dark : COLORS.background.light,
    elevation: 0,
    shadowOpacity: 0,
    fontSize: 12,
  },
  indicator: {
    backgroundColor: isDark ? COLORS.background.dark : COLORS.background.light,
  },
  tabContainer: { 
    flex: 1, 
    backgroundColor: isDark ? COLORS.background.mutedDark : COLORS.background.mutedLight, 
    padding: 16 },
  scrollViewContainer: {
    backgroundColor: isDark ? COLORS.background.mutedDark : COLORS.background.mutedLight, 
  }
});

//card root
export const getSettingCardStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: isDark ? COLORS.background.dark : COLORS.background.light,
    marginBottom: 16,
    // shadow-sm for light mode
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0 : 0.05,
    shadowRadius: 2,
    elevation: isDark ? 0 : 2,
    
  },
  trigger: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // gap-3
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: isDark ? COLORS.text.light : COLORS.text.main,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
});

export const getSettingProfileStyles = (isDark: boolean) => StyleSheet.create({
  profileContainer: {
    flexDirection: 'column',
    gap: 15,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.primary,
    borderRadius: 30,
  },
  usernameText: {
    fontSize: SIZES.l,
    marginBottom: 4,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text.darkGray,
  },
  emailText: {
    fontSize: SIZES.s,
    color: COLORS.textLight,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  button: {
    paddingVertical: 10,
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    backgroundColor: COLORS.secondaryLight,
  },
  buttonText: {
    color: COLORS.secondaryDark,
    fontSize: SIZES.l,
    fontWeight: FONT_WEIGHTS.medium,
    justifyContent: 'center',
  },
});

export const getSettingThemeStyles = (isDark: boolean) => StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 12, // gap-3
  },
  themeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginBottom: 8,
  },
  // Button 
  buttonSelected: {
    borderColor: isDark ? COLORS.border.light : COLORS.border.dark, // white : gray-900
    backgroundColor: isDark ? COLORS.background.dark : COLORS.background.light, // bg-[#252525] : bg-gray-50
  },
  buttonUnselected: {
    borderColor: isDark ? COLORS.border.dark : COLORS.border.light, // border-[#2a2a2a] : border-gray-200
    backgroundColor: isDark ? COLORS.background.dark : COLORS.background.light,
  },
  buttonText: {
    fontSize: 14,
    marginTop: 8,
    color: isDark ? COLORS.text.lightGray : COLORS.text.darkGray, // text-gray-300 : text-gray-700
  }
});

export const getColorPaletteStyles = (isDark: boolean) => StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? COLORS.text.subtleLight : COLORS.text.subtle, 
  },
  modifyText: {
    fontSize: 14,
    fontWeight: '500',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? COLORS.background.mutedDark : COLORS.background.mutedLight,
    gap: 8,
  },
  actionButtonPressed: {
    backgroundColor: isDark ? '#2a2a2a' : '#f3f4f6', // Hover simulation
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? COLORS.blueAccentLight : COLORS.blueAccentDark,
  },
  plusIcon: {
    marginRight: 4,
  },
  colorStrip: { gap: 8 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});

export const getColorEditStyles = (isDark: boolean) => StyleSheet.create({
  content: { padding: 20, gap: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  editLabel: { fontSize: 14, fontWeight: '600', color: isDark ? COLORS.text.light : COLORS.text.main },
  
  // Grid / Strip
  colorStrip: { gap: 8 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  selectedCircle: {
    transform: [{ scale: 1.1 }],
    // ring effect simulation
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  addCircle: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 2, borderStyle: 'dashed',
    borderColor: isDark ? COLORS.border.mutedDark : COLORS.border.mutedLight,
    alignItems: 'center', justifyContent: 'center'
  },

  // Edit Card
  editorCard: {
    padding: 16, borderRadius: 12, borderWidth: 2,
    backgroundColor: isDark ? COLORS.background.mutedDark : COLORS.background.mutedLight,
    borderColor: isDark? COLORS.border.dark : COLORS.border.light,
  },
  inputLabel: { 
    fontSize: 13, 
    fontWeight: '500', 
    marginBottom: 8, 
    color: isDark ? COLORS.text.light : COLORS.text.main 
  },
  inputRow: { flexDirection: 'row', gap: 8 },
  textInput: {
    flex: 1, height: 40, borderRadius: 8, paddingHorizontal: 12,
    backgroundColor: isDark ? COLORS.background.dark : COLORS.background.light,
    borderWidth: 1, borderColor: isDark ? COLORS.border.mutedDark : COLORS.border.mutedLight,
    color: isDark ? COLORS.text.light : COLORS.text.main
  },
  
  // Buttons
  buttonGroup: { flexDirection: 'row', gap: 8 },
  saveBtn: { 
    backgroundColor: isDark ? COLORS.blueAccentLight : COLORS.blueAccentDark,
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8 
  },
  saveBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  cancelBtn: { 
    paddingHorizontal: 12, 
    paddingVertical: 6 
  },
  cancelBtnText: { color: isDark ? COLORS.text.light : COLORS.text.subtle, fontSize: 13 },
  removeBtn: { 
    backgroundColor: 'rgba(ef, 44, 44, 0.1)', 
    paddingHorizontal: 12, 
    justifyContent: 'center', 
    borderRadius: 8 
  },
  removeBtnText: { color: COLORS.secondary, fontSize: 13, fontWeight: '600' },

  // Event Card
  event: {
    borderLeftWidth: 16,
    borderRadius: 12,
    padding: 10,
    height: 100,
    marginHorizontal: 60,
  },
  eventText: {
    fontSize: 18,
    fontWeight: '600',
  }
});

// -------------------------------------------
// Events
// -------------------------------------------
export const getEventCardStyles = (isDark: boolean) => StyleSheet.create({
  eventContainer: {
    borderWidth: 1,
    borderColor: COLORS.white,
    overflow: 'hidden',
    position: 'absolute',
    borderRadius: 4,
  },
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
  eventTime: {
    fontSize: 8,
    fontWeight: '600',
  },
})