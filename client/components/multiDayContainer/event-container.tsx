import { getEventCardStyles } from '@/components/multiDayContainer/multiDayStyles';
import { useEventColors } from '@/hooks/useEventColor';
import { EVENT_GAP } from '@/utility/constants';
import { getEventLayout } from '@/utility/eventUtils';
import { EventObj, EventWithLayout } from '@/utility/types';
import React, { memo, useMemo } from 'react';
import { Text, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import { useCalendarObjects } from '../contexts/calendar-obj-context';
import { useUIContext } from '../contexts/ui-context';
import { eventsAreEqual } from '../eventDetailsContainer/expanded-view';

export interface EventContainerProps {
  eventWithOffset: EventWithLayout;
  dayWidth: number;
  hourHeight: number;
  onSelect: (event: EventObj, e: any) => void;
  isVisible: boolean;
  selectedEventId: string | null;
  newEvent: boolean;
}

const lightStyles = getEventCardStyles(false);
const darkStyles = getEventCardStyles(true);

function EventContainer({ eventWithOffset, dayWidth, hourHeight, onSelect, isVisible, selectedEventId, newEvent }: EventContainerProps) {
  const { event, offset, maxOffset } = eventWithOffset;
  const { calendarObjs, calViewMode } = useCalendarObjects();
  const { theme, transparentOpacity } = useUIContext();
  const styles = theme.isDark ? darkStyles : lightStyles;

  //position
  const layout = useMemo(() => {
    return getEventLayout(eventWithOffset, offset, maxOffset, hourHeight, dayWidth);
  }, [event, offset, hourHeight, dayWidth]);

  //color
  const { rawColor, borderColor, textColor } = useEventColors(event.calendarId, newEvent);

  const opacity = useMemo(() => {
    const calId = eventWithOffset.event.calendarId;
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

  const selectedThisEvent = !!selectedEventId && isVisible && selectedEventId === event.id;
  const totalOffset = selectedThisEvent ? 300 : offset + 100;

  return (
    <>
      {newEvent ? (
        <Pressable
          onPress={(e) => onSelect(event, e)}
          delayLongPress={0}
          style={[
            styles.eventContainer,
            styles.newEvent,
            {
              ...layout,
              width: layout.width + EVENT_GAP,
              zIndex: 300,
              elevation: totalOffset,
            },
          ]}
          hitSlop={5}
        ></Pressable>
      ) : (
        <Pressable
          onPress={(e) => onSelect(event, e)}
          delayLongPress={0}
          style={[
            styles.eventContainer,
            {
              ...layout,
              zIndex: totalOffset,
              elevation: totalOffset,
              opacity: opacity,
            },
          ]}
          hitSlop={5}
        >
          {/* --- EVENT LEFT BAR --- */}
          <View
            style={[
              styles.event,
              {
                backgroundColor: rawColor,
                borderLeftWidth: 6,
                borderWidth: 0,
                borderLeftColor: borderColor,
                borderColor: borderColor,
                opacity: 1,
              },
              selectedThisEvent && { backgroundColor: borderColor, borderLeftColor: borderColor },
            ]}
          >
            {/* --- EVENT TITLE --- */}
            <Text
              style={[styles.eventText, { color: selectedThisEvent ? (theme.isDark ? textColor : rawColor) : textColor }]}
              numberOfLines={1}
            >
              {event.title}
            </Text>
          </View>
        </Pressable>
      )}
    </>
  );
}

// 2. Create the custom comparison function
const areEqual = (prevProps: EventContainerProps, nextProps: EventContainerProps) => {
  // Check layout-affecting props
  if (prevProps.dayWidth !== nextProps.dayWidth) return false;
  if (prevProps.hourHeight !== nextProps.hourHeight) return false;
  if (prevProps.isVisible !== nextProps.isVisible) return false;

  // Check if the event data itself changed
  if (!eventsAreEqual(prevProps.eventWithOffset.event, nextProps.eventWithOffset.event)) return false;
  if (prevProps.eventWithOffset.offset !== nextProps.eventWithOffset.offset) return false;
  if (prevProps.eventWithOffset.maxOffset !== nextProps.eventWithOffset.maxOffset) return false;

  // Check selection logic: Only re-render if THIS specific event's selection status changed
  const wasSelected = prevProps.selectedEventId === prevProps.eventWithOffset.event.id;
  const isSelected = nextProps.selectedEventId === nextProps.eventWithOffset.event.id;

  if (wasSelected !== isSelected) return false;

  // nothing of note has changed, thus skip rerender
  return true;
};

// Export the memoized component
export default memo(EventContainer, areEqual);
