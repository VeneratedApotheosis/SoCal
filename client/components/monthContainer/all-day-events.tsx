import { AllDayStyles, getAllDayChipStyles } from '@/components/multiDayContainer/multiDayStyles';
import { useEventColors } from '@/hooks/useEventColor';
import { EventObj, EventWithLayout } from '@/utility/types';
import React, { memo, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useCalendarObjects } from '../contexts/calendar-obj-context';
import { useUIContext } from '../contexts/ui-context';
import { eventsAreEqual } from '../eventDetailsContainer/expanded-view';

export interface Props {
  event: EventObj;
  day: Date;
  layout: EventWithLayout;
  handlePress: (event: EventObj, e: any) => void;
  dayWidth: number;
  selectedEventId: string | null;
  isDummy: boolean;
  idx: number;
  singleEvent?: boolean;
}

const darkStyles = getAllDayChipStyles(true);
const lightStyles = getAllDayChipStyles(false);

function AllDayEvents({ event, day, layout, handlePress, dayWidth, selectedEventId, isDummy, idx, singleEvent }: Props) {
  //console.log('creating event');
  const { theme, transparentOpacity } = useUIContext();
  const styles = theme.isDark ? darkStyles : lightStyles;
  const { calendarObjs, calViewMode } = useCalendarObjects();

  const selectedThisEvent = !!selectedEventId && selectedEventId === event.id;
  const { rawColor, borderColor, textColor } = useEventColors(event.calendarId);

  //length and position of event
  const { isStart, isEnd } = useMemo(() => {
    let isStart = false;
    let isEnd = false;
    let isMiddle = false;
    if (singleEvent) return { isStart: true, isEnd: true };
    if (layout.startDate.getTime() - day.getTime() < 86400000 && layout.startDate.getTime() - day.getTime() >= 0) isStart = true;
    if (layout.endDate.getTime() - day.getTime() <= 86400000 && layout.endDate.getTime() - day.getTime() > 0) isEnd = true;
    if (!isStart && !isEnd) isMiddle = true;
    return { isStart, isEnd, isMiddle };
  }, [layout, event]);
  const isolatedEvent = isStart && isEnd;
  const notAllDay = isolatedEvent && !event.allDay;

  //opacity for transparent and isolation
  const opacity = useMemo(() => {
    const calId = event.calendarId;
    const cal = calendarObjs?.find((c) => c.calendarId === calId);
    if (!cal) return 0;
    const equalsViewMode = cal.visibility === calViewMode;
    if (equalsViewMode && calViewMode === 'default') return 1;
    else if (equalsViewMode && calViewMode === 'isolate') return 1;
    else if (equalsViewMode && calViewMode === 'transparent') return transparentOpacity;
    if (!equalsViewMode && calViewMode === 'default')
      return 0; //shouldn't be possible anways
    else if (!equalsViewMode && calViewMode === 'isolate') return transparentOpacity;
    else if (!equalsViewMode && calViewMode === 'transparent') return 1;
    return 0;
  }, [calendarObjs, transparentOpacity]);

  const msPerDay = 86400000;
  const startMs = new Date(layout.startDate).setHours(0, 0, 0, 0);
  const endMs = layout.endDate ? new Date(layout.endDate).setHours(0, 0, 0, 0) : startMs;
  const currentMs = new Date(day).setHours(0, 0, 0, 0);

  let totalDays = Math.max(1, Math.round((endMs - startMs) / msPerDay) + 1);
  if (event.allDay) totalDays--;

  let width = dayWidth - AllDayStyles.marginHorizontalTotal * Number(isStart) - AllDayStyles.marginRight * Number(isEnd);
  if (isStart && !isEnd) {
    width = 1 * dayWidth + -1 * AllDayStyles.marginHorizontalTotal;
  }
  let textWidth = totalDays * width - 2 * AllDayStyles.marginHorizontalTotal - AllDayStyles.padding - 10;
  const marginLeft = 0 + AllDayStyles.marginLeft * Number(isStart);

  //later, will fix to not be animated
  const animatedStartStyle = useAnimatedStyle(() => {
    let totalDays = Math.max(1, Math.round((endMs - startMs) / msPerDay) + 1);
    if (event.allDay) totalDays--;

    const index = Math.round((startMs - currentMs) / msPerDay);
    let left = index * dayWidth + AllDayStyles.padding;
    if (!isStart) left = left + AllDayStyles.marginLeft + AllDayStyles.borderLeftWidth;

    return { opacity: 1, position: 'absolute', left: left };
  });

  const key = event.id + ' ' + idx + ' ' + layout.offset + ' ' + day.toISOString();

  return (
    <View style={{ overflow: 'hidden' }} key={key}>
      {isDummy ? (
        //DUMMY EVENT
        <View
          style={[
            styles.eventContainer,
            {
              width: dayWidth - AllDayStyles.marginHorizontalTotal * 2,
              marginLeft: AllDayStyles.marginLeft,
            },
          ]}
        ></View>
      ) : notAllDay ? (
        //NOT ALL DAY EVENT
        <Pressable
          onPress={(e: any) => handlePress(event, e)}
          style={[
            styles.eventContainer,
            {
              width: width,
              marginLeft: marginLeft,
              opacity: opacity,
              borderRadius: AllDayStyles.borderRadius,
            },
            selectedThisEvent && { backgroundColor: borderColor, borderLeftColor: borderColor },
          ]}
        >
          <View style={{ width: 6, height: 6, backgroundColor: borderColor, borderRadius: 999 }}></View>
          <Text
            style={[styles.eventText, { color: selectedThisEvent ? (theme.isDark ? textColor : rawColor) : textColor }]}
            numberOfLines={1}
          >
            {event.title}
          </Text>
        </Pressable>
      ) : (
        //NORMAL ALL DAY EVENT
        <Pressable
          onPress={(e: any) => handlePress(event, e)}
          style={[
            styles.eventContainer,
            {
              width: width,
              marginLeft: marginLeft,
              opacity: opacity,
            },
            { backgroundColor: rawColor, borderLeftColor: borderColor },
            isStart && {
              borderTopLeftRadius: AllDayStyles.borderRadius,
              borderBottomLeftRadius: AllDayStyles.borderRadius,
              borderLeftWidth: AllDayStyles.borderLeftWidth,
            },
            isEnd && {
              borderTopRightRadius: AllDayStyles.borderRadius,
              borderBottomRightRadius: AllDayStyles.borderRadius,
            },
            selectedThisEvent && { backgroundColor: borderColor, borderLeftColor: borderColor },
          ]}
        >
          {isolatedEvent ? (
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
            </>
          )}
        </Pressable>
      )}
    </View>
  );
}

const areEqual = (prevProps: Props, nextProps: Props) => {
  if (prevProps.dayWidth !== nextProps.dayWidth) return false;
  if (!eventsAreEqual(prevProps.event, nextProps.event)) return false;

  const wasSelected = prevProps.selectedEventId === prevProps.event.id;
  const isSelected = nextProps.selectedEventId === nextProps.event.id;
  if (wasSelected !== isSelected) return false;

  return true;
};

export default memo(AllDayEvents, areEqual);
