import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useUIContext } from '../../contexts/ui-context';

// Adjust these imports to match your actual file structure
import DropdownCard from '@/components/dropdown-card';
import { DEFAULT_TRANSPARENCY } from '@/utility/constants';
import { baseFlexStyles, getBasicThemeStyles, getBasicTypographyStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';

export default function AppearanceTransparency() {
  const { theme, transparentOpacity, setTransparencyOpacity } = useUIContext();
  const styles = getHourHeightStyles(theme.isDark);
  const [localValue, setLocalValue] = useState<number>();
  useEffect(() => {
    setLocalValue(transparentOpacity);
  }, [transparentOpacity]);

  const stepSize = 0.05;
  const sliderMax = 1;
  const sliderMin = 0;

  const ticks = [];
  for (let i = sliderMin; i <= sliderMax; i = Math.round((i + stepSize) * 100) / 100) {
    ticks.push(Math.round(i * 100) / 100);
  }

  return (
    <DropdownCard title="Transparency" iconName="contrast-outline" defaultExpanded={true}>
      <View style={styles.container}>
        {/* Label and Current Value */}
        <View style={styles.headerRow}>
          <Text style={styles.labelText}>Adjust opacity for isolation and transparency</Text>
          <View style={styles.valueBadge}>
            <Text style={styles.valueText}>{localValue} px</Text>
          </View>
        </View>

        <View style={styles.sliderWrapper}>
          {/* Slider */}
          <Slider
            style={styles.slider}
            minimumValue={sliderMin}
            maximumValue={sliderMax}
            step={stepSize}
            value={transparentOpacity}
            onValueChange={setLocalValue}
            onSlidingComplete={setTransparencyOpacity}
            minimumTrackTintColor={theme.isDark ? COLORS.primaryy.light : COLORS.primaryy.dark}
            maximumTrackTintColor={theme.isDark ? COLORS.background.mutedDark : COLORS.background.mutedLight}
            thumbTintColor={theme.isDark ? COLORS.primaryy.light : COLORS.primaryy.dark}
          />

          {/* Tick Marks & Min/Max Labels */}
          <View style={styles.ticksRow}>
            {ticks.map((tick) => (
              <View key={tick} style={styles.tickWrapper}>
                <View style={styles.tickMark} />
                {/* Only render text for the first and last ticks to avoid crowding */}
                {(tick === sliderMin || tick === sliderMax || tick === DEFAULT_TRANSPARENCY) && <Text style={styles.tickText}>{tick}</Text>}
              </View>
            ))}
          </View>
        </View>
      </View>
    </DropdownCard>
  );
}

const getHourHeightStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    container: {
      gap: 16,
    },
    headerRow: {
      ...baseFlexStyles.rowLeft,
      justifyContent: 'space-between',
    },
    labelText: {
      ...baseText.subtitle,
      ...baseText.darkGrayColor,
      fontWeight: '400',
    },
    valueBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: isDark ? COLORS.primaryy.backgroundDark : COLORS.primaryy.backgroundLight,
      borderWidth: 1,
      borderColor: isDark ? COLORS.primaryy.light : COLORS.primaryy.dark,
    },
    valueText: {
      ...baseText.subtitle,
      fontWeight: '600',
      color: isDark ? COLORS.text.light : COLORS.text.dark,
    },
    sliderWrapper: {
      marginBottom: 10, // Adds breathing room at the bottom for the absolute text
    },
    slider: {
      width: '100%',
      height: 40,
    },
    ticksRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: -10, // Pulls the ticks up closer to the slider track
      paddingHorizontal: 10,
    },
    tickWrapper: {
      alignItems: 'center',
      width: 1, // Keeps the flex space-between math perfectly even
      overflow: 'visible',
    },
    tickMark: {
      width: 2,
      height: 6,
      borderRadius: 1,
      backgroundColor: isDark ? '#555' : '#CCC', // Fallbacks, replace with your muted/border color
    },
    tickText: {
      ...baseText.body, // Assumes you have a small text style
      color: isDark ? '#999' : '#666', // Replace with your muted text color
      position: 'absolute',
      top: 10, // Drops the text below the tick mark
      width: 40, // Ensures text doesn't wrap
      textAlign: 'center',
    },
  });
};
