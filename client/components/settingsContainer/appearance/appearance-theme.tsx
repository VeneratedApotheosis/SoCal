import { getIconColor } from '@/utility/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Animated, LayoutAnimation, Platform, Pressable, Text, UIManager, View } from 'react-native';
import { useUIContext } from '../../contexts/ui-context';
import { getSettingCardStyles, getSettingThemeStyles } from '../settingsContainerStyles';

export default function AppearanceTheme() {
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const { theme: uiTheme } = useUIContext();
  const [isExpanded, setIsExpanded] = useState(true);
  const cardStyles = getSettingCardStyles(uiTheme.isDark);
  const themeStyles = getSettingThemeStyles(uiTheme.isDark);
  const animatedController = useRef(new Animated.Value(0)).current;

  const toggleSection = () => {
    // Smoothly animate the opening/closing of the section
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    Animated.timing(animatedController, {
      toValue: isExpanded ? 0 : 1,
      duration: 100,
      useNativeDriver: true, // Crucial for performance
    }).start();

    setIsExpanded(!isExpanded);
  };

  const themeOptions: {
    value: string;
    name: 'sunny-outline' | 'moon-outline' | 'phone-portrait-outline';
    label: string;
  }[] = [
    { value: 'light', name: 'sunny-outline', label: 'Light' },
    { value: 'dark', name: 'moon-outline', label: 'Dark' },
    { value: 'auto', name: 'phone-portrait-outline', label: 'Auto' },
  ];

  const arrowRotation = animatedController.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const iconColor = getIconColor(uiTheme.isDark);

  return (
    <View style={cardStyles.container}>
      {/* --- Trigger (Header) --- */}
      <Pressable onPress={toggleSection} style={cardStyles.trigger}>
        <View style={cardStyles.triggerLeft}>
          <Ionicons name="phone-portrait-outline" size={20} color={iconColor} />
          <Text style={cardStyles.label}>Display Theme</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
          <Ionicons name="chevron-down-outline" size={20} color={iconColor} />
        </Animated.View>
      </Pressable>

      {/* --- Content (Grid) --- */}
      {isExpanded && (
        <View style={cardStyles.content}>
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
        </View>
      )}
    </View>
  );
}
