import { baseFlexStyles, getBasicThemeStyles, getBasicTypographyStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { StyleSheet, Text } from 'react-native';
import { useUIContext } from './contexts/ui-context';

export default function AccessRoleIndicator({ accessRole }: { accessRole: string }) {
  const { theme } = useUIContext();
  const styles = indicatorStyles(theme.isDark);

  return <Text style={styles.indicator}>{accessRole}</Text>;
}

const indicatorStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    indicator: {
      ...baseText.body,
      fontWeight: '500',
      textTransform: 'capitalize',
      backgroundColor: isDark ? COLORS.primaryy.backgroundDark : COLORS.primaryy.backgroundLight,
      color: isDark ? COLORS.primaryy.textDark : COLORS.primaryy.textLight,
      ...baseFlexStyles.centerAll,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
  });
};
