import { DRAWER_DRAGGABLE_HEIGHT } from '@/utility/constants';
import { calendarObj } from '@/utility/types';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { SharedValue, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import CalendarDrawerList from './drawer-calendar/drawer-calendar-individual';
import FolderIndividual from './drawer-folder/drawer-folder-individual';

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
      isDragging.value = false;
      hoverIndex.value = null;
      activeIndex.value = null;
      const yValue = (e.translationY / DRAWER_DRAGGABLE_HEIGHT) * DRAWER_DRAGGABLE_HEIGHT;

      offset.value = withSpring({ x: e.translationX, y: yValue }, { stiffness: 90 }, (isFinished: boolean | undefined) => {
        // Fires when the scrolling physically stops
        if (isFinished) {
          scheduleOnRN(() => onDrop(thisIndex, targetIndex));
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
          <FolderIndividual calId={cal.id} />
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
