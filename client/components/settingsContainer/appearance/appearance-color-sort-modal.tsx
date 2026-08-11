import { useUIContext } from '@/components/contexts/ui-context';
import { baseFlexStyles, getBasicThemeStyles, getBasicTypographyStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

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
    if (input >= 360) return;
    handleSort(input);
    setVisible(false);
    setStartHue(input);
  };

  const updateHue = (hue: number) => {
    if (hue >= 360) setValidHue(false);
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
      }} // Handles Android hardware back button><Modal/>);
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
          <Text style={styles.title}>Sort Starting Hue</Text>

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
      marginBottom: 12,
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
      paddingTop: 16,
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
