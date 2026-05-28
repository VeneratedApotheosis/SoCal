import AppearanceColorPalette from '@/components/settingsContainer/appearance/appearance-color-palette';
import AppearanceTheme from '@/components/settingsContainer/appearance/appearance-theme';
import { lightenColor } from '@/utility/eventUtils';
import { getSettingBackgroundStyles, globalStyles } from '@/utility/globalStyles';
import { colorCache } from '@/utility/types';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUIContext } from '../contexts/ui-context';

const ThemeButton = ({
  option,
  index,
  activeTheme,
  setActiveTheme,
}: {
  option: string;
  index: number;
  activeTheme: number;
  setActiveTheme: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const isActive = activeTheme === index;

  return (
    <Pressable
      onPress={() => setActiveTheme(index)}
      style={({ pressed }) => [
        globalStyles.toggleButtonSegment,
        isActive && globalStyles.toggleButtonActiveSegement,
        pressed && globalStyles.pressedButton,
      ]}
    >
      <Text style={[globalStyles.smallButtonText, isActive && globalStyles.activeSmallButtonText]}>{option}</Text>
    </Pressable>
  );
};

export default function AppearanceContainer() {
  const { theme, colorCache } = useUIContext();
  const rootStyles = getSettingBackgroundStyles(theme.isDark);

  // Palettes and palette ID's
  const [palettes, setPalettes] = useState(colorCache.allCaches);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // UI States
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pickingColorIndex, setPickingColorIndex] = useState<number | null>(null);
  const [isDebug, setDebug] = useState<boolean>(false);

  // --- temporary state ---
  // hold colors while editing
  const [tempColors, setTempColors] = useState<string[]>([]);

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

  const rawColors = useMemo(() => {
    const c = colorCache.allCaches[colorCache.activeCacheId];
    const output: string[] = [];
    c.palette.map((color, index) => {
      output.push(color);
    });
    return output;
  }, [colorCache.allCaches, colorCache.activeCacheId, lightenColor]);
  const colors = useMemo(() => {
    const output2: string[] = [];
    rawColors.map((color) => {
      output2.push(lightenColor(color, 'border'));
    });
    return output2;
  }, [rawColors, lightenColor]);
  const textColors = useMemo(() => {
    const output2: string[] = [];
    rawColors.map((color, index) => {
      output2.push(lightenColor(color, 'text'));
    });
    return output2;
  }, [rawColors]);

  return (
    <View style={rootStyles.tabContainer}>
      <AppearanceTheme />

      <AppearanceColorPalette />

      {/* --- DEBUGGER --- */}
      {isDebug === true && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: '100%' }}>
          {colors.map((color, index) => (
            <View
              style={{
                height: 50,
                width: 85,
              }}
              key={color + ' ' + index}
            >
              {/* --- EVENT LEFT BAR --- */}
              <View
                style={[
                  styles.event,
                  {
                    backgroundColor: rawColors[index],
                    borderLeftColor: color,
                    height: 100,
                  },
                ]}
              >
                {/* --- EVENT TITLE --- */}
                <Text style={[styles.eventText, { color: textColors[index] }]} numberOfLines={1}>
                  Title
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* --- New Palette Modal --- */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Palette</Text>
            <TouchableOpacity style={styles.modalOption} onPress={() => addNewPalette('generated')}>
              <Text style={styles.modalOptionText}>✨ Generate Random</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => addNewPalette('blank')}>
              <Text style={styles.modalOptionText}>⬜ Create Custom</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
              <Text style={{ color: '#6B7280' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  //modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,

    boxShadow: '0px -2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15 },
  modalOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalOptionText: { fontSize: 16, color: '#1F2937' },
  modalCancel: { marginTop: 15, alignItems: 'center' },

  eventContainer: {
    borderWidth: 1,
    borderColor: 'white',
    overflow: 'hidden',
    position: 'absolute', // Allows use of 'top'
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
    color: '#000000',
  },
});
