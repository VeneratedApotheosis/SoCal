import DropDownCard from '@/components/dropdown-card';
import { getIconColor } from '@/utility/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, Text, UIManager, View } from 'react-native';
import { useUIContext } from '../../contexts/ui-context';
import { getSettingThemeStyles } from '../settingsContainerStyles';

export default function AppearanceTheme() {
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const { theme: uiTheme } = useUIContext();
  const themeStyles = getSettingThemeStyles(uiTheme.isDark);

  const themeOptions: {
    value: string;
    name: 'sunny-outline' | 'moon-outline' | 'phone-portrait-outline';
    label: string;
  }[] = [
    { value: 'light', name: 'sunny-outline', label: 'Light' },
    { value: 'dark', name: 'moon-outline', label: 'Dark' },
    { value: 'auto', name: 'phone-portrait-outline', label: 'Auto' },
  ];

  const iconColor = getIconColor(uiTheme.isDark);
  return (
    <DropDownCard title={'Display Theme'} iconName="phone-portrait-outline" defaultExpanded={true}>
      <View style={themeStyles.grid}>
        {themeOptions.map((theme) => {
          const isSelected = uiTheme.themeMode === theme.value;
          return (
            <Pressable
              key={theme.value}
              onPress={() => uiTheme.setThemeMode(theme.value)}
              style={[themeStyles.themeButton, isSelected ? themeStyles.buttonSelected : themeStyles.buttonUnselected]}
            >
              <Ionicons name={theme.name} size={20} color={iconColor} />
              <Text style={themeStyles.buttonText}>{theme.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </DropDownCard>
  );
}
