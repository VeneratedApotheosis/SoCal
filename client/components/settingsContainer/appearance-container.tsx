import AppearanceColorPalette from '@/components/settingsContainer/appearance/appearance-color-palette';
import AppearanceTheme from '@/components/settingsContainer/appearance/appearance-theme';
import { lightenColor } from '@/utility/eventColorUtil';
import { globalStyles } from '@/utility/globalStyles';
import { colorCache } from '@/utility/types';
import { useMemo, useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useUIContext } from '../contexts/ui-context';
import { getSettingAppearanceStyles, getSettingBackgroundStyles } from './settingsContainerStyles';

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

const lightStyles = getSettingAppearanceStyles(false);
const darkStyles = getSettingAppearanceStyles(true);

export default function AppearanceContainer() {
  const { theme, colorCache } = useUIContext();
  const rootStyles = getSettingBackgroundStyles(theme.isDark);
  const styles = theme.isDark ? darkStyles : lightStyles;

  // Palettes and palette ID's
  const [palettes, setPalettes] = useState(colorCache.allCaches);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // UI States
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDebug, setDebug] = useState<boolean>(true);

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

  const [selectedEvent, setSelectedEvent] = useState<number>(-1);

  const rawColors = useMemo(() => {
    const c = colorCache.allCaches[colorCache.activeCacheId];
    const output: string[] = [];
    c.palette.map((color, index) => {
      output.push(lightenColor(color, 'raw', theme.isDark));
    });
    return output;
  }, [colorCache.allCaches, colorCache.activeCacheId, lightenColor, theme.isDark]);
  const borderColors = useMemo(() => {
    const output2: string[] = [];
    rawColors.map((color) => {
      output2.push(lightenColor(color, 'border', theme.isDark));
    });
    return output2;
  }, [rawColors, lightenColor, theme.isDark]);
  const textColors = useMemo(() => {
    const output2: string[] = [];
    rawColors.map((color, index) => {
      output2.push(lightenColor(color, 'text', theme.isDark));
    });
    return output2;
  }, [rawColors, theme.isDark]);

  return (
    <View style={rootStyles.tabContainer}>
      <AppearanceTheme />
      <AppearanceColorPalette />

      {/* --- DEBUGGER --- */}
      {isDebug === true && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: '100%' }}>
          {borderColors.map((color, index) => (
            <Pressable
              style={{
                height: 50,
                width: 85,
              }}
              key={color + ' ' + index}
              onPress={() => setSelectedEvent(index)}
            >
              {/* --- EVENT LEFT BAR --- */}
              <View
                style={[
                  styles.event,
                  {
                    backgroundColor: selectedEvent === index ? borderColors[index] : rawColors[index],
                    borderLeftColor: color,
                    height: 100,
                  },
                ]}
              >
                {/* --- EVENT TITLE --- */}
                <Text
                  style={[
                    styles.eventText,
                    { color: selectedEvent === index ? (theme.isDark ? textColors[index] : rawColors[index]) : textColors[index] },
                  ]}
                  numberOfLines={1}
                >
                  Title
                </Text>
              </View>
            </Pressable>
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
