import { PORTAL_HOME_NAME } from '@/utility/constants';
import { getBasicThemeStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { EventObj } from '@/utility/types';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useUIContext } from '../contexts/ui-context';
import { EventExpandedView } from './expanded-view';

export const webEventHeight = 725;
export const webEventWidth = 400;

export interface WebEventDetails {
  isVisible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  top: number;
  left: number;
  event: EventObj | null;
  onClose: () => void;
  setNewEvent: React.Dispatch<React.SetStateAction<EventObj | null>>;
}

export default function WebEventDetails({ isVisible, setVisible, top, left, event, onClose, setNewEvent }: WebEventDetails) {
  const ref = useRef<BottomSheetModal>(null);
  const { theme } = useUIContext();
  const styles = webEventDetailStyles(theme.isDark);
  const pan = useRef(new Animated.ValueXY()).current;
  const iconColor = theme.isDark ? COLORS.background.mutedLight : COLORS.background.mutedDark;

  // ─── Fade Animations ───────────────────────────────────────────────────────────

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      pan.setValue({ x: 0, y: 0 });
      pan.flattenOffset();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start(() => {
        setShouldRender(false);
      });
    }
  }, [isVisible, fadeAnim]);

  // ─── Drag Animations ────────────────────────────────────────────

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
        pan.extractOffset();
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
        pan.flattenOffset();
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
        pan.flattenOffset();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    }),
  ).current;

  if (!shouldRender) return null;

  return (
    <Portal hostName={PORTAL_HOME_NAME}>
      <Animated.View style={[styles.invisibleOverlay, { opacity: fadeAnim }]} pointerEvents="box-none">
        <Pressable
          style={[StyleSheet.absoluteFill]}
          onPress={() => {
            onClose();
          }}
        />
        {/* --- Event Details Container --- */}
        <Animated.View
          style={[
            styles.container,
            {
              position: 'absolute',
              top: top,
              left: left,
              transform: [{ translateX: pan.x }, { translateY: pan.y }],
            },
          ]}
        >
          <View
            style={[styles.dragBar, isHovered && styles.dragHandleHover]}
            {...panResponder.panHandlers}
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
          >
            <Ionicons name={'reorder-three-outline'} size={24} color={iconColor} />
          </View>
          <ScrollView style={{ flex: 1 }}>
            {event && <EventExpandedView initialEvent={event} bottomSheetModalRef={ref} onClose={onClose} setNewEvent={setNewEvent} />}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Portal>
  );
}

export const webEventDetailStyles = (isDark: boolean) => {
  const baseTheme = getBasicThemeStyles(isDark);

  return StyleSheet.create({
    invisibleOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 999,
      elevation: 999,
    },
    container: {
      position: 'absolute',
      borderRadius: 24,
      padding: 6,
      width: webEventWidth,
      height: webEventHeight,
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)',

      elevation: 10,
      ...baseTheme.backgroundMuted,
    },
    dragBar: {
      width: '100%',
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      ...({ cursor: 'grab' } as any),
      borderRadius: 18,
      ...baseTheme.backgroundMuted,
    },
    dragHandle: {
      width: 40,
      height: 5,
      borderRadius: 3,
      backgroundColor: isDark ? COLORS.background.mutedLight : COLORS.background.mutedDark,
    },
    dragHandleHover: {
      backgroundColor: isDark ? '#313135' : '#e5e5eb', //manually created, may put into themes later
    },
  });
};
