import { lightenColor } from '@/utility/eventColorUtil';
import { getIconColor } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { colorCache } from '@/utility/types';
import { Ionicons } from '@expo/vector-icons';
import { Plus } from 'lucide-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, LayoutAnimation, Pressable, Text, TextInput, View } from 'react-native';
import { useUIContext } from '../../contexts/ui-context';
import { getColorEditStyles, getColorPaletteStyles, getSettingCardStyles } from '../settingsContainerStyles';

export default function AppearanceColorPalette() {
  const { theme: uiTheme } = useUIContext();
  const { colorCache } = useUIContext();

  // -------------------------------------------
  //open and closing the component
  // -------------------------------------------
  const [isExpanded, setIsExpanded] = useState(true);
  const themeStyles = getColorPaletteStyles(uiTheme.isDark);
  const cardStyles = getSettingCardStyles(uiTheme.isDark);
  const editStyles = getColorEditStyles(uiTheme.isDark);
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

  const arrowRotation = animatedController.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // -------------------------------------------
  // bruh
  // -------------------------------------------
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hexInput, setHexInput] = useState<string>('');

  const [pickingColorIndex, setPickingColorIndex] = useState<number | null>(null);

  // Palettes and palette ID's
  const [palettes, setPalettes] = useState(colorCache.allCaches);
  const [selectedIndex, setSelectedIndex] = useState(colorCache.activeCacheId);
  const [tempColors, setTempColors] = useState<string[]>([]);

  // Start Editing: Copy real colors into the sandbox
  const handleModify = () => {
    setTempColors([...palettes[selectedIndex].palette]);
    setIsEditing(true);
  };

  // Save: Push sandbox colors into the main state
  const handleSave = () => {
    const updatedPalettes = [...palettes];
    updatedPalettes[selectedIndex].palette = [...tempColors];
    colorCache.syncCacheToPalette(tempColors);
    setPalettes(updatedPalettes);
    setIsEditing(false);
    setPickingColorIndex(null);
  };

  // Cancel: Throw away sandbox changes
  const handleCancelEdit = () => {
    setIsEditing(false);
    setPickingColorIndex(null);
  };

  const handleEditColor = (color: string, index: number) => {
    if (pickingColorIndex === index) {
      setPickingColorIndex(null);
    } else {
      setPickingColorIndex(index);
      setHexInput(color);
    }
  };

  const addNewPalette = (type: 'generated' | 'blank') => {
    const newColors = type === 'blank' ? ['#D1D5DB', '#E5E7EB', '#F3F4F6'] : ['#8B5CF6', '#C4B5FD', '#EDE9FE'];
    const newPalette = {
      paletteId: Date.now(),
      name: type === 'blank' ? 'Custom Palette' : 'Generated Palette',
      palette: newColors,
    } as colorCache;
    const newList = [...palettes, newPalette];
    setPalettes(newList);
    setSelectedIndex(newList.length - 1);
    setModalVisible(false);

    // Automatically open edit mode for the new palette
    setTempColors([...newColors]);
    setIsEditing(true);
  };

  const updateTempColor = (newColor: string) => {
    if (pickingColorIndex !== null) {
      const newTemp = [...tempColors];
      newTemp[pickingColorIndex] = newColor;
      setTempColors(newTemp);
    }
  };

  const displayColors = useMemo(() => {
    return isEditing ? tempColors : palettes[selectedIndex].palette;
  }, [isEditing, tempColors, palettes]);

  const iconColor = getIconColor(uiTheme.isDark);

  const getColor = useCallback(
    (color: string, type: string) => {
      return lightenColor(color, type, uiTheme.isDark);
    },
    [uiTheme.isDark, lightenColor],
  );

  return (
    <View style={cardStyles.container}>
      {/* --- Trigger (Header) --- */}
      <Pressable onPress={toggleSection} style={cardStyles.trigger}>
        <View style={cardStyles.triggerLeft}>
          <Ionicons name="color-palette-outline" size={20} color={iconColor} />
          <Text style={cardStyles.label}>Color Palette</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
          <Ionicons name="chevron-down-outline" size={20} color={iconColor} />
        </Animated.View>
      </Pressable>

      {isExpanded && (
        <View style={cardStyles.content}>
          {!isEditing ? (
            <>
              {/* Header Row: Label + Modify Button */}
              <View style={themeStyles.headerRow}>
                <Text style={themeStyles.subLabel}>Default Palette</Text>
                <Pressable hitSlop={10} onPress={() => handleModify()}>
                  <Text style={themeStyles.modifyText}>Modify</Text>
                </Pressable>
              </View>

              {/* Color Strip */}
              <View style={themeStyles.colorGrid}>
                {displayColors.map((color, index) => (
                  <Pressable
                    key={color + ' ' + index}
                    style={[
                      themeStyles.colorCircle,
                      {
                        backgroundColor: getColor(color, 'raw'),
                        borderColor: getColor(color, 'border'),
                      },
                    ]}
                  />
                ))}
              </View>

              {/* Action Button: New Palette FOR FUTURE THING */}
              {/* <Pressable style={({ pressed }) => [themeStyles.actionButton, pressed && themeStyles.actionButtonPressed]}>
                <Plus size={16} color={uiTheme.isDark ? COLORS.blueAccentLight : COLORS.blueAccentDark} style={themeStyles.plusIcon} />
                <Text style={themeStyles.actionButtonText}>New Palette</Text>
              </Pressable> */}
            </>
          ) : (
            // --- EDIT MODE ---

            <View style={{ gap: 16 }}>
              {/* Header Row: Label + Modify Button */}
              <View style={editStyles.headerRow}>
                <Text style={editStyles.editLabel}>Editing: Default Palette</Text>
                <View style={editStyles.buttonGroup}>
                  <Pressable style={editStyles.cancelBtn} onPress={() => handleCancelEdit()}>
                    <Text style={editStyles.cancelBtnText}>Cancel</Text>
                  </Pressable>
                  <Pressable style={editStyles.saveBtn} onPress={() => handleSave()}>
                    <Text style={editStyles.saveBtnText}>Save</Text>
                  </Pressable>
                </View>
              </View>

              {/* EDITING COLOR GRID */}
              <View style={themeStyles.colorGrid}>
                {displayColors.map((color, index) => (
                  <Pressable
                    key={color + ' ' + index}
                    onPress={() => handleEditColor(color, index)}
                    style={[
                      themeStyles.colorCircle,
                      {
                        backgroundColor: getColor(color, 'raw'),
                        borderColor: getColor(getColor(color, 'raw'), 'border'),
                      },
                      pickingColorIndex === index && { shadowColor: getColor(color, 'border') },
                      pickingColorIndex === index && editStyles.selectedCircle,
                    ]}
                  />
                ))}
                {displayColors.length < 12 && (
                  <Pressable style={editStyles.addCircle} onPress={() => setTempColors([...tempColors, '#CCCCCC'])}>
                    <Plus size={20} color={uiTheme.isDark ? COLORS.border.mutedDark : COLORS.border.mutedLight} />
                  </Pressable>
                )}
              </View>

              {/* HEX Editor & Preview */}
              {pickingColorIndex !== null && (
                <View style={editStyles.editorCard}>
                  <Text style={editStyles.inputLabel}>Hex Color</Text>
                  <View style={editStyles.inputRow}>
                    <TextInput
                      style={editStyles.textInput}
                      value={hexInput}
                      onChangeText={setHexInput}
                      placeholder="#FFFFFF"
                      placeholderTextColor="#666"
                      onBlur={() => {
                        if (/^#[0-9A-F]{6}$/i.test(hexInput)) {
                          const newColors = [...tempColors];
                          newColors[pickingColorIndex] = hexInput;
                          setTempColors(newColors);
                        }
                      }}
                    />
                    <Pressable
                      style={editStyles.removeBtn}
                      onPress={() => {
                        setTempColors(tempColors.filter((_, i) => i !== pickingColorIndex));
                        setPickingColorIndex(null);
                      }}
                    >
                      <Text style={editStyles.removeBtnText}>Remove</Text>
                    </Pressable>
                  </View>

                  <View style={{ marginVertical: 8 }}>
                    {/* <Text style={editStyles.inputLabel}>Event Preview</Text> */}

                    {/* --- EVENT LEFT BAR --- */}
                    <View
                      style={[
                        editStyles.event,
                        {
                          backgroundColor: getColor(hexInput, 'raw'),
                          borderLeftColor: getColor(getColor(hexInput, 'raw'), 'border'),
                        },
                      ]}
                    >
                      {/* --- EVENT TITLE --- */}
                      <Text style={[editStyles.eventText, { color: getColor(getColor(hexInput, 'raw'), 'text') }]} numberOfLines={1}>
                        Event Title
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
