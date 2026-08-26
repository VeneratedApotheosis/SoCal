import { useUIContext } from '@/components/contexts/ui-context';
import { getBasicThemeStyles, getBasicTypographyStyles } from '@/utility/globalStyles';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

export interface DayEventsModalProps {
  isVisible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  x: number;
  y: number;
  events: any[];
  maxHeight?: number;
}

export default function DayEventsModal({ isVisible, setVisible, x, y, events, maxHeight = 500 }: DayEventsModalProps) {
  const { theme } = useUIContext();
  const styles = getDayEventsModalStyles(theme.isDark);

  const [modalSize, setModalSize] = useState({
    width: 0,
    height: 0,
  });

  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;

    // Avoid unnecessary state updates.
    if (width !== modalSize.width || height !== modalSize.height) {
      setModalSize({ width, height });
    }
  };

  // Don't position the modal until we've measured it.
  const hasMeasured = modalSize.width > 0 && modalSize.height > 0;

  const modalLeft = x - modalSize.width / 2;
  const modalTop = y - modalSize.height / 2;

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />

      {/* Positioned modal */}
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <View
          onLayout={handleLayout}
          style={[
            styles.modalBox,
            {
              position: 'absolute',
              left: modalLeft,
              top: modalTop,
              maxHeight,
              opacity: hasMeasured ? 1 : 0,
            },
          ]}
        >
          {/* 
            YOU control the event rendering here.
            
            Example:

            {events.map(event => (
              <YourEventComponent
                key={event.id}
                event={event}
              />
            ))}
          */}

          {events.map((event, index) => (
            <View key={event.id ?? index}>{/* Your event component goes here */}</View>
          ))}
        </View>
      </View>
    </Modal>
  );
}

export const getDayEventsModalStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);
  const baseText = getBasicTypographyStyles(isDark);

  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },

    modalBox: {
      ...baseTheme.background,
      width: 360,
      borderRadius: 36,
      padding: 20,
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.25)',
      elevation: 10,
      overflow: 'hidden',
    },
  });
};
