import { useEventColors } from '@/hooks/useEventColor';
import { PAST_BUFFER } from '@/utility/constants';
import { AllDayPool, EventObj, EventWithLayout } from '@/utility/types';
import React, { memo, useMemo } from 'react';
import { LogBox, Pressable, Text, View } from 'react-native';
import Animated, { SharedValue, useAnimatedReaction, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useUIContext } from '../contexts/ui-context';
import { eventsAreEqual } from '../eventDetailsContainer/expanded-view';
import { AllDayStyles, getAllDayChipStyles } from './multiDayStyles';

LogBox.ignoreLogs(['[Reanimated] ...']);

export interface AllDayChipProps {
  event: EventObj;
  day: Date;
  layout: EventWithLayout;
  handlePress: (event: EventObj) => void;
  dayWidth: number;
  isVisible: boolean;
  selectedEventId: string | null;
  isDummy: boolean;
  scrollX: SharedValue<number>;
  eventPool: SharedValue<AllDayPool[]>;
  widthsDictionary: Record<string, number>;
}

const darkStyles = getAllDayChipStyles(true);
const lightStyles = getAllDayChipStyles(false);

function AllDayChip({
  event,
  day,
  layout,
  handlePress,
  dayWidth,
  isVisible,
  selectedEventId,
  isDummy,
  scrollX,
  eventPool,
  widthsDictionary,
}: AllDayChipProps) {
  const { theme } = useUIContext();
  const styles = theme.isDark ? darkStyles : lightStyles;
  const isWeekend = useMemo(() => day.getDay() === 6 || day.getDay() === 0, [day]);

  const selectedThisEvent = !!selectedEventId && isVisible && selectedEventId === event.id;
  const { rawColor, borderColor, textColor } = useEventColors(event.calendarId);

  const { isStart, isEnd, isMiddle } = useMemo(() => {
    let isStart = false;
    let isEnd = false;
    let isMiddle = false;
    if (layout.startDate.getTime() - day.getTime() < 86400000 && layout.startDate.getTime() - day.getTime() >= 0) isStart = true;
    if (layout.endDate.getTime() - day.getTime() <= 86400000 && layout.endDate.getTime() - day.getTime() > 0) isEnd = true;
    if (!isStart && !isEnd) isMiddle = true;
    return { isStart, isEnd, isMiddle };
  }, [layout, event]);
  const islatedEvent = isStart && isEnd;

  const msPerDay = 86400000;
  const startMs = new Date(layout.startDate).setHours(0, 0, 0, 0);
  const endMs = layout.endDate ? new Date(layout.endDate).setHours(0, 0, 0, 0) : startMs;
  const today = new Date().setHours(0, 0, 0, 0);
  const isRegistered = useSharedValue<boolean>(false);
  const currentMs = new Date(day).setHours(0, 0, 0, 0);
  const xOffset = Math.round((today - startMs) / msPerDay) * dayWidth;

  let totalDays = Math.max(1, Math.round((endMs - startMs) / msPerDay) + 1);
  if (event.allDay) totalDays--;

  let width = dayWidth - AllDayStyles.marginHorizontalTotal * Number(isStart) - AllDayStyles.marginRight * Number(isEnd);
  if (isStart && !isEnd) {
    width = totalDays * dayWidth + -2 * AllDayStyles.marginHorizontalTotal;
  }
  let textWidth = totalDays * width - 2 * AllDayStyles.marginHorizontalTotal - AllDayStyles.padding - 10;
  const marginLeft = 0 + AllDayStyles.marginLeft * Number(isStart);

  const animatedStartStyle = useAnimatedStyle(() => {
    let totalDays = Math.max(1, Math.round((endMs - startMs) / msPerDay) + 1);
    if (event.allDay) totalDays--;

    const xPos = scrollX.value - PAST_BUFFER * dayWidth + xOffset;
    const index = Math.round((startMs - currentMs) / msPerDay);
    let left = index * dayWidth + AllDayStyles.padding;
    if (!isStart) left = left + AllDayStyles.marginLeft + AllDayStyles.borderLeftWidth;

    if (xPos > 0) return { opacity: 1, position: 'absolute', left: left };
    else return { opacity: 1, position: 'absolute', left: left };
  });

  const animatedEndStyle = useAnimatedStyle(() => {
    let totalDays = Math.max(1, Math.round((endMs - startMs) / msPerDay) + 1);
    if (event.allDay) totalDays--;
    const length = widthsDictionary[event.id] ?? 0;

    const xPos = scrollX.value - PAST_BUFFER * dayWidth + xOffset;
    const maxLength =
      totalDays * dayWidth - length - 2 * (AllDayStyles.marginHorizontalTotal + AllDayStyles.borderLeftWidth + AllDayStyles.padding);
    const index = Math.round((endMs - currentMs) / msPerDay);
    let left = length - index * dayWidth + AllDayStyles.padding;
    if (!isStart) left = left + AllDayStyles.marginLeft + AllDayStyles.borderLeftWidth;
    if (xPos < maxLength) {
      return { opacity: 0, position: 'absolute', left: -1 * left };
    } else return { opacity: 1, position: 'absolute', left: -1 * left };
  });

  useAnimatedReaction(
    () => {
      return scrollX.value;
    },
    (currentValue) => {
      if (islatedEvent) return;
      const xOffset = Math.round((today - startMs) / msPerDay) * dayWidth;
      const length = widthsDictionary[event.id] ?? 0;

      let totalDays = Math.max(1, Math.round((endMs - startMs) / msPerDay) + 1);
      if (event.allDay) totalDays--;

      const xPos = currentValue - PAST_BUFFER * dayWidth + xOffset;
      const maxLength =
        totalDays * dayWidth - length - 2 * (AllDayStyles.marginHorizontalTotal + AllDayStyles.borderLeftWidth + AllDayStyles.padding);
      const middle = xPos > 0 && xPos < maxLength;

      if (middle) {
        const currentPool = [...eventPool.value];
        const emptyIndex = currentPool[layout.offset].isActive;

        if (!emptyIndex) {
          currentPool[layout.offset] = {
            isActive: true,
            eventId: event.id,
            name: event.title,
            color: textColor,
            offset: layout.offset,
            length: 0,
          };
          eventPool.value = currentPool;
          isRegistered.value = true;
        }
      } else if (!middle) {
        const currentPool = [...eventPool.value];
        const myIndex = currentPool.findIndex((slot) => slot.eventId === event.id);

        if (myIndex !== -1) {
          currentPool[myIndex] = { isActive: false, eventId: '', name: '', color: '', offset: 0, length: 0 };
          eventPool.value = currentPool;
        }
      }
    },
    [scrollX],
  );

  return (
    <View style={{ overflow: 'hidden' }}>
      {isDummy ? (
        <View
          style={[
            styles.eventContainer,
            {
              width: dayWidth - AllDayStyles.marginHorizontalTotal * 2,
              marginLeft: AllDayStyles.marginLeft,
            },
          ]}
        ></View>
      ) : (
        <Pressable
          onPress={() => handlePress(event)}
          style={[
            styles.eventContainer,
            {
              width: width,
              marginLeft: marginLeft,
            },
            { backgroundColor: rawColor, borderLeftColor: borderColor },
            isStart && {
              borderRadius: AllDayStyles.borderRadius,
              borderLeftWidth: AllDayStyles.borderLeftWidth,
            },
            isEnd && {
              borderTopRightRadius: AllDayStyles.borderRadius,
              borderBottomRightRadius: AllDayStyles.borderRadius,
            },
            selectedThisEvent && { backgroundColor: borderColor, borderLeftColor: borderColor },
          ]}
        >
          {islatedEvent ? (
            // Isolated Event Text
            <Text
              style={[styles.eventText, { color: selectedThisEvent ? (theme.isDark ? textColor : rawColor) : textColor }]}
              numberOfLines={1}
            >
              {event.title}
            </Text>
          ) : (
            <>
              {/* --- start --- */}
              <Animated.View style={[animatedStartStyle]}>
                <Animated.Text
                  style={[
                    styles.eventText,
                    {
                      width: textWidth,
                      zIndex: 1,
                    },
                    { color: selectedThisEvent ? (theme.isDark ? textColor : rawColor) : textColor },
                  ]}
                  numberOfLines={1}
                >
                  {event.title}
                </Animated.Text>
              </Animated.View>
              {/* --- end --- */}
              {/* <Animated.Text
                style={[
                  styles.eventText,
                  selectedThisEvent && { color: rawColor },
                  //animatedEndStyle,
                  {
                    color: textColor,
                    width: 1000,
                    opacity: 0,
                    zIndex: 1,
                  },
                ]}
              >
                {event.title}
              </Animated.Text> */}
            </>
          )}
        </Pressable>
      )}
    </View>
  );
}

const areEqual = (prevProps: AllDayChipProps, nextProps: AllDayChipProps) => {
  if (prevProps.dayWidth !== nextProps.dayWidth) return false;
  if (prevProps.isVisible !== nextProps.isVisible) return false;
  if (!eventsAreEqual(prevProps.event, nextProps.event)) return false;

  const wasSelected = prevProps.selectedEventId === prevProps.event.id;
  const isSelected = nextProps.selectedEventId === nextProps.event.id;

  if (wasSelected !== isSelected) return false;

  return true;
};

export default memo(AllDayChip, areEqual);
