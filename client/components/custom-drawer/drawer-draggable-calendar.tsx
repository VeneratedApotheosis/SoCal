import { DRAWER_DRAGGABLE_HEIGHT } from '@/utility/constants';
import { calendarObj } from '@/utility/types';

import { COLORS } from '@/utility/theme';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { SharedValue, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useCalendarObjects } from '../contexts/calendar-obj-context';
import { useUIContext } from '../contexts/ui-context';
import CalendarDrawerList from './drawer-calendar/drawer-calendar-individual';
import FolderIndividual from './drawer-folder/drawer-folder-individual';

export interface DraggableCalendarProps {
  cal: {
    id: string;
    folder: boolean;
    calendar: calendarObj | null;
  };
  onDrop: (thisIndex: number, hoverIndex: number) => void;
  toggleCalendar: (id: string) => void;
  thisIndex: number;
  hoverIndex: SharedValue<number | null>;
  activeIndex: SharedValue<number | null>;
  isHovering: SharedValue<boolean>;
}

//Each Individual Calendar
export default function DraggableCalendar({
  cal,
  onDrop,
  toggleCalendar,
  thisIndex,
  hoverIndex,
  activeIndex,
  isHovering,
}: DraggableCalendarProps) {
  const isDragging = useSharedValue(false);
  const offset = useSharedValue({ x: 0, y: 0 });
  const { theme } = useUIContext();
  const { calViewMode: viewMode, setCalViewMode: setViewMode, toggleTransparent, toggleIsolate } = useCalendarObjects();

  const gesture = Gesture.Pan()
    .activateAfterLongPress(250)
    .shouldCancelWhenOutside(false)
    .onStart(() => {
      isDragging.value = true;
      activeIndex.value = thisIndex;
      hoverIndex.value = thisIndex;
      isHovering.value = true;
    })
    .onUpdate((e) => {
      offset.value = { x: e.translationX, y: e.translationY };
      hoverIndex.value = thisIndex + e.translationY / DRAWER_DRAGGABLE_HEIGHT;
    })
    .onEnd((e) => {
      const targetIndex = hoverIndex.value !== null && hoverIndex.value >= 1 ? Math.round(hoverIndex.value) : 1;
      isDragging.value = false;
      hoverIndex.value = null;
      activeIndex.value = null;
      const yValue = (e.translationY / DRAWER_DRAGGABLE_HEIGHT) * DRAWER_DRAGGABLE_HEIGHT;

      offset.value = withSpring({ x: e.translationX, y: yValue }, { stiffness: 90 }, (isFinished: boolean | undefined) => {
        // Fires when the scrolling physically stops
        if (isFinished) {
          scheduleOnRN(() => onDrop(thisIndex, targetIndex));
          isHovering.value = false;
        }
      });
    });

  //for animated view
  const animatedStyle = useAnimatedStyle(() => {
    // If this item is the one being dragged:
    if (isDragging.value) {
      return {
        transform: [{ translateX: 0 }, { translateY: offset.value.y }, { scale: 1.0 }],
        zIndex: 1000,
        opacity: 1,
        backgroundColor: theme.isDark ? COLORS.background.dark : COLORS.background.light,
        borderRadius: 12,
      };
    }

    // Move Calendars around the dynamic calendar
    let translateY1 = 0;
    let translateY2 = 0;

    //Stop movement immediatey onDrop
    if (hoverIndex.value === null) {
      return {
        transform: [{ translateY: 0 }],
        width: '100%',
        zIndex: 1,
        opacity: 1,
        backgroundColor: theme.isDark ? COLORS.background.mutedDark : COLORS.background.mutedLight,
      };
    }

    //Move the Calendars around the active Calendars
    if (hoverIndex.value !== null && activeIndex.value !== null) {
      let isAfterHover = thisIndex + 0.0 >= hoverIndex.value - 0.5 && thisIndex <= activeIndex.value;
      isAfterHover = isAfterHover || (thisIndex + 0.0 >= hoverIndex.value + 0.5 && thisIndex >= activeIndex.value);
      if (isAfterHover) translateY1 = DRAWER_DRAGGABLE_HEIGHT;
    }
    //Adjust the calendars below the moving one
    if (activeIndex.value !== null) {
      const isBeforeOriginal = thisIndex >= activeIndex.value;
      if (isBeforeOriginal) translateY2 = -DRAWER_DRAGGABLE_HEIGHT;
    }

    return {
      transform: [{ translateY: withSpring(translateY1 + translateY2) }],
      width: '100%',
      zIndex: 1,
      opacity: 1,
      backgroundColor: theme.isDark ? COLORS.background.mutedDark : COLORS.background.mutedLight,
    };
  });

  const dynamicBackgroundStyle = useMemo(() => {
    let backgroundColor = theme.isDark ? COLORS.background.mutedDark : COLORS.background.mutedLight;

    const isMatchingTransparent = viewMode === 'transparent' && cal.calendar?.visibility === 'transparent';
    const isMatchingIsolate = viewMode === 'isolate' && cal.calendar?.visibility === 'isolate';

    if (isMatchingTransparent || isMatchingIsolate) {
      backgroundColor = theme.isDark ? COLORS.background.dark : COLORS.background.light;
    }

    // Return a standard inline style object
    return { backgroundColor };
  }, [theme.isDark, viewMode, cal.calendar?.visibility]);

  const isolated = useMemo(() => {
    if (viewMode === 'default') return 'NA';
    if (viewMode === 'transparent' && cal.calendar?.visibility === 'transparent') return 'true';
    if (viewMode === 'isolate' && cal.calendar?.visibility === 'isolate') return 'true';
    return 'false';
  }, [viewMode, cal.calendar?.visibility]);

  return (
    <>
      {viewMode === 'default' ? (
        <>
          {cal.calendar === null ? (
            <Animated.View style={animatedStyle}>
              {/* --- FOLDER HEADER --- */}
              <FolderIndividual calId={cal.id} />
            </Animated.View>
          ) : (
            <GestureDetector gesture={gesture}>
              {/* --- CALENDAR INDIVIDUAL --- */}
              <Animated.View style={animatedStyle}>
                <CalendarDrawerList calendarObj={cal.calendar} onToggle={toggleCalendar} isolated={isolated} />
              </Animated.View>
            </GestureDetector>
          )}
        </>
      ) : (
        <>
          {cal.calendar === null ? (
            <View style={[dynamicBackgroundStyle, { borderRadius: 12 }]}>
              {/* --- FOLDER HEADER --- */}
              <FolderIndividual calId={cal.id} />
            </View>
          ) : (
            // --- CALENDAR INDIVIDUAL ---
            <View style={[dynamicBackgroundStyle, { borderRadius: 12 }]}>
              <Pressable
                onPress={() => {
                  if (viewMode === 'transparent' && cal.calendar) {
                    toggleTransparent(cal.calendar?.calendarId);
                  }
                  if (viewMode === 'isolate' && cal.calendar) {
                    toggleIsolate(cal.calendar?.calendarId);
                  }
                }}
              >
                <CalendarDrawerList calendarObj={cal.calendar} onToggle={toggleCalendar} isolated={isolated} />
              </Pressable>
            </View>
          )}
        </>
      )}
    </>
  );
}
