import { DRAWER_DRAGGABLE_HEIGHT } from '@/utility/constants';
import { toTitleCase } from '@/utility/drawerUtil';
import { calendarObj } from '@/utility/types';

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { SharedValue, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';
import CalendarDrawerList from './drawer-calendar-individual';

//Each Individual Calendar
export default function DraggableCalendar({
  cal,
  onDrop,
  toggleCalendar,
  thisIndex,
  hoverIndex,
  activeIndex,
}: {
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
}) {
  const isDragging = useSharedValue(false);
  const offset = useSharedValue({ x: 0, y: 0 });

  const gesture = Gesture.Pan()
    .shouldCancelWhenOutside(false)
    .onStart(() => {
      isDragging.value = true;
      activeIndex.value = thisIndex;
      hoverIndex.value = thisIndex;
    })
    .onUpdate((e) => {
      offset.value = { x: e.translationX, y: e.translationY };
      hoverIndex.value = thisIndex + e.translationY / DRAWER_DRAGGABLE_HEIGHT;
    })
    .onEnd((e) => {
      const targetIndex = hoverIndex.value !== null && hoverIndex.value >= 1 ? Math.round(hoverIndex.value) : 1;
      runOnJS(onDrop)(thisIndex, targetIndex);
      isDragging.value = false;
      hoverIndex.value = null;
      activeIndex.value = null;
      //offset.value = withSpring({ x: 0, y: 0 });
      offset.value = withSequence(
        // Stay exactly where the user let go for 200ms
        withSpring({ x: e.translationX, y: e.translationY }, { duration: 1000 }),
        // Then snap back to the "new" 0,0 origin
      );
    });

  //for animated view
  const animatedStyle = useAnimatedStyle(() => {
    // If this item is the one being dragged:
    if (isDragging.value) {
      return {
        transform: [{ translateX: 0 }, { translateY: offset.value.y }, { scale: 1.0 }],
        zIndex: 1000,
        opacity: 1,
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
      backgroundColor: 'white',
    };
  });

  return (
    <>
      {cal.calendar === null ? (
        <Animated.View style={animatedStyle}>
          {/* --- FOLDER HEADER --- */}
          <View style={styles.folderContainer}>
            <View style={styles.folderFront}>
              <Ionicons name={'folder-outline'} size={16} />
              <Text style={styles.sectionHeaderText}>{toTitleCase(cal.id)}</Text>
            </View>
            <View style={styles.folderFront}>
              <Ionicons name={'ellipsis-horizontal-outline'} size={16} />
              <Ionicons name={'caret-up-outline'} size={16} />
              <Ionicons name={'caret-down-outline'} size={16} />
            </View>
          </View>
        </Animated.View>
      ) : (
        <GestureDetector gesture={gesture}>
          {/* --- CALENDAR INDIVIDUAL --- */}
          <Animated.View style={[animatedStyle, { backgroundColor: 'white' }]}>
            <CalendarDrawerList calendarObj={cal.calendar} onToggle={toggleCalendar} />
          </Animated.View>
        </GestureDetector>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  folderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 16,
    height: DRAWER_DRAGGABLE_HEIGHT,
  },
  folderFront: {
    flexDirection: 'row',
    marginTop: 'auto',
    gap: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
