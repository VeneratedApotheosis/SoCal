import { getIconColor } from '@/utility/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useRef, useState } from 'react';
import { Animated, LayoutAnimation, Platform, Pressable, Text, UIManager, View } from 'react-native';
import { useUIContext } from './contexts/ui-context';
import { getSettingCardStyles } from './settingsContainer/settingsContainerStyles';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  title: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  children: ReactNode;
  defaultExpanded?: boolean;
  zIndex?: number;
}

export default function DropDownCard({ title, iconName, children, defaultExpanded = true, zIndex = 1 }: Props) {
  const { theme: uiTheme } = useUIContext();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const cardStyles = getSettingCardStyles(uiTheme.isDark);
  const animatedController = useRef(new Animated.Value(defaultExpanded ? 0 : 1)).current;
  const iconColor = getIconColor(uiTheme.isDark);

  const toggleSection = () => {
    // Smoothly animate the opening/closing of the section
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    Animated.timing(animatedController, {
      toValue: isExpanded ? 1 : 0,
      duration: 100,
      useNativeDriver: true, // Crucial for performance
    }).start();

    setIsExpanded(!isExpanded);
  };

  const arrowRotation = animatedController.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[cardStyles.container, { zIndex: zIndex }]}>
      {/* --- Trigger (Header) --- */}
      <Pressable onPress={toggleSection} style={cardStyles.trigger}>
        <View style={cardStyles.triggerLeft}>
          {iconName && <Ionicons name={iconName} size={20} color={iconColor} />}
          <Text style={cardStyles.label}>{title}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
          <Ionicons name="chevron-down-outline" size={20} color={iconColor} />
        </Animated.View>
      </Pressable>

      {/* --- Content (Children) --- */}
      {isExpanded && <View style={cardStyles.content}>{children}</View>}
    </View>
  );
}
