import DropDownCard from '@/components/dropdown-card';
import { hexToHSV, hsvToHex, lightenColor } from '@/utility/eventColorUtil';
import { COLORS } from '@/utility/theme';
import { Plus } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import ColorPicker, { ColorFormatsObject, HueSlider } from 'reanimated-color-picker';
import { useUIContext } from '../../contexts/ui-context';
import { getColorEditStyles, getColorPaletteStyles } from '../settingsContainerStyles';
import AppearanceColorSortModal from './appearance-color-sort-modal';

export default function AppearanceColorPalette() {
  const { theme: uiTheme } = useUIContext();
  const themeStyles = getColorPaletteStyles(uiTheme.isDark);
  const editStyles = getColorEditStyles(uiTheme.isDark);

  // ─── Color Palettes ───────────────────────────────────────────────────────────

  // Global Palette
  const { colorCache } = useUIContext();
  const [palettes, setPalettes] = useState(colorCache.allCaches); //local version of colorCache
  const [selectedIndex] = useState(colorCache.activeCacheId);

  // Modified Palette
  const [isEditing, setIsEditing] = useState(false);
  const [hexInput, setHexInput] = useState<string>(''); //specific color being modified
  const [hueValue, setHueValue] = useState<number>(0);
  const [validHue, setValidHue] = useState<boolean>(true);
  const [pickingColorIndex, setPickingColorIndex] = useState<number | null>(null); //specific color idx being modified
  const [tempColors, setTempColors] = useState<string[]>([]);

  const [sortModal, setSortModal] = useState<boolean>(false);
  const [startHue, setStartHue] = useState<number>(270);

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
      setHueValue(Math.round(hexToHSV(color).h));
      setValidHue(true);
    }
  };

  const displayColors = useMemo(() => {
    return isEditing ? tempColors : palettes[selectedIndex].palette;
  }, [isEditing, tempColors, palettes]);

  const getColor = useCallback(
    (color: string, type: string) => {
      return lightenColor(color, type, uiTheme.isDark);
    },
    [uiTheme.isDark, lightenColor],
  );

  const handleSort = (startHue: number) => {
    setTempColors((prev) => {
      const getOffsetHue = (hex: string) => {
        const rawHue = Math.round(Number(hexToHSV(hex).h) || 0);

        // Shift rawHue so startHue becomes 0, wrapping around smoothly
        return (rawHue - startHue + 360) % 360;
      };
      return [...prev].sort((a, b) => getOffsetHue(a) - getOffsetHue(b));
    });
    setPickingColorIndex(null);
  };

  return (
    <DropDownCard title={'Color Palette'} iconName={'color-palette-outline'} defaultExpanded={true}>
      {!isEditing ? (
        <>
          {/* Header Row: Label + Modify Button */}
          <View style={themeStyles.headerRow}>
            <Text style={themeStyles.subLabel}> </Text>
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
            <Pressable style={[editStyles.removeBtn, editStyles.revertBtn]} onPress={() => setSortModal(true)}>
              <Text style={editStyles.cancelBtnText}>Sort</Text>
            </Pressable>
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
            <Pressable style={editStyles.addCircle} onPress={() => setTempColors([...tempColors, '#ffdede'])}>
              <Plus size={20} color={uiTheme.isDark ? COLORS.border.mutedDark : COLORS.border.mutedLight} />
            </Pressable>
          </View>

          {/* HEX Editor & Preview */}
          {pickingColorIndex !== null && (
            <View style={[editStyles.editorCard, { flexDirection: 'column', gap: 16 }]}>
              <Text style={editStyles.inputLabel}>Hex Color</Text>
              <View style={editStyles.inputRow}>
                <Pressable
                  style={editStyles.removeBtn}
                  onPress={() => {
                    setTempColors(tempColors.filter((_, i) => i !== pickingColorIndex));
                    setPickingColorIndex(null);
                  }}
                >
                  <Text style={editStyles.removeBtnText}>Remove</Text>
                </Pressable>
                <Pressable
                  style={[editStyles.removeBtn, editStyles.revertBtn]}
                  onPress={() => {
                    setTempColors((prev) => {
                      return prev.map((hex, index) => {
                        if (index !== pickingColorIndex) return hex;
                        return palettes[selectedIndex].palette[index];
                      });
                    });
                    setHexInput(() => {
                      return palettes[selectedIndex].palette[pickingColorIndex];
                    });
                    setHueValue(Math.round(Number(hexToHSV(palettes[selectedIndex].palette[pickingColorIndex]).h)));
                  }}
                >
                  <Text style={[editStyles.removeBtnText, editStyles.revertBtnText]}>Revert</Text>
                </Pressable>
                <TextInput
                  style={[editStyles.hueInput, !validHue && [editStyles.hueError, editStyles.hueTextError]]}
                  placeholder="Set Hue"
                  placeholderTextColor={uiTheme.isDark ? COLORS.text.subtleDark : COLORS.text.subtleLight}
                  value={hueValue.toString()}
                  onChangeText={(text: string) => {
                    if (Number(text) < 360) {
                      setTempColors((prev) => {
                        const newColors = [...prev];
                        const color = hexToHSV(newColors[pickingColorIndex]);
                        newColors[pickingColorIndex] = hsvToHex(Number(text) % 360, Number(color.s), Number(color.v));
                        return newColors;
                      });
                      setHexInput((prev) => {
                        const color = hexToHSV(prev);
                        return hsvToHex(Number(text) % 360, Number(color.s), Number(color.v));
                      });
                      setHueValue(Number(text) % 360);
                      setValidHue(true);
                    } else {
                      setValidHue(false);
                      setHueValue(Number(text));
                    }
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="numeric"
                />
              </View>
              <ColorPicker
                style={{ width: '100%' }}
                value={hexInput}
                onComplete={(colors: ColorFormatsObject) => {
                  if (/^#[0-9A-F]{6}$/i.test(colors.hex)) {
                    setTempColors((prev) => {
                      const newColors = [...prev];
                      newColors[pickingColorIndex] = colors.hex;
                      return newColors;
                    });
                    setHexInput(colors.hex);
                    setHueValue(Math.round(Number(hexToHSV(colors.hex).h)));
                  }
                }}
                boundedThumb={true}
              >
                <HueSlider />
              </ColorPicker>

              <View style={{}}>
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
          <AppearanceColorSortModal
            isVisible={sortModal}
            setVisible={setSortModal}
            handleSort={handleSort}
            startHue={startHue}
            setStartHue={setStartHue}
          />
        </View>
      )}
    </DropDownCard>
  );
}
