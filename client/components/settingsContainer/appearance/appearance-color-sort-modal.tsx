import { useUIContext } from '@/components/contexts/ui-context';
import InformationIcon from '@/components/InformationIcon';
import { baseFlexStyles, getBasicThemeStyles, getBasicTypographyStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import ColorPicker, { ColorFormatsObject, HueSlider } from 'reanimated-color-picker';

export interface AppearanceColorSortModalInterface {
  isVisible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  handleSort: (startHue: number) => void;
  setStartHue: React.Dispatch<React.SetStateAction<number>>;
  startHue: number;
}

export default function AppearanceColorSortModal({
  isVisible,
  setVisible,
  handleSort,
  setStartHue,
  startHue,
}: AppearanceColorSortModalInterface) {
  const [localStartHue, setLocalStartHue] = useState(startHue || 0);
  const [validHue, setValidHue] = useState<boolean>(true);
  const inputRef = useRef<TextInput>(null);
  const { theme } = useUIContext();
  const styles = getSortModalStyles(theme.isDark);

  useEffect(() => {
    if (isVisible) {
      setLocalStartHue(startHue || 0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isVisible, startHue]);

  const handleSave = () => {
    const input = Number(localStartHue);
    if (input > 360) return;
    handleSort(input);
    setVisible(false);
    setStartHue(input);
  };

  const updateHue = (hue: number) => {
    if (hue > 360) setValidHue(false);
    else setValidHue(true);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        setVisible(false);
        Keyboard.dismiss();
      }}
    >
      {/* --- BACKDROP BUTTON --- */}
      <Pressable
        style={styles.backdrop}
        onPress={() => {
          setVisible(false);
        }}
      />
      {/* --- CENTERED SETTINGS BOX --- */}
      <View style={styles.centeredContainer} pointerEvents="box-none">
        <View style={[styles.menuBox]}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flex: 1 }}>
            <Text style={styles.title}>Sort Starting Hue</Text>
            <InformationIcon
              size={20}
              title={'Sort Starting Hue'}
              description={
                'Reorder your palette starting from this color. For example, a starting hue of blue would order the palette blue, purple, red, orange, yellow, green.'
              }
            ></InformationIcon>
          </View>

          <TextInput
            ref={inputRef}
            style={[styles.input, !validHue && styles.inputError]}
            value={localStartHue.toString()}
            onChangeText={(val: string) => {
              const intHue = Number(val);
              updateHue(intHue);
              setLocalStartHue(Number(val));
            }}
            placeholder="Set Start Hue"
            returnKeyType="done"
          />
          <ColorPicker
            style={{ width: '100%' }}
            value={`hsv(${localStartHue || 0}, 13%, 100%)`}
            onComplete={(colors: ColorFormatsObject) => {
              const match = colors.hsv.match(/hsv\(\s*(\d+)/i);
              const hue = match ? parseInt(match[1], 10) : null;

              if (hue !== null) {
                updateHue(hue);
                setLocalStartHue(hue);
              }
            }}
            boundedThumb={true}
          >
            <HueSlider />
          </ColorPicker>

          <View style={styles.buttonRow}>
            <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressedButton]} onPress={() => setVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.defaultButton, pressed && styles.pressedButton]}
              onPress={() => {
                updateHue(275);
                setLocalStartHue(275);
              }}
            >
              <Text style={styles.defaultText}>Default</Text>
            </Pressable>

            <Pressable style={({ pressed }) => [styles.sortButton, pressed && styles.pressedButton]} onPress={handleSave}>
              <Text style={styles.sortText}>Sort</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export const getSortModalStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    menuBox: {
      ...baseTheme.background,
      borderRadius: 8,
      padding: 16,
      width: '80%', // Takes up a nice chunk of the screen width
      maxWidth: 300,
      boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.25)',
      elevation: 10,
      flexDirection: 'column',
      gap: 16,
    },
    colorButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
    },
    pressedButton: {
      transform: [{ scale: 0.9 }],
    },
    centeredContainer: {
      ...StyleSheet.absoluteFillObject,
      ...baseFlexStyles.centerAll,
    },
    title: {
      ...baseText.subtitle,
    },
    input: {
      ...baseTheme.backgroundMuted,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      ...baseText.input,
      ...baseText.noBorder,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 16,
    },
    button: {
      paddingVertical: 8,
      paddingHorizontal: 4,
      borderRadius: 4,
    },
    sortButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      ...baseTheme.backgroundBlue,
    },
    cancelText: {
      ...baseText.subtleColor,
      fontWeight: '500',
    },
    sortText: {
      ...baseText.subtitle,
      fontWeight: '600',
      color: 'white',
    },
    defaultButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      ...baseTheme.backgroundMuted,
    },
    defaultText: {
      ...baseText.subtitle,
      fontWeight: '600',
    },
    inputError: {
      backgroundColor: isDark ? COLORS.secondary.backgroundDark : COLORS.secondary.backgroundLight,
      borderWidth: 1,
      borderColor: isDark ? COLORS.secondary.textLight : COLORS.secondary.textDark,
      color: isDark ? COLORS.secondary.textLight : COLORS.secondary.textDark,
    },
  });
};
